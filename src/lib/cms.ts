import { restoreItinerary } from "./itinerary";
import { createClient } from "@sanity/client";
import { fallbackSiteData } from "@/data/site";
import type { ImageAsset, SiteData } from "./types";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";

const client = projectId
  ? createClient({ projectId, dataset, apiVersion: "2026-08-31", useCdn: true })
  : null;

type CmsSiteData = Partial<SiteData>;

const mediaProjection = `{
  "id": _id,
  "src": image.asset->url,
  "alt": coalesce(image.alt, title, subject),
  category,
  subject,
  "orientation": coalesce(orientation, "landscape"),
  "focalPoint": "50% 50%",
  "peopleVisible": coalesce(peopleVisible, false),
  "rightsStatus": coalesce(rightsStatus, "verify"),
  "publishApproved": coalesce(publishApproved, false)
}`;

const referencedImageProjection = (category: ImageAsset["category"], subjectExpression: string) => `{
  "id": image->_id,
  "src": image->image.asset->url,
  "alt": coalesce(image->image.alt, image->title, ${subjectExpression}),
  "category": "${category}",
  "subject": coalesce(image->subject, ${subjectExpression}),
  "orientation": coalesce(image->orientation, "landscape"),
  "focalPoint": "50% 50%",
  "peopleVisible": coalesce(image->peopleVisible, false),
  "rightsStatus": coalesce(image->rightsStatus, "verify"),
  "publishApproved": coalesce(image->publishApproved, false)
}`;

const query = `{
  "clients": *[_type == "corporateClient" && status == "ready"] | order(order asc) { "id": slug.current, name, order, logo, sourceUrl, reviewedAt, status },
  "activities": *[_type == "activity" && active != false] | order(order asc) { "id": slug.current, name, categories, description, duration, block, bookingStatus, sourceUrl, bookingUrl, actionLabel, reviewedAt, note, variantOf },
  "itineraryTemplates": *[_type == "itineraryTemplate"] | order(nights asc) { nights, days[]{ earlyMorning, morning, afternoon, evening } },
  "rooms": *[_type == "room" && active != false] | order(order asc) {
    "slug": slug.current,
    name,
    "shortName": coalesce(shortName, name),
    eyebrow,
    description,
    size,
    bed,
    idealFor,
    bathroom,
    view,
    "bookingMode": coalesce(bookingMode, "online"),
    maximojoRoomCode, category, bedType, featureTags, tour,
    "image": ${referencedImageProjection("room", "name")},
    "gallery": gallery[]->${mediaProjection},
    "highlights": coalesce(highlights, []),
    "amenities": coalesce(amenities, []),
    "inclusions": coalesce(inclusions, [])
  },
  "dining": *[_type == "diningVenue" && active != false] | order(order asc) {
    "slug": slug.current,
    name,
    type,
    description,
    location,
    capacity,
    "image": ${referencedImageProjection("dining", "name")},
    "highlights": coalesce(highlights, [])
  },
  "venues": *[_type == "eventVenue" && active != false] | order(order asc) {
    "slug": slug.current,
    name,
    type,
    size,
    capacity,
    description,
    "image": ${referencedImageProjection("venue", "name")},
    journeys, capacities,
    "layouts": coalesce(layouts, [])
  },
  "amenities": *[_type == "amenity" && active != false] | order(order asc) {
    name,
    icon,
    description,
    "image": select(defined(image) => ${referencedImageProjection("wellness", "name")})
  },
  "media": *[
    _type == "mediaAsset" &&
    publishApproved == true &&
    rightsStatus in ["hotel-owned", "approved"]
  ] | order(category asc, subject asc) ${mediaProjection}
}`;

const hasApprovedImage = (value: { image?: ImageAsset }) => Boolean(
  value.image?.src &&
  value.image.publishApproved &&
  value.image.rightsStatus !== "verify"
);

