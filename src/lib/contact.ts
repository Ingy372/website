// Contact-form submission pipeline: validate → spam checks → deliver by
// email → backup log. Every failure is reported back to the caller so the
// form shows "please call us" instead of silently dropping an inquiry.
//
// Configuration (wrangler.jsonc vars and bindings; the secret lives only in
// the Cloudflare dashboard, never in git):
//   EMAIL                 send_email binding. Uses Cloudflare Email Routing
//                         (free): the Worker can send to a *verified*
//                         destination address on the actionzonecma.com zone.
//   CONTACT_TO_EMAIL      inbox that receives website inquiries (a verified
//                         Email Routing destination address)
//   CONTACT_FROM_EMAIL    sender on the Email Routing domain, website@actionzonecma.com
//   TURNSTILE_SECRET_KEY  Turnstile secret (Worker secret). While it is unset,
//                         the form still sends (honeypot + rate limit only) and
//                         logs a warning; once set, Turnstile is enforced.
//                         Local dev can use Cloudflare's always-pass test
//                         secret 1x0000000000000000000000000000000AA.
//   CONTACT_RATE_LIMIT    ratelimits binding (wrangler.jsonc), per client IP.
//   CONTACT_LOG           optional KV namespace; when bound, every submission is
//                         also stored for 90 days as a backup copy.

import { EmailMessage } from "cloudflare:email";

// Topic options. Values are stable (used by ?interest= links and reports);
// labels are what the visitor sees.
export const INTERESTS = [
  { value: "trial-question", label: "Free trial / class question" },
  { value: "birthday-party", label: "Birthday Party" },
  { value: "parents-night-out", label: "Parents Night Out" },
  { value: "demo", label: "Demo team / school visit" },
  { value: "other", label: "Something else" },
] as const;

export const HEARD_FROM = [
  { value: "google", label: "Google search" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "friend-family", label: "A friend or family member" },
  { value: "drove-by", label: "Drove by" },
  { value: "demo-event", label: "A demo or community event" },
  { value: "other", label: "Other" },
] as const;

/** Hidden first-touch attribution fields (filled from the visitor's first landing). */
export const ATTRIBUTION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "landing_page",
  "referrer",
] as const;

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  message: 2000,
  interest: 40,
  heardFrom: 40,
  preferredDate: 10,
  childAge: 10,
  guestCount: 10,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  utm_term: 200,
  utm_content: 200,
  gclid: 300,
  fbclid: 300,
  landing_page: 500,
  referrer: 500,
} as const;

export type ContactField = keyof typeof LIMITS;
export type ContactSubmission = Record<ContactField, string>;

/** Name of the hidden honeypot input. Real visitors never fill it. */
export const HONEYPOT_FIELD = "company_website";

interface SendEmailBinding {
  send(message: EmailMessage): Promise<void>;
}

export interface ContactEnv {
  EMAIL?: SendEmailBinding;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_RATE_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  CONTACT_LOG?: { put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> };
}

export type ContactResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 429 | 502 | 503; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSubmission(raw: Record<string, unknown>): { data?: ContactSubmission; error?: string } {
  const data = {} as ContactSubmission;
  for (const field of Object.keys(LIMITS) as ContactField[]) {
    const value = typeof raw[field] === "string" ? (raw[field] as string).trim() : "";
    if (value.length > LIMITS[field]) return { error: `${field} is too long` };
    data[field] = value;
  }
  if (data.interest && !INTERESTS.some((i) => i.value === data.interest)) return { error: "Unknown topic" };
  if (data.heardFrom && !HEARD_FROM.some((h) => h.value === data.heardFrom)) return { error: "Unknown option" };
  if (!data.name || !data.email) return { error: "Name and email are required" };
  // The message is optional once a topic is chosen.
  if (!data.message && !data.interest) return { error: "Please add a message or choose what it's about" };
  if (!EMAIL_RE.test(data.email)) return { error: "Please enter a valid email address" };
  return { data };
}

async function verifyTurnstile(token: string, ip: string | null, secret: string): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (err) {
    console.error("[contact] Turnstile verification request failed:", err);
    return false;
  }
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

/** UTF-8 → base64, wrapped at 76 characters (RFC 2045). */
function base64Utf8(s: string, wrap = true) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return wrap ? b64.replace(/.{1,76}/g, "$&\r\n").trimEnd() : b64;
}

