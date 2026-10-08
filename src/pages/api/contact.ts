import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleContact, type ContactEnv } from "../../lib/contact";
import { business } from "../../data/business";

// This route needs to run server-side (the rest of the site is prerendered).
export const prerender = false;

// The form posts here two ways: fetch() with JSON (normal path, wants a JSON
// reply) or a plain HTML form post if the page script failed (wants a page).
// Either way the submission travels in the request body, never the URL.

function noScriptErrorPage(message: string, status: number) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Message not sent | ${business.displayName}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.6">
<h1>Your message was not sent</h1><p>${message}</p>
<p>Please call us at <a href="${business.phoneHref}">${business.phone}</a>, or <a href="/contact">go back to the contact page</a> and try again.</p>
</body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = (request.headers.get("Accept") ?? "").includes("application/json");
  const contentType = request.headers.get("Content-Type") ?? "";

  let raw: Record<string, unknown>;
  try {
    raw = contentType.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return wantsJson
      ? Response.json({ error: "Invalid request" }, { status: 400 })
      : noScriptErrorPage("The form data could not be read.", 400);
  }

  const result = await handleContact(raw, env as unknown as ContactEnv, request.headers.get("CF-Connecting-IP"));

  if (wantsJson) {
    return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error }, { status: result.status });
  }
  return result.ok
    ? new Response(null, { status: 303, headers: { Location: "/contact/sent" } })
    : noScriptErrorPage(result.error, result.status);
};
