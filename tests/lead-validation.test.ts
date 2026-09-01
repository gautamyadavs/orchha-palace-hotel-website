import assert from "node:assert/strict";
import test from "node:test";
import { validateEventLead } from "../worker/lead-validation.ts";

const valid = { name: "Aarav Sharma", phone: "+91 98765 43210", email: "aarav@example.com", eventType: "Wedding", tentativeDate: "2027-02-14", guestCount: 300, preferredVenue: "Jeja Bagh", message: "Two-day celebration", consent: true };

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
