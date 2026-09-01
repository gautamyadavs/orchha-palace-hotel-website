export type LeadInput = {
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
};

export type ValidLead = {
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
};

export type LeadValidation = { ok: true; value: ValidLead } | { ok: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,30}$/;

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

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
  const guestCount = Number(input.guestCount);

  if (name.length < 2) return { ok: false, message: "Enter your name." };
  if (!phonePattern.test(phone)) return { ok: false, message: "Enter a valid phone number." };
  if (!emailPattern.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (!eventType) return { ok: false, message: "Choose an event type." };
  if (!Number.isInteger(guestCount) || guestCount < 2 || guestCount > 5000) return { ok: false, message: "Enter an expected guest count between 2 and 5,000." };
  if (tentativeDate && !/^\d{4}-\d{2}-\d{2}$/.test(tentativeDate)) return { ok: false, message: "Choose a valid tentative date." };
  if (input.consent !== true) return { ok: false, message: "Consent is required so the hotel can respond." };

  return {
    ok: true,
    value: { name, phone, email, eventType, tentativeDate, guestCount, preferredVenue, message, consent: true, turnstileToken }
  };
}
