// Swappable booking submission handler.
//
// Preferred path: POST to the DojoForge lead-capture endpoint (set
// DOJOFORGE_BASE_URL and DOJOFORGE_LEAD_KEY — see below, both are read
// server-side only and must never reach the browser).
// Fallback path: insert into our own Neon table (connection TODO, pending Nic).
// Either way, an immediate SMS to the school is non-negotiable per the brief —
// lead response speed is the highest-leverage factor in this funnel.

export interface BookingPayload {
  parentName: string;
  phone: string;
  email: string;
  studentName: string;
  studentAge: string;
  classId: string;
  className: string;
  ageLabel: string;
  classTime: string;
  date: string; // YYYY-MM-DD
}

export interface BookingEnv {
  // DojoForge lead-capture integration. Base URL has no trailing slash
  // requirement (it's stripped below); the key is a secret and must only
  // ever be read here, server-side — see README/local + Cloudflare setup
  // notes wherever this env var is documented for the team.
  DOJOFORGE_BASE_URL?: string;
  DOJOFORGE_LEAD_KEY?: string;
  // TODO: Neon connection string, once Nic provisions the fallback table.
  DATABASE_URL?: string;
  // TODO: SMS provider credentials (e.g. Twilio), once chosen.
  SMS_PROVIDER_TOKEN?: string;
  SCHOOL_SMS_NUMBER?: string;
}

// NOTE: the field names on the right below (parent_name, student_name, etc.)
// are a best-effort mapping to a typical lead-capture shape. DojoForge's
// actual request schema was not available while wiring this up — confirm
// the exact field names (and whether nesting/casing differs) against
// DojoForge's API docs before relying on this in production, and update
// this mapping if it doesn't match.
function toDojoForgeLead(payload: BookingPayload) {
  return {
    parent_name: payload.parentName,
    phone: payload.phone,
    email: payload.email,
    student_name: payload.studentName,
    student_age: payload.studentAge,
    class_id: payload.classId,
    class_name: payload.className,
    age_label: payload.ageLabel,
    class_time: payload.classTime,
    requested_date: payload.date,
  };
}

async function postToDojoForge(payload: BookingPayload, env: BookingEnv): Promise<boolean> {
  if (!env.DOJOFORGE_BASE_URL || !env.DOJOFORGE_LEAD_KEY) {
    console.error(
      "[submitBooking] DojoForge not configured (missing DOJOFORGE_BASE_URL and/or " +
        "DOJOFORGE_LEAD_KEY) — lead NOT sent to DojoForge:",
      payload
    );
    return false;
  }

  const endpoint = `${env.DOJOFORGE_BASE_URL.replace(/\/+$/, "")}/api/integrations/leads`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dojo-forge-lead-key": env.DOJOFORGE_LEAD_KEY,
      },
      body: JSON.stringify(toDojoForgeLead(payload)),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable body>");
      console.error(
        `[submitBooking] DojoForge lead POST failed: ${res.status} ${res.statusText}`,
        "response:", body,
        "payload:", payload
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[submitBooking] DojoForge lead POST threw an error:", err, "payload:", payload);
    return false;
  }
}

// TODO: replace with a real Neon insert once DATABASE_URL is available.
// Keeping this as an explicit stub (rather than a silent no-op) so a missing
// fallback path fails loudly in logs instead of quietly dropping a lead.
async function insertBookingFallback(payload: BookingPayload, env: BookingEnv): Promise<void> {
  if (!env.DATABASE_URL) {
    console.error("[submitBooking] No DATABASE_URL configured — booking not persisted:", payload);
    return;
  }
  console.warn("[submitBooking] TODO: insert booking into Neon", payload);
}

// TODO: wire to a real SMS provider once one is chosen. This is the
// non-negotiable part of the flow per the brief — every booking must trigger
// an immediate text to the school, regardless of which path above ran.
async function notifySMS(payload: BookingPayload, env: BookingEnv): Promise<void> {
  if (!env.SMS_PROVIDER_TOKEN || !env.SCHOOL_SMS_NUMBER) {
    console.error(
      "[submitBooking] SMS not configured — immediate notification NOT sent for booking:",
      payload
    );
    return;
  }
  console.warn("[submitBooking] TODO: send SMS via configured provider", payload);
}

export async function submitBooking(payload: BookingPayload, env: BookingEnv): Promise<void> {
  const delivered = await postToDojoForge(payload, env);

  if (!delivered) {
    await insertBookingFallback(payload, env);
  }

  await notifySMS(payload, env);
}
