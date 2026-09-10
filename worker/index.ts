import { validateEventLead, type ValidLead } from "./lead-validation.ts";
import { contact } from "../src/lib/contact.ts";

export interface Env {
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  LEAD_FROM_EMAIL: string;
  LEAD_TO_EMAIL: string;
  LEAD_ALLOWED_ORIGINS: string;
  LEAD_RATE_LIMIT?: KVNamespace;
}

type FetchLike = typeof fetch;
type Defer = (task: Promise<unknown>) => void;

const MAX_BODY_BYTES = 16_000;
const PRODUCTION_HOST = "orchhapalace.com";
const WWW_HOST = "www.orchhapalace.com";
const TURNSTILE_ACTION = "event-enquiry";
const UPSTREAM_TIMEOUT_MS = 10_000;

const siteSecurityHeaders: Record<string, string> = {
  "content-security-policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "upgrade-insecure-requests"
  ].join("; "),
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY"
};

const legacyRedirects = new Map<string, string>([
  ["/accommodation/", "/rooms/"],
  ["/rooms/standard-room-2/", "/rooms/standard-room/"],
  ["/facilities-2/", "/hotel-amenities/"],
  ["/why-visit-orchha/", "/explore-orchha/"],
  ["/meeting-conferences/", "/weddings-events/"],
  ["/meetings-incentives-conferences-events/", "/weddings-events/"],
  ["/weddings/", "/weddings-events/"],
  ["/wedding-blog/", "/weddings-events/"],
  ["/events/", "/weddings-events/"],
  ["/annajal/", "/dining/"],
  ["/dragon/", "/dining/"],
  ["/madira/", "/dining/"],
  ["/madira-bar/", "/dining/"],
  ["/dining-drinks/", "/dining/"],
  ["/hotel-term-condition/", "/booking-policies/"],
  ["/about-us/", "/"],
  ["/testimonials_new/", "/"],
  ["/blog/", "/explore-orchha/"],
  ["/concierge/", "/explore-orchha/"]
]);

const json = (body: unknown, status = 200, extraHeaders: HeadersInit = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...siteSecurityHeaders,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...Object.fromEntries(new Headers(extraHeaders).entries())
  }
});

const normalizedOrigins = (env: Env) => new Set(
  env.LEAD_ALLOWED_ORIGINS
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
);

export function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("origin");
  return origin && normalizedOrigins(env).has(origin) ? origin : null;
}

const corsHeaders = (origin: string) => ({
  "access-control-allow-origin": origin,
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
  vary: "Origin"
});

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character] as string));

async function verifyTurnstile(token: string, ip: string, origin: string | null, env: Env, requestFetch: FetchLike) {
  if (env.ENVIRONMENT !== "production" && !env.TURNSTILE_SECRET_KEY) return true;
  if (!token || !env.TURNSTILE_SECRET_KEY || !origin) return false;

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip });
  const response = await requestFetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Turnstile returned ${response.status}.`);

  const result = await response.json<{ success?: boolean; hostname?: string; action?: string }>();
  return result.success === true && result.hostname === new URL(origin).hostname && result.action === TURNSTILE_ACTION;
}

async function rateLimited(ip: string, env: Env) {
  if (!env.LEAD_RATE_LIMIT || !ip) throw new Error("Rate limiting is unavailable.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const key = `lead:${[...new Uint8Array(digest)].slice(0, 12).map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  const current = Number(await env.LEAD_RATE_LIMIT.get(key) || 0);
  if (current >= 5) return true;
  await env.LEAD_RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 3600 });
  return false;
}

async function sendEmail(env: Env, payload: Record<string, unknown>, idempotencyKey: string, requestFetch: FetchLike) {
  if (!env.RESEND_API_KEY) throw new Error("Email delivery is not configured.");
  const response = await requestFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "idempotency-key": idempotencyKey
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}

