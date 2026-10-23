import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { parseBookingRequest, forwardToDojoForge, BOOKING_HONEYPOT } from "../../lib/bookingRequest";
import { business } from "../../data/business";

// Runs on the server (the rest of the site is prerendered).
export const prerender = false;

interface RateLimitEnv {
  CONTACT_RATE_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const errorPage = (message: string, status: number) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Request not sent | ${business.displayName}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.6">
<h1>Your request was not sent</h1><p>${message}</p>
<p style="font-size:1.25rem"><a href="${business.phoneHref}">Call ${business.phone}</a> and we'll book your visit right away.</p>
<p>Or <a href="/booking#booking-request">go back to the booking page</a> and try again.</p>
</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorPage("The form data could not be read.", 400);
  }

  // Bots fill the hidden field. Answer as if it worked, and send nothing.
  if (String(form.get(BOOKING_HONEYPOT) ?? "") !== "") {
    return new Response(null, { status: 303, headers: { Location: "/booking/sent" } });
  }

  const limiter = (env as unknown as RateLimitEnv).CONTACT_RATE_LIMIT;
  const ip = request.headers.get("CF-Connecting-IP");
  if (limiter && ip) {
    const { success } = await limiter.limit({ key: `booking:${ip}` });
    if (!success) return errorPage("Too many requests in a short time. Please wait a minute.", 429);
  }

  const { data, error } = parseBookingRequest(form);
  if (!data) return errorPage(escapeHtml(error ?? "Something was missing."), 400);

  const sent = await forwardToDojoForge(data, form);
  if (!sent) return errorPage("Our booking system didn't answer just now. That's on us, not you.", 502);

  // ?lead=1 tells the thank-you page to record the conversion once.
  return new Response(null, { status: 303, headers: { Location: "/booking/sent?lead=1" } });
};
