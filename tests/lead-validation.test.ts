import assert from "node:assert/strict";
import test from "node:test";
import { validateEventLead } from "../worker/lead-validation.ts";

const valid = { name: "Aarav Sharma", phone: "+91 98765 43210", email: "aarav@example.com", eventType: "Wedding", tentativeDate: "2099-02-14", guestCount: 300, preferredVenue: "Jeja Bagh", message: "Two-day celebration", consent: true, submissionId: "5a254f50-4f06-4e92-a70a-f22433b33338" };

test("accepts a complete event lead", () => {
  assert.equal(validateEventLead(valid).ok, true);
});

test("rejects a honeypot submission", () => {
  assert.equal(validateEventLead({ ...valid, website: "spam.example" }).ok, false);
});

test("rejects invalid email", () => {
  assert.equal(validateEventLead({ ...valid, email: "not-an-email" }).ok, false);
});

test("rejects impossible guest counts", () => {
  assert.equal(validateEventLead({ ...valid, guestCount: 9000 }).ok, false);
});

test("rejects event types and venues outside the published choices", () => {
  assert.equal(validateEventLead({ ...valid, eventType: "Injected event" }).ok, false);
  assert.equal(validateEventLead({ ...valid, preferredVenue: "Injected venue" }).ok, false);
});

test("rejects impossible and past calendar dates", () => {
  assert.equal(validateEventLead({ ...valid, tentativeDate: "2099-02-30" }).ok, false);
  assert.equal(validateEventLead({ ...valid, tentativeDate: "2020-01-01" }).ok, false);
});

test("rejects malformed submission IDs", () => {
  assert.equal(validateEventLead({ ...valid, submissionId: "not-a-uuid" }).ok, false);
});

test("rejects overlong values instead of silently truncating them", () => {
  assert.equal(validateEventLead({ ...valid, message: "x".repeat(2001) }).ok, false);
});

test("keeps submission IDs optional for backwards-compatible clients", () => {
  const { submissionId: _, ...legacyLead } = valid;
  assert.equal(validateEventLead(legacyLead).ok, true);
});