/** RFC 2047 encoded-word for header text that may hold non-ASCII. */
const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${base64Utf8(s, false)}?=`);

/** Strip anything that could break out of an address header. */
const safeAddress = (s: string) => s.replace(/[\r\n<>",;]/g, "").trim();

/** Plain-text email as raw MIME, for the send_email binding. */
function buildMime(m: { from: string; fromName: string; to: string; replyTo: string; subject: string; text: string }) {
  const domain = m.from.split("@")[1] ?? "actionzonecma.com";
  const headers = [
    `From: ${encodeHeader(m.fromName)} <${safeAddress(m.from)}>`,
    `To: <${safeAddress(m.to)}>`,
    `Reply-To: <${safeAddress(m.replyTo)}>`,
    `Subject: ${encodeHeader(oneLine(m.subject))}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${base64Utf8(m.text)}\r\n`;
}

const labelOf = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((o) => o.value === value)?.label ?? value;

function formatEmail(d: ContactSubmission) {
  const topic = d.interest ? labelOf(INTERESTS, d.interest) : "";
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["About", topic],
    ["Preferred date", d.preferredDate],
    ["Child's age", d.childAge],
    ["Guest count", d.guestCount],
    ["Heard about us from", d.heardFrom ? labelOf(HEARD_FROM, d.heardFrom) : ""],
  ];
  const details = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  const attribution = ATTRIBUTION_FIELDS.filter((f) => d[f]).map((f) => `${f}: ${d[f]}`).join("\n");
  return {
    subject: oneLine(`Website inquiry from ${d.name}${topic ? ` (${topic})` : ""}`),
    text:
      `${details}\n\nMessage:\n${d.message || "(none)"}` +
      (attribution ? `\n\nFirst visit (how they found the site):\n${attribution}` : "") +
      `\n\nSent from the contact form on actionzonecma.com`,
  };
}

async function backupLog(env: ContactEnv, d: ContactSubmission, delivered: boolean) {
  const record = JSON.stringify({ receivedAt: new Date().toISOString(), delivered, ...d });
  if (env.CONTACT_LOG) {
    try {
      await env.CONTACT_LOG.put(`contact:${Date.now()}:${crypto.randomUUID()}`, record, { expirationTtl: 60 * 60 * 24 * 90 });
      return;
    } catch (err) {
      console.error("[contact] Backup KV write failed:", err);
    }
  }
  // Last resort: Workers Logs (observability is enabled in wrangler.jsonc).
  if (!delivered) console.error("[contact] UNDELIVERED inquiry (backup copy):", record);
}

export async function handleContact(
  raw: Record<string, unknown>,
  env: ContactEnv,
  ip: string | null
): Promise<ContactResult> {
  if (env.CONTACT_RATE_LIMIT) {
    const { success } = await env.CONTACT_RATE_LIMIT.limit({ key: ip ?? "unknown" });
    if (!success) return { ok: false, status: 429, error: "Too many messages. Please wait a minute or call us." };
  }

  // Bots that fill the honeypot get a normal-looking success and nothing is sent.
  if (typeof raw[HONEYPOT_FIELD] === "string" && raw[HONEYPOT_FIELD] !== "") return { ok: true };

  const { data, error } = parseSubmission(raw);
  if (!data) return { ok: false, status: 400, error: error! };

  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof raw["cf-turnstile-response"] === "string" ? (raw["cf-turnstile-response"] as string) : "";
    if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY))) {
      return { ok: false, status: 403, error: "We couldn't verify the form. Please try again." };
    }
  } else {
    console.warn("[contact] TURNSTILE_SECRET_KEY is not set; accepting with honeypot + rate limit only.");
  }

  if (!env.EMAIL || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error("[contact] Email delivery is not configured (EMAIL binding, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL).");
    await backupLog(env, data, false);
    return { ok: false, status: 503, error: "The contact form is not set up yet." };
  }

  const { subject, text } = formatEmail(data);
  try {
    const raw = buildMime({
      from: env.CONTACT_FROM_EMAIL,
      fromName: "Action Zone website",
      to: env.CONTACT_TO_EMAIL,
      replyTo: data.email,
      subject,
      text,
    });
    await env.EMAIL.send(new EmailMessage(env.CONTACT_FROM_EMAIL, env.CONTACT_TO_EMAIL, raw));
  } catch (err) {
    console.error("[contact] Email send failed:", err);
    await backupLog(env, data, false);
    return { ok: false, status: 502, error: "Your message didn't go through." };
  }

  await backupLog(env, data, true);
  return { ok: true };
}
