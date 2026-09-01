import assert from "node:assert/strict";
import test from "node:test";
import { createBookingUrl, validateBookingSearch } from "../src/lib/booking.ts";

const validSearch = { checkIn: "2026-09-18", checkOut: "2026-09-20", adults: 2, children: 0, rooms: 1 };
const today = new Date("2026-09-01T09:00:00+05:30");

test("accepts a valid future booking search", () => {
  assert.deepEqual(validateBookingSearch(validSearch, today), { valid: true });
});

test("rejects checkout on the same day", () => {
  const result = validateBookingSearch({ ...validSearch, checkOut: validSearch.checkIn }, today);
  assert.equal(result.valid, false);
});

test("does not append unverified parameters", () => {
  const url = createBookingUrl(validSearch, { baseUrl: "https://example.com/book", supportsSearch: false });
  assert.equal(url.href, "https://example.com/book");
});

test("appends the verified search contract", () => {
  const url = createBookingUrl(validSearch, { baseUrl: "https://example.com/book", supportsSearch: true });
  assert.equal(url.searchParams.get("checkin"), "2026-09-18");
  assert.equal(url.searchParams.get("checkout"), "2026-09-20");
  assert.equal(url.searchParams.get("adults"), "2");
});
