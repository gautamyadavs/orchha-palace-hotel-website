import assert from "node:assert/strict";
import test from "node:test";
import { handleLead, handleRequest, type Env } from "../worker/index.ts";

const origin = "https://gautamyadavs.github.io";
const endpoint = "https://orchha-palace-hotel.example.workers.dev/api/event-leads";
const validLead = {
  name: "Aarav Sharma",
  phone: "+91 98765 43210",
  email: "aarav@example.com",
  eventType: "Wedding",
  tentativeDate: "2099-02-14",
  guestCount: 300,
  preferredVenue: "Jeja Bagh",
  message: "Two-day celebration",
  consent: true,
  turnstileToken: "verified-token",
  submissionId: "5a254f50-4f06-4e92-a70a-f22433b33338"
};

type StoredEmail = Record<string, unknown>;

const makeEnv = (overrides: Partial<Env> = {}): Env => ({
  ASSETS: { fetch: async () => new Response("asset") } as unknown as Fetcher,
  ENVIRONMENT: "production",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  RESEND_API_KEY: "resend-secret",
  LEAD_FROM_EMAIL: "Orchha Palace <enquiries@updates.orchhapalace.com>",
  LEAD_TO_EMAIL: "sales@orchhapalace.com",
  LEAD_ALLOWED_ORIGINS: "https://gautamyadavs.github.io,https://orchhapalace.com,https://www.orchhapalace.com",
  LEAD_RATE_LIMIT: {
    get: async () => null,
    put: async () => undefined
  } as unknown as KVNamespace,
  ...overrides
});

const request = (requestOrigin = origin, body: unknown = validLead, method = "POST") => new Request(endpoint, {
  method,
  headers: {
    origin: requestOrigin,
    "content-type": "application/json",
    "CF-Connecting-IP": "203.0.113.18"
  },
  body: method === "POST" ? JSON.stringify(body) : undefined
});

const provider = (
  emails: StoredEmail[],
  failures: number[] = [],
  turnstile: { success?: boolean; hostname?: string; action?: string } = { success: true, hostname: "gautamyadavs.github.io", action: "event-enquiry" }
) => (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("siteverify")) return Response.json(turnstile);
  if (url.includes("api.resend.com")) {
    const index = emails.length;
    const email = JSON.parse(String(init?.body || "{}")) as StoredEmail;
    email._idempotencyKey = new Headers(init?.headers).get("idempotency-key");
    emails.push(email);
    return new Response(null, { status: failures.includes(index) ? 500 : 200 });
  }
  throw new Error(`Unexpected request: ${url}`);
}) as typeof fetch;

test("answers an allowed CORS preflight", async () => {
  const response = await handleLead(request(origin, undefined, "OPTIONS"), makeEnv(), provider([]));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
});

test("rejects an origin that is not an exact allow-list match", async () => {
  const response = await handleLead(request("https://gautamyadavs.github.io.evil.example"), makeEnv(), provider([]));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("accepts each configured preview and production origin", async () => {
  for (const allowed of ["https://gautamyadavs.github.io", "https://orchhapalace.com", "https://www.orchhapalace.com"]) {
    const response = await handleLead(request(allowed, undefined, "OPTIONS"), makeEnv(), provider([]));
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), allowed);
  }
});

test("rejects a production request without an origin", async () => {
  const withoutOrigin = new Request(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "CF-Connecting-IP": "203.0.113.18" },
    body: JSON.stringify(validLead)
  });
  const response = await handleLead(withoutOrigin, makeEnv(), provider([]));
  assert.equal(response.status, 403);
});

test("rejects invalid leads before delivery", async () => {
  const emails: StoredEmail[] = [];
  const response = await handleLead(request(origin, { ...validLead, email: "invalid" }), makeEnv(), provider(emails));
  assert.equal(response.status, 400);
  assert.equal(emails.length, 0);
});

