import type { APIRoute } from "astro";

// This route needs to run server-side (the rest of the site is prerendered).
export const prerender = false;

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  interest?: string;
  preferredDate?: string;
  childAge?: string;
  guestCount?: string;
}

function isValidPayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return typeof b.name === "string" && b.name !== "" && typeof b.email === "string" && b.email !== "" && typeof b.message === "string" && b.message !== "";
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

  // TODO: wire to Tarnished Labs or a branded inbox once confirmed. Logging
  // loudly for now so a submission is at least visible in deploy logs rather
  // than silently dropped.
  console.warn("[contact] New inquiry (not yet persisted anywhere):", body);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