export async function deliverLead(lead: ValidLead, env: Env, requestFetch: FetchLike = fetch, defer?: Defer) {
  const submissionId = lead.submissionId || crypto.randomUUID();
  const safe = Object.fromEntries(Object.entries(lead).map(([key, value]) => [key, typeof value === "string" ? escapeHtml(value) : value])) as Record<string, string | number>;
  const subject = `New ${safe.eventType} enquiry · ${safe.guestCount} guests`;
  const staffText = [
    "New event enquiry",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Event: ${lead.eventType}`,
    `Date: ${lead.tentativeDate || "Not fixed"}`,
    `Guests: ${lead.guestCount}`,
    `Venue: ${lead.preferredVenue || "Help me choose"}`,
    `Message: ${lead.message || "No message"}`,
    `Submission ID: ${submissionId}`
  ].join("\n");
  const staffHtml = `<h1>New event enquiry</h1><p><strong>Name:</strong> ${safe.name}</p><p><strong>Phone:</strong> ${safe.phone}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Event:</strong> ${safe.eventType}</p><p><strong>Date:</strong> ${safe.tentativeDate || "Not fixed"}</p><p><strong>Guests:</strong> ${safe.guestCount}</p><p><strong>Venue:</strong> ${safe.preferredVenue || "Help me choose"}</p><p><strong>Message:</strong><br>${String(safe.message || "No message").replace(/\n/g, "<br>")}</p><p><small>Submission ID: ${submissionId}</small></p>`;
  const guestText = `Thank you, ${lead.name}.\n\nWe have received your ${lead.eventType} enquiry for approximately ${lead.guestCount} guests. The Orchha Palace sales team will review the details and reply using the contact information you provided.\n\nIf the matter is urgent, call ${contact.primaryPhone}.`;
  const guestHtml = `<h1>Thank you, ${safe.name}</h1><p>We have received your ${safe.eventType} enquiry for approximately ${safe.guestCount} guests.</p><p>The Orchha Palace sales team will review the details and reply using the contact information you provided.</p><p>If the matter is urgent, call ${contact.primaryPhone}.</p>`;
  const salesEmail = env.LEAD_TO_EMAIL.trim().toLowerCase();
  const fromEmail = env.LEAD_FROM_EMAIL.trim();
  if (salesEmail !== contact.salesEmail) throw new Error("The sales recipient is not configured correctly.");
  if (!/<enquiries@updates\.orchhapalace\.com>$/i.test(fromEmail)) throw new Error("The sender address is not configured correctly.");

  await sendEmail(env, {
    from: fromEmail,
    to: [salesEmail],
    reply_to: lead.email,
    subject,
    html: staffHtml,
    text: staffText
  }, `event-lead-staff-${submissionId}`, requestFetch);

  const acknowledgement = sendEmail(env, {
    from: fromEmail,
    to: [lead.email],
    reply_to: salesEmail,
    subject: "Your Orchha Palace event enquiry",
    html: guestHtml,
    text: guestText
  }, `event-lead-guest-${submissionId}`, requestFetch)
    .catch((error) => console.error("Guest enquiry acknowledgement failed", error instanceof Error ? error.message : error));
  if (defer) defer(acknowledgement);
  else await acknowledgement;
}

export async function handleLead(request: Request, env: Env, requestFetch: FetchLike = fetch, defer?: Defer) {
  const requestOrigin = request.headers.get("origin");
  const permittedOrigin = allowedOrigin(request, env);

  if (request.method !== "POST" && request.method !== "OPTIONS") {
    return json({ ok: false, message: "Method not allowed." }, 405, { allow: "POST, OPTIONS" });
  }
  if (!permittedOrigin && (env.ENVIRONMENT === "production" || requestOrigin)) {
    return json({ ok: false, message: "Origin not allowed." }, 403);
  }
  const responseHeaders = permittedOrigin ? corsHeaders(permittedOrigin) : {};
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...siteSecurityHeaders, ...responseHeaders } });

  if (env.ENVIRONMENT === "production" && (!env.LEAD_RATE_LIMIT || !env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY)) {
    return json({ ok: false, message: "Online enquiry protection is not configured. Please call or use WhatsApp." }, 503, responseHeaders);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, message: "The enquiry must be sent as JSON." }, 415, responseHeaders);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ ok: false, message: "The enquiry is too large." }, 413, responseHeaders);

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, message: "The enquiry is too large." }, 413, responseHeaders);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, message: "Invalid enquiry data." }, 400, responseHeaders);
  }

  const validation = validateEventLead(body as Record<string, unknown>);
  if (!validation.ok) return json({ ok: false, message: validation.message }, 400, responseHeaders);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  try {
    if (await rateLimited(ip, env)) return json({ ok: false, message: "Too many recent attempts. Please call or use WhatsApp." }, 429, responseHeaders);
  } catch (error) {
    console.error("Event lead rate limit failed", error instanceof Error ? error.message : error);
    return json({ ok: false, message: "Online enquiry protection is temporarily unavailable. Please call or use WhatsApp." }, 503, responseHeaders);
  }

  try {
    if (!await verifyTurnstile(validation.value.turnstileToken, ip, permittedOrigin, env, requestFetch)) {
      return json({ ok: false, message: "Please complete the security check and try again." }, 400, responseHeaders);
    }
  } catch (error) {
    console.error("Event lead security check failed", error instanceof Error ? error.message : error);
    return json({ ok: false, message: "The security check is temporarily unavailable. Please call or use WhatsApp." }, 503, responseHeaders);
  }

  try {
    await deliverLead(validation.value, env, requestFetch, defer);
    return json({ ok: true }, 200, responseHeaders);
  } catch (error) {
    console.error("Event lead delivery failed", error instanceof Error ? error.message : error);
    return json({ ok: false, message: "We could not confirm the enquiry. Please use the email, call or WhatsApp options below." }, 503, responseHeaders);
  }
}

const normalizedLegacyPath = (pathname: string) => {
  const lower = pathname.toLowerCase();
  return lower === "/" || lower.endsWith("/") ? lower : `${lower}/`;
};

function redirectResponse(location: string, status: 301 | 308) {
  return new Response(null, { status, headers: { ...siteSecurityHeaders, location, "cache-control": "public, max-age=3600" } });
}

function withSiteHeaders(response: Response, url: URL) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(siteSecurityHeaders)) headers.set(name, value);

  if (url.hostname.endsWith(".workers.dev")) headers.set("x-robots-tag", "noindex, nofollow");
  if (url.pathname.startsWith("/_assets/")) headers.set("cache-control", "public, max-age=31536000, immutable");
  else if (url.pathname.startsWith("/images/")) headers.set("cache-control", "public, max-age=604800, stale-while-revalidate=86400");
  else headers.set("cache-control", "public, max-age=0, must-revalidate");

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function handleRequest(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);

  if (url.hostname.toLowerCase() === WWW_HOST) {
    url.protocol = "https:";
    url.hostname = PRODUCTION_HOST;
    return redirectResponse(url.href, 308);
  }
  if (url.pathname === "/api/event-leads") return handleLead(request, env, fetch, (task) => context.waitUntil(task));

  const previewHost = url.hostname.endsWith(".workers.dev") || env.ENVIRONMENT !== "production";
  if (url.pathname === "/robots.txt" && previewHost) {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { ...siteSecurityHeaders, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" }
    });
  }

  const normalizedPath = normalizedLegacyPath(url.pathname);
  const oldRoom = normalizedPath.startsWith("/room/") ? normalizedPath.replace("/room/", "/rooms/") : null;
  const target = legacyRedirects.get(normalizedPath) || oldRoom;
  if (target && target !== normalizedPath) {
    const redirectUrl = new URL(target, `https://${PRODUCTION_HOST}`);
    redirectUrl.search = url.search;
    return redirectResponse(redirectUrl.href, 301);
  }

  return withSiteHeaders(await env.ASSETS.fetch(request), url);
}

export default {
  fetch: handleRequest
};