function sanitizeCmsData(data: CmsSiteData): SiteData {
  const approvedMedia = (data.media || []).filter((asset) => asset.src && asset.publishApproved && asset.rightsStatus !== "verify");
  const media = [...fallbackSiteData.media.filter(asset => !approvedMedia.some(m => m.id === asset.id)), ...approvedMedia];
  const rooms = (data.rooms || [])
    .filter((room) => room.slug && room.name && hasApprovedImage(room))
    .map((room) => ({
      ...room,
      category: room.category || fallbackSiteData.rooms.find(r => r.slug === room.slug)?.category,
      bedType: room.bedType || fallbackSiteData.rooms.find(r => r.slug === room.slug)?.bedType,
      featureTags: room.featureTags || fallbackSiteData.rooms.find(r => r.slug === room.slug)?.featureTags || [],
      tour: room.slug === "presidential-suite" ? fallbackSiteData.rooms.find(r => r.slug === room.slug)?.tour : undefined,
      maximojoRoomCode: room.bookingMode === "assisted" ? undefined : room.maximojoRoomCode,
      gallery: (room.gallery || []).filter((asset) => media.some((item) => item.id === asset.id)).length ? (room.gallery || []).filter((asset) => media.some((item) => item.id === asset.id)) : [room.image]
    }));
  const dining = (data.dining || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue));
  const venues = (data.venues || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue)).map(venue => ({ ...venue,
    journeys: venue.journeys || fallbackSiteData.venues.find(v => v.slug === venue.slug)?.journeys || [],
    capacities: venue.capacities || fallbackSiteData.venues.find(v => v.slug === venue.slug)?.capacities || {}
  }));
  const amenities = (data.amenities || []).filter((amenity) => amenity.name && (!amenity.image || hasApprovedImage(amenity)));

  const clients = (data.clients || []).filter(client => fallbackSiteData.clients.some(c => c.id === client.id) && client.status === "ready").map(client => ({ ...client, logo: fallbackSiteData.clients.find(c => c.id === client.id)!.logo }));
  const validActivities = (data.activities || []).filter(a => a.id && a.name && Array.isArray(a.categories) && ["earlyMorning", "morning", "afternoon", "evening"].includes(a.block) && /^(https:\/\/|\/[^\/])/.test(a.sourceUrl || ""));
  // An incomplete CMS catalogue must not remove owner-requested experiences.
  const activities = fallbackSiteData.activities.map(fallback => {
    const activity = validActivities.find(a => a.id === fallback.id) || fallback;
    return { ...activity, bookingUrl: activity.bookingUrl && /^https:\/\//.test(activity.bookingUrl) ? activity.bookingUrl : undefined };
  });
  const itineraryTemplates = fallbackSiteData.itineraryTemplates.map(fallback => {
    const template = data.itineraryTemplates?.find(t => t.nights === fallback.nights);
    const restored = template && restoreItinerary({ ...template, version: 1, arrival: "", unscheduled: [] }, activities);
    return restored ? { nights: restored.nights, days: restored.days } : fallback;
  });
  return { rooms, dining, venues, amenities, media, clients: clients.length ? clients : fallbackSiteData.clients, activities, itineraryTemplates };
}

function validateProductionData(data: SiteData): SiteData {
  const referenced = [
    ...data.media,
    ...data.rooms.flatMap((room) => [room.image, ...room.gallery]),
    ...data.dining.map((venue) => venue.image),
    ...data.venues.map((venue) => venue.image),
    ...data.amenities.flatMap((amenity) => amenity.image ? [amenity.image] : [])
  ];
  const incomplete = !data.rooms.length || !data.dining.length || !data.venues.length || !data.amenities.length || !data.media.length;
  const unapproved = referenced.find((asset) => !asset?.src || !asset.publishApproved || asset.rightsStatus === "verify");
  if (incomplete || unapproved) throw new Error("Production content is incomplete or includes media that is not publication-approved.");
  return data;
}

export async function getSiteData(): Promise<SiteData> {
  const production = (import.meta.env.PUBLIC_SITE_STATUS || "staging") === "production";
  const localData = production ? validateProductionData(fallbackSiteData) : fallbackSiteData;
  if (!client) return localData;

  try {
    const cmsData = sanitizeCmsData(await client.fetch<CmsSiteData>(query));
    const complete = cmsData.rooms.length && cmsData.dining.length && cmsData.venues.length && cmsData.amenities.length && cmsData.media.length;
    if (!complete) return localData;
    return production ? validateProductionData(cmsData) : cmsData;
  } catch (error) {
    console.warn("Sanity content unavailable or incomplete; using approved repository content.", error);
    return localData;
  }
}
