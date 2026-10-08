import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { submitBooking, type BookingPayload, type BookingEnv } from "../../lib/submitBooking";

// This route needs to run server-side (the rest of the site is prerendered).
export const prerender = false;

function isValidPayload(body: unknown): body is BookingPayload {
  if (!body || typeof body !== "object") return false;
  const required = [
    "parentName",
    "phone",
    "email",
    "studentName",
    "studentAge",
    "classId",
    "className",
    "ageLabel",
    "classTime",
    "date",
  ] as const;
  return required.every((key) => typeof (body as Record<string, unknown>)[key] === "string" && (body as Record<string, unknown>)[key] !== "");
}

export const POST: APIRoute = async (context) => {
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  if (!isValidPayload(body)) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  await submitBooking(body, env as unknown as BookingEnv);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
