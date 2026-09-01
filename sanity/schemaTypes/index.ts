import { defineArrayMember, defineField, defineType } from "sanity";

const seoFields = [
  defineField({ name: "seoTitle", title: "SEO title", type: "string", validation: (rule) => rule.max(60) }),
  defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, validation: (rule) => rule.max(160) })
];

const imageWithAlt = {
  name: "image",
  title: "Primary image",
  type: "image",
  options: { hotspot: true },
  fields: [
    { name: "alt", title: "Alternative text", type: "string", validation: (rule: any) => rule.required() },
    { name: "caption", title: "Caption", type: "string" }
  ]
};

const approvedMediaReference = (name = "image", title = "Approved image") => defineField({
  name,
  title,
  type: "reference",
  to: [{ type: "mediaAsset" }],
  validation: (rule) => rule.required()
});

export const mediaAsset = defineType({
  name: "mediaAsset",
  title: "Approved media",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string", validation: (rule) => rule.required() }),
    defineField(imageWithAlt as any),
    defineField({ name: "category", title: "Category", type: "string", options: { list: ["property", "room", "dining", "wellness", "venue", "destination"] }, validation: (rule) => rule.required() }),
    defineField({ name: "subject", title: "Exact room, venue or subject", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "orientation", title: "Orientation", type: "string", options: { list: ["landscape", "portrait", "square"] } }),
    defineField({ name: "sourceDate", title: "Capture date", type: "date" }),
    defineField({ name: "peopleVisible", title: "Identifiable people visible", type: "boolean", initialValue: false }),
    defineField({ name: "rightsStatus", title: "Rights status", type: "string", options: { list: ["hotel-owned", "approved", "verify"] }, initialValue: "verify", validation: (rule) => rule.required() }),
    defineField({ name: "publishApproved", title: "Approved for website", type: "boolean", initialValue: false }),
    defineField({ name: "approvalNotes", title: "Approval notes", type: "text", rows: 3 })
  ],
  preview: { select: { title: "title", subtitle: "subject", media: "image" } }
});

export const room = defineType({
  name: "room",
  title: "Rooms & suites",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "shortName", title: "Short name", type: "string", description: "Used on compact room cards." }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (rule) => rule.required() }),
    defineField({ name: "active", title: "Visible", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "eyebrow", title: "Short positioning line", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "size", title: "Room size", type: "string" }),
    defineField({ name: "bed", title: "Bed configuration", type: "string" }),
    defineField({ name: "idealFor", title: "Ideal for", type: "string" }),
    defineField({ name: "bathroom", title: "Bathroom", type: "string" }),
    defineField({ name: "view", title: "View / aspect", type: "string" }),
    approvedMediaReference(),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "mediaAsset" }] })] }),
    defineField({ name: "highlights", title: "Highlights", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "amenities", title: "Amenities", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "inclusions", title: "Inclusions", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ...seoFields
  ]
});

export const diningVenue = defineType({
  name: "diningVenue",
  title: "Dining venues",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (rule) => rule.required() }),
    defineField({ name: "active", title: "Visible", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "type", title: "Cuisine / venue type", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "location", title: "Hotel location", type: "string" }),
    defineField({ name: "capacity", title: "Seating capacity", type: "string" }),
    approvedMediaReference(),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "mediaAsset" }] })] }),
    defineField({ name: "highlights", title: "Highlights", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ...seoFields
  ]
});

export const eventVenue = defineType({
  name: "eventVenue",
  title: "Event venues",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (rule) => rule.required() }),
    defineField({ name: "active", title: "Visible", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "type", title: "Venue type", type: "string", options: { list: ["Indoor", "Outdoor", "Boardroom"] } }),
    defineField({ name: "size", title: "Verified size", type: "string" }),
    defineField({ name: "capacity", title: "Verified capacity", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    approvedMediaReference(),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "mediaAsset" }] })] }),
    defineField({ name: "layouts", title: "Supported layouts", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ...seoFields
  ]
});

export const amenity = defineType({
  name: "amenity",
  title: "Amenities",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "active", title: "Visible", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "icon", title: "Phosphor icon name", type: "string", description: "Example: ph:swimming-pool" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Approved image", type: "reference", to: [{ type: "mediaAsset" }] })
  ]
});

export const offer = defineType({
  name: "offer",
  title: "Offers",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: false }),
    defineField({ name: "validFrom", title: "Valid from", type: "date" }),
    defineField({ name: "validUntil", title: "Valid until", type: "date" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "terms", title: "Terms", type: "array", of: [defineArrayMember({ type: "block" })] }),
    approvedMediaReference(),
    ...seoFields
  ]
});

export const policy = defineType({
  name: "policy",
  title: "Policies",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "body", title: "Policy text", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "reviewedAt", title: "Last reviewed", type: "date" }),
    ...seoFields
  ]
});

export const globalSettings = defineType({
  name: "globalSettings",
  title: "Global settings",
  type: "document",
  fields: [
    defineField({ name: "hotelName", title: "Hotel name", type: "string" }),
    defineField({ name: "bookingUrl", title: "Public booking-engine URL", type: "url" }),
    defineField({ name: "bookingSupportsSearch", title: "Booking engine accepts search parameters", type: "boolean", initialValue: false }),
    defineField({ name: "phone", title: "Primary phone", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp URL", type: "url" }),
    defineField({ name: "reservationsEmail", title: "Reservations email", type: "string" }),
    defineField({ name: "salesEmail", title: "Sales email", type: "string" }),
    defineField({ name: "address", title: "Address", type: "text", rows: 3 }),
    defineField({ name: "mapsUrl", title: "Google Maps URL", type: "url" })
  ]
});

export const schemaTypes = [mediaAsset, room, diningVenue, eventVenue, amenity, offer, policy, globalSettings];