test("sends every field to sales only with the guest as reply-to", async () => {
  const emails: StoredEmail[] = [];
  const response = await handleLead(request(), makeEnv(), provider(emails));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(emails.length, 2);
  assert.deepEqual(emails[0].to, ["sales@orchhapalace.com"]);
  assert.equal(emails[0].reply_to, validLead.email);
  assert.equal(emails[0]._idempotencyKey, `event-lead-staff-${validLead.submissionId}`);
  assert.match(String(emails[0].text), /Two-day celebration/);
  const staffHtml = String(emails[0].html);
  for (const value of [validLead.name, validLead.phone, validLead.email, validLead.eventType, validLead.tentativeDate, String(validLead.guestCount), validLead.preferredVenue, validLead.message]) {
    assert.match(staffHtml, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.deepEqual(emails[1].to, [validLead.email]);
  assert.equal(emails[1].reply_to, "sales@orchhapalace.com");
  assert.equal(emails[1]._idempotencyKey, `event-lead-guest-${validLead.submissionId}`);
});

test("reports failure when the critical sales delivery fails", async () => {
  const emails: StoredEmail[] = [];
  const response = await handleLead(request(), makeEnv(), provider(emails, [0]));
  assert.equal(response.status, 503);
  assert.equal((await response.json() as { ok: boolean }).ok, false);
  assert.equal(emails.length, 1);
});

test("fails closed if any recipient other than the sales inbox is configured", async () => {
  const emails: StoredEmail[] = [];
  const response = await handleLead(
    request(),
    makeEnv({ LEAD_TO_EMAIL: "sales@orchhapalace.com,reservations@orchhapalace.com" }),
    provider(emails)
  );
  assert.equal(response.status, 503);
  assert.equal(emails.length, 0);
});

test("does not fail or resend sales when the guest acknowledgement fails", async () => {
  const emails: StoredEmail[] = [];
  let acknowledgement: Promise<unknown> | undefined;
  const response = await handleLead(request(), makeEnv(), provider(emails, [1]), (task) => {
    acknowledgement = task;
  });
  assert.equal(response.status, 200);
  assert.equal(emails.length, 2);
  assert.deepEqual(emails[0].to, ["sales@orchhapalace.com"]);
  assert.ok(acknowledgement);
  await acknowledgement;
});

test("enforces the existing hourly rate limit", async () => {
  const emails: StoredEmail[] = [];
  const env = makeEnv({
    LEAD_RATE_LIMIT: {
      get: async () => "5",
      put: async () => undefined
    } as unknown as KVNamespace
  });
  const response = await handleLead(request(), env, provider(emails));
  assert.equal(response.status, 429);
  assert.equal(emails.length, 0);
});

test("fails closed in production when the rate-limit binding is missing", async () => {
  const response = await handleLead(request(), makeEnv({ LEAD_RATE_LIMIT: undefined }), provider([]));
  assert.equal(response.status, 503);
  assert.match(String((await response.json() as { message: string }).message), /protection is not configured/i);
});

test("fails closed when a required production secret is missing", async () => {
  const response = await handleLead(request(), makeEnv({ RESEND_API_KEY: undefined }), provider([]));
  assert.equal(response.status, 503);
  assert.equal((await response.json() as { ok: boolean }).ok, false);
});

test("rejects a Turnstile token issued for the wrong hostname", async () => {
  const response = await handleLead(request(), makeEnv(), provider([], [], { success: true, hostname: "evil.example", action: "event-enquiry" }));
  assert.equal(response.status, 400);
});

test("rejects a Turnstile token issued for the wrong action", async () => {
  const response = await handleLead(request(), makeEnv(), provider([], [], { success: true, hostname: "gautamyadavs.github.io", action: "login" }));
  assert.equal(response.status, 400);
});

test("returns JSON when Turnstile is unavailable", async () => {
  const unavailable = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("siteverify")) throw new Error("timeout");
    throw new Error("unexpected request");
  }) as typeof fetch;
  const response = await handleLead(request(), makeEnv(), unavailable);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
});

test("returns JSON when Resend is unavailable", async () => {
  const unavailable = (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("siteverify")) return Response.json({ success: true, hostname: "gautamyadavs.github.io", action: "event-enquiry" });
    if (url.includes("api.resend.com")) throw new Error("timeout");
    throw new Error("unexpected request");
  }) as typeof fetch;
  const response = await handleLead(request(), makeEnv(), unavailable);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
});

test("reuses stable provider idempotency keys for an ambiguous client retry", async () => {
  const emails: StoredEmail[] = [];
  await handleLead(request(), makeEnv(), provider(emails));
  await handleLead(request(), makeEnv(), provider(emails));
  assert.equal(emails[0]._idempotencyKey, emails[2]._idempotencyKey);
  assert.equal(emails[1]._idempotencyKey, emails[3]._idempotencyKey);
});

test("rejects an oversized body even without a content-length header", async () => {
  const oversized = new Request(endpoint, {
    method: "POST",
    headers: { origin, "content-type": "application/json", "CF-Connecting-IP": "203.0.113.18" },
    body: JSON.stringify({ ...validLead, padding: "x".repeat(17_000) })
  });
  const response = await handleLead(oversized, makeEnv(), provider([]));
  assert.equal(response.status, 413);
});

test("fails closed when KV is unavailable", async () => {
  const env = makeEnv({
    LEAD_RATE_LIMIT: {
      get: async () => { throw new Error("KV unavailable"); },
      put: async () => undefined
    } as unknown as KVNamespace
  });
  const response = await handleLead(request(), env, provider([]));
  assert.equal(response.status, 503);
});

test("fails closed when Cloudflare does not provide a client IP", async () => {
  const noIp = new Request(endpoint, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(validLead)
  });
  const response = await handleLead(noIp, makeEnv(), provider([]));
  assert.equal(response.status, 503);
});

test("rejects unsupported content types and methods", async () => {
  const textRequest = new Request(endpoint, { method: "POST", headers: { origin, "content-type": "text/plain" }, body: "hello" });
  assert.equal((await handleLead(textRequest, makeEnv(), provider([]))).status, 415);
  const getRequest = new Request(endpoint, { method: "GET" });
  const getResponse = await handleLead(getRequest, makeEnv(), provider([]));
  assert.equal(getResponse.status, 405);
  assert.equal(getResponse.headers.get("allow"), "POST, OPTIONS");
});

const context = { waitUntil() {} } as unknown as ExecutionContext;

test("redirects www to the canonical apex with path and query intact", async () => {
  const response = await handleRequest(new Request("https://www.orchhapalace.com/rooms/?offer=royal"), makeEnv(), context);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://orchhapalace.com/rooms/?offer=royal");
});

test("redirects indexed legacy routes permanently", async () => {
  const response = await handleRequest(new Request("https://orchhapalace.com/accommodation/?guests=2"), makeEnv(), context);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://orchhapalace.com/rooms/?guests=2");
});

test("adds security and path-aware cache headers to static assets", async () => {
  const response = await handleRequest(new Request("https://orchhapalace.com/_assets/site.hash.js"), makeEnv(), context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("keeps preflight workers.dev hosts out of search indexes", async () => {
  const response = await handleRequest(new Request("https://orchha-palace-hotel-preflight.example.workers.dev/robots.txt"), makeEnv(), context);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Disallow: \//);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});
