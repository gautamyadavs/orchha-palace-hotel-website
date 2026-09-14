import { eventTypes, eventVenueNames } from "../src/lib/enquiry-options.ts";

export type LeadInput = {
  journey?: unknown;
  organisation?: unknown;
  functions?: unknown;
  seatingLayout?: unknown;
  avNeeds?: unknown;
  guestRooms?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  eventType?: unknown;
  tentativeDate?: unknown;
  guestCount?: unknown;
  preferredVenue?: unknown;
  message?: unknown;
  consent?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
  submissionId?: unknown;
};

export type ValidLead = {
  journey: string;
  organisation: string;
  functions: string;
  seatingLayout: string;
  avNeeds: string;
  guestRooms?: number;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  tentativeDate: string;
  guestCount: number;
  preferredVenue: string;
  message: string;
  consent: true;
  turnstileToken: string;
  submissionId: string;
};

export type LeadValidation = { ok: true; value: ValidLead } | { ok: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,30}$/;
const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const isRealDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};

const exceeds = (value: unknown, max: number) => typeof value === "string" && value.trim().length > max;

export function validateEventLead(input: LeadInput): LeadValidation {
  if (clean(input.website, 100)) return { ok: false, message: "The enquiry could not be submitted." };

  const name = clean(input.name, 100);
  const phone = clean(input.phone, 30);
  const email = clean(input.email, 160).toLowerCase();
  const eventType = clean(input.eventType, 100);
  const tentativeDate = clean(input.tentativeDate, 10);
  const preferredVenue = clean(input.preferredVenue, 100);
  const message = clean(input.message, 2000);
  const turnstileToken = clean(input.turnstileToken, 2048);
  const submissionId = clean(input.submissionId, 36).toLowerCase();
  const guestCount = Number(input.guestCount);
  const journey = clean(input.journey, 20);
  const organisation = clean(input.organisation, 160);
  const functions = clean(input.functions, 500);
  const seatingLayout = clean(input.seatingLayout, 30);
  const avNeeds = clean(input.avNeeds, 500);
  const guestRooms = input.guestRooms === undefined || input.guestRooms === "" || input.guestRooms === null ? undefined : Number(input.guestRooms);
  for (const key of ["journey", "organisation", "functions", "seatingLayout", "avNeeds"] as const) {
    if (input[key] !== undefined && typeof input[key] !== "string") return { ok: false, message: "Review your event requirements." };
  }
  if (exceeds(input.journey, 20) || exceeds(input.organisation, 160) || exceeds(input.functions, 500) || exceeds(input.seatingLayout, 30) || exceeds(input.avNeeds, 500)) return { ok: false, message: "One or more event requirements are too long." };
  if (journey && !["wedding", "corporate"].includes(journey)) return { ok: false, message: "Choose a valid event journey." };
  if (seatingLayout && !["Theatre", "Banquet", "Classroom", "Boardroom", "Outdoor"].includes(seatingLayout)) return { ok: false, message: "Choose a valid seating layout." };
  if (guestRooms !== undefined && (!Number.isInteger(guestRooms) || guestRooms < 0 || guestRooms > 500 || !["number", "string"].includes(typeof input.guestRooms))) return { ok: false, message: "Enter a room requirement between 0 and 500." };

  if (
    exceeds(input.name, 100) || exceeds(input.phone, 30) || exceeds(input.email, 160) ||
    exceeds(input.eventType, 100) || exceeds(input.tentativeDate, 10) ||
    exceeds(input.preferredVenue, 100) || exceeds(input.message, 2000) ||
    exceeds(input.turnstileToken, 2048) || exceeds(input.submissionId, 36)
  ) return { ok: false, message: "One or more enquiry fields are too long." };
  if (name.length < 2) return { ok: false, message: "Enter your name." };
  if (!phonePattern.test(phone)) return { ok: false, message: "Enter a valid phone number." };
  if (!emailPattern.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (!eventTypes.includes(eventType as (typeof eventTypes)[number])) return { ok: false, message: "Choose a valid event type." };
  if (!Number.isInteger(guestCount) || guestCount < 2 || guestCount > 5000) return { ok: false, message: "Enter an expected guest count between 2 and 5,000." };
  if (tentativeDate && (!/^\d{4}-\d{2}-\d{2}$/.test(tentativeDate) || !isRealDate(tentativeDate))) return { ok: false, message: "Choose a valid tentative date." };
  if (tentativeDate && tentativeDate < new Date().toISOString().slice(0, 10)) return { ok: false, message: "Choose today or a future tentative date." };
  if (preferredVenue && !eventVenueNames.includes(preferredVenue as (typeof eventVenueNames)[number])) return { ok: false, message: "Choose a valid preferred venue." };
  if (input.consent !== true) return { ok: false, message: "Consent is required so the hotel can respond." };
  if (submissionId && !submissionIdPattern.test(submissionId)) return { ok: false, message: "The enquiry session is invalid. Refresh the page and try again." };

  return {
    ok: true,
    value: { name, phone, email, eventType, tentativeDate, guestCount, preferredVenue, message, consent: true, turnstileToken, submissionId, journey, organisation, functions, seatingLayout, avNeeds, guestRooms }
  };
}
