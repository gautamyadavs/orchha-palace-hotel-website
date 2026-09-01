import type { BookingSearch } from "./types";

export type BookingValidation = { valid: true } | { valid: false; message: string };

export const DEFAULT_BOOKING_URL =
  "https://bookingengine.maximojo.com/?hid=India54468d49-cd5b-4af2-a615-303eda366eea";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function validateBookingSearch(search: BookingSearch, today = new Date()): BookingValidation {
  if (!isoDate.test(search.checkIn) || !isoDate.test(search.checkOut)) {
    return { valid: false, message: "Choose valid check-in and check-out dates." };
  }

  const checkIn = new Date(`${search.checkIn}T12:00:00`);
  const checkOut = new Date(`${search.checkOut}T12:00:00`);
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { valid: false, message: "Choose valid check-in and check-out dates." };
  }
  if (checkIn < localToday) return { valid: false, message: "Check-in cannot be in the past." };
  if (checkOut <= checkIn) return { valid: false, message: "Check-out must be after check-in." };
  if (search.adults < 1 || search.adults > 12) return { valid: false, message: "Choose between 1 and 12 adults." };
  if (search.children < 0 || search.children > 8) return { valid: false, message: "Choose between 0 and 8 children." };

  return { valid: true };
}

export function createBookingUrl(search: BookingSearch, options: { baseUrl: string }): URL {
  const validation = validateBookingSearch(search);
  if (!validation.valid) throw new Error(validation.message);

  const url = new URL(options.baseUrl);
  url.searchParams.set("checkin", search.checkIn);
  url.searchParams.set("checkout", search.checkOut);
  url.searchParams.set("nAdults", String(search.adults));
  url.searchParams.set("nChildrens", String(search.children));
  if (search.promoCode?.trim()) url.searchParams.set("promocode", search.promoCode.trim());
  else url.searchParams.delete("promocode");
  if (search.roomCode?.trim()) url.searchParams.set("roomcode", search.roomCode.trim());
  else url.searchParams.delete("roomcode");

  // Maximojo currently ignores nRooms and manages multi-room allocation in-engine.
  // Remove legacy or guessed keys so the handoff never implies they were preserved.
  for (const parameter of ["adults", "children", "rooms", "promo", "nRooms"]) {
    url.searchParams.delete(parameter);
  }
  return url;
}
