import assert from "node:assert/strict";
import test from "node:test";
import { createBookingUrl, validateBookingSearch } from "../src/lib/booking.ts";

const validSearch = { checkIn: "2099-09-18", checkOut: "2099-09-20", adults: 2, children: 0 };
const today = new Date("2026-09-01T09:00:00+05:30");

test("accepts a valid future booking search", () => {
  assert.deepEqual(validateBookingSearch(validSearch, today), { valid: true });
});

test("rejects checkout on the same day", () => {
  const result = validateBookingSearch({ ...validSearch, checkOut: validSearch.checkIn }, today);
  assert.equal(result.valid, false);
});

test("appends the verified search contract", () => {
  const url = createBookingUrl(validSearch, {
    baseUrl: "https://bookingengine.maximojo.com/?hid=India-hotel-id"
  });
  assert.equal(url.searchParams.get("hid"), "India-hotel-id");
  assert.equal(url.searchParams.get("checkin"), "2099-09-18");
  assert.equal(url.searchParams.get("checkout"), "2099-09-20");
  assert.equal(url.searchParams.get("nAdults"), "2");
  assert.equal(url.searchParams.get("nChildrens"), "0");
  assert.equal(url.searchParams.has("adults"), false);
  assert.equal(url.searchParams.has("children"), false);
  assert.equal(url.searchParams.has("rooms"), false);
  assert.equal(url.searchParams.has("nRooms"), false);
});

test("encodes a promo code and verified room code", () => {
  const url = createBookingUrl(
    { ...validSearch, promoCode: "ROYAL STAY", roomCode: "DLX-TWIN" },
    { baseUrl: "https://bookingengine.maximojo.com/?hid=India-hotel-id" }
  );
  assert.equal(url.searchParams.get("promocode"), "ROYAL STAY");
  assert.equal(url.searchParams.get("roomcode"), "DLX-TWIN");
  assert.match(url.href, /promocode=ROYAL\+STAY/);
});

test("removes legacy guessed keys from the base URL", () => {
  const url = createBookingUrl(validSearch, {
    baseUrl: "https://bookingengine.maximojo.com/?hid=India-hotel-id&adults=9&children=4&rooms=2&promo=OLD&nRooms=2"
  });
  for (const parameter of ["adults", "children", "rooms", "promo", "nRooms"]) {
    assert.equal(url.searchParams.has(parameter), false);
  }
});

test("rejects invalid occupancy", () => {
  assert.equal(validateBookingSearch({ ...validSearch, adults: 0 }, today).valid, false);
  assert.equal(validateBookingSearch({ ...validSearch, children: 9 }, today).valid, false);
});

test("one-night stays remain valid while impossible dates and fractional guests fail",()=>{
  assert.equal(validateBookingSearch({...validSearch,checkOut:"2099-09-19"},today).valid,true);
  assert.equal(validateBookingSearch({...validSearch,checkIn:"2099-02-30"},today).valid,false);
  assert.equal(validateBookingSearch({...validSearch,adults:1.5},today).valid,false);
  assert.equal(validateBookingSearch({...validSearch,children:0.5},today).valid,false);
});
