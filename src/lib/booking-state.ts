import type { BookingSearch } from "./types";

const key = "orchha_booking_v1";
export const emptyBooking: BookingSearch = { checkIn: "", checkOut: "", adults: 2, children: 0, promoCode: "" };
let memory = { ...emptyBooking };
export function readBooking(): BookingSearch {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    if (saved && typeof saved.checkIn === "string" && typeof saved.checkOut === "string") {
      memory = { checkIn: saved.checkIn, checkOut: saved.checkOut, adults: Number.isInteger(saved.adults) ? saved.adults : 2, children: Number.isInteger(saved.children) ? saved.children : 0, promoCode: typeof saved.promoCode === "string" ? saved.promoCode.slice(0, 40) : "" };
    }
  } catch { /* Memory remains usable when storage is unavailable. */ }
  return { ...memory };
}
export function saveBooking(value: BookingSearch) {
  memory = { ...value, roomCode: undefined };
  try { sessionStorage.setItem(key, JSON.stringify(memory)); } catch { /* Session-only fallback. */ }
  document.dispatchEvent(new CustomEvent("booking-state-changed", { detail: { ...memory } }));
}
export function addNights(value: string, nights: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + nights);
  return date.toISOString().slice(0, 10);
}
export function nightCount(checkIn: string, checkOut: string) {
  return Math.round((Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`)) / 86400000);
}
