// Backup trial-booking form (/booking, shown when the Dojo Forge widget
// can't load). It is a plain HTML form, so it works in every browser and
// in-app browser, with or without JavaScript. The server forwards each
// request to the same Dojo Forge lead endpoint the widget itself posts to
// (POST {widget origin}/api/widget/lead with the public tenant key), so
// leads from both paths land in the same Dojo Forge inbox.

import { dojoForge } from "../data/school";
import { programs, programIds, ageLabel, trialDays } from "../data/schedule";

export const BOOKING_HONEYPOT = "website";

export const PROGRAM_OPTIONS = programIds.map((id) => ({
  value: id,
  label: `${programs[id].name} (${ageLabel(programs[id])})`,
}));

export const DAY_OPTIONS = [...trialDays.map((d) => ({ value: d, label: d })), { value: "Any", label: "Any of those days" }];

const LIMITS = { name: 100, phone: 30, email: 254, program: 40, day: 20, studentAge: 3 } as const;
type Field = keyof typeof LIMITS;
export type BookingRequest = Record<Field, string>;

const ATTRIBUTION = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "landing_page", "referrer"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBookingRequest(form: FormData): { data?: BookingRequest; error?: string } {
  const data = {} as BookingRequest;
  for (const field of Object.keys(LIMITS) as Field[]) {
    const value = String(form.get(field) ?? "").trim();
    if (value.length > LIMITS[field]) return { error: `${field} is too long` };
    data[field] = value;
  }
  if (!data.name) return { error: "Please enter your name." };
  if (!data.phone && !data.email) return { error: "Please give us a phone number or an email address." };
  if (data.email && !EMAIL_RE.test(data.email)) return { error: "Please check the email address." };
  if (data.phone && data.phone.replace(/\D/g, "").length < 10) return { error: "Please check the phone number." };
  if (data.program && !PROGRAM_OPTIONS.some((o) => o.value === data.program)) return { error: "Please pick a program." };
  if (data.day && !DAY_OPTIONS.some((o) => o.value === data.day)) return { error: "Please pick a day." };
  if (data.studentAge && !/^\d{1,3}$/.test(data.studentAge)) return { error: "Please enter the student's age as a number." };
  return { data };
}

/** Sends the request to Dojo Forge. Returns true only on a 2xx reply. */
export async function forwardToDojoForge(data: BookingRequest, form: FormData): Promise<boolean> {
  const program = PROGRAM_OPTIONS.find((o) => o.value === data.program)?.label ?? "";
  const day = data.day === "Any" ? "Any day Monday through Thursday" : data.day;
  const attr = (k: (typeof ATTRIBUTION)[number]) => String(form.get(k) ?? "").slice(0, 2000) || undefined;

  const body = {
    key: dojoForge.publicKey,
    name: data.name,
    email: data.email,
    phone: data.phone,
    participants: data.studentAge ? [{ firstName: "Student", lastName: "", age: Number(data.studentAge) }] : [],
    bookingFor: "",
    programInterest: program,
    preferredTime: day ? `${day} (sent from the backup booking form)` : "Sent from the backup booking form",
    smsConsent: false,
    attribution: {
      source: attr("utm_source"),
      utmSource: attr("utm_source"),
      utmMedium: attr("utm_medium"),
      utmCampaign: attr("utm_campaign"),
      utmContent: attr("utm_content"),
      utmTerm: attr("utm_term"),
      landingPage: attr("landing_page"),
      referrer: attr("referrer"),
    },
    website: "",
  };

  const endpoint = `${new URL(dojoForge.widgetSrc).origin}/api/widget/lead`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // The full request is logged so a failed lead can be recovered from
      // the Worker logs (Cloudflare dashboard → Workers → Logs).
      console.error(`[booking-request] Dojo Forge replied ${res.status}: ${text}`, JSON.stringify(body));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking-request] Dojo Forge request failed:", err, JSON.stringify(body));
    return false;
  }
}
