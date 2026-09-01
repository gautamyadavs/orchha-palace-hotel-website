import { validateEventLead, type ValidLead } from "./lead-validation";

interface Env {
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  LEAD_FROM_EMAIL: string;
  LEAD_TO_EMAIL: string;
  LEAD_RATE_LIMIT?: KVNamespace;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
});

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character] as string));

async function verifyTurnstile(token: string, ip: string, env: Env) {
  if (env.ENVIRONMENT !== "production" && !env.TURNSTILE_SECRET_KEY) return true;
  if (!token || !env.TURNSTILE_SECRET_KEY) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = await response.json<{ success?: boolean }>();
  return result.success === true;
}

async function rateLimited(ip: string, env: Env) {
  if (!env.LEAD_RATE_LIMIT || !ip) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const key = `lead:${[...new Uint8Array(digest)].slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  const current = Number(await env.LEAD_RATE_LIMIT.get(key) || 0);
  if (current >= 5) return true;
  await env.LEAD_RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 3600 });
  return false;
}

async function sendEmail(env: Env, payload: Record<string, unknown>) {
  if (!env.RESEND_API_KEY) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}

async function deliverLead(lead: ValidLead, env: Env) {
  const safe = Object.fromEntries(Object.entries(lead).map(([key, value]) => [key, typeof value === "string" ? escapeHtml(value) : value])) as Record<string, string | number>;
  const subject = `New ${safe.eventType} enquiry · ${safe.guestCount} guests`;
  const staffHtml = `<h1>New event enquiry</h1><p><strong>Name:</strong> ${safe.name}</p><p><strong>Phone:</strong> ${safe.phone}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Event:</strong> ${safe.eventType}</p><p><strong>Date:</strong> ${safe.tentativeDate || "Not fixed"}</p><p><strong>Guests:</strong> ${safe.guestCount}</p><p><strong>Venue:</strong> ${safe.preferredVenue || "Help me choose"}</p><p><strong>Message:</strong><br>${String(safe.message || "No message").replace(/\n/g, "<br>")}</p>`;
  const guestHtml = `<h1>Thank you, ${safe.name}</h1><p>We have received your ${safe.eventType} enquiry for approximately ${safe.guestCount} guests.</p><p>The Orchha Palace events team will review the details and reply using the contact information you provided.</p><p>If the matter is urgent, call +91 95160 06201.</p>`;

  await Promise.all([
    sendEmail(env, { from: env.LEAD_FROM_EMAIL, to: env.LEAD_TO_EMAIL.split(",").map((item) => item.trim()), reply_to: lead.email, subject, html: staffHtml }),
    sendEmail(env, { from: env.LEAD_FROM_EMAIL, to: [lead.email], subject: "Your Orchha Palace event enquiry", html: guestHtml })
  ]);
}

async function handleLead(request: Request, env: Env) {
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed." }, 405);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 16_000) return json({ ok: false, message: "The enquiry is too large." }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid enquiry data." }, 400);
  }

  const validation = validateEventLead(body as Record<string, unknown>);
  if (!validation.ok) return json({ ok: false, message: validation.message }, 400);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (await rateLimited(ip, env)) return json({ ok: false, message: "Too many recent attempts. Please call or use WhatsApp." }, 429);
  if (!await verifyTurnstile(validation.value.turnstileToken, ip, env)) return json({ ok: false, message: "Please complete the security check and try again." }, 400);

  try {
    await deliverLead(validation.value, env);
    return json({ ok: true });
  } catch (error) {
    console.error("Event lead delivery failed", error instanceof Error ? error.message : error);
    return json({ ok: false, message: "We could not send the enquiry. Please use the call or WhatsApp options below." }, 503);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/event-leads") return handleLead(request, env);
    if (url.pathname === "/robots.txt" && env.ENVIRONMENT !== "production") {
      return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return env.ASSETS.fetch(request);
  }
};
