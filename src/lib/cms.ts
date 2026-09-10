import { createClient } from "@sanity/client";
import { fallbackSiteData } from "@/data/site";
import type { Amenity, DiningVenue, EventVenue, ImageAsset, Room, SiteData } from "./types";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";

const client = projectId
  ? createClient({ projectId, dataset, apiVersion: "2026-08-31", useCdn: true })
  : null;

type CmsSiteData = {
  rooms?: Room[];
  dining?: DiningVenue[];
  venues?: EventVenue[];
  amenities?: Amenity[];
  media?: ImageAsset[];
};

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
    maximojoRoomCode,
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
  const media = (data.media || []).filter((asset) => asset.src && asset.publishApproved && asset.rightsStatus !== "verify");
  const rooms = (data.rooms || [])
    .filter((room) => room.slug && room.name && hasApprovedImage(room))
    .map((room) => ({
      ...room,
      maximojoRoomCode: room.bookingMode === "assisted" ? undefined : room.maximojoRoomCode,
      gallery: (room.gallery || []).filter((asset) => media.some((item) => item.id === asset.id))
    }));
  const dining = (data.dining || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue));
  const venues = (data.venues || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue));
  const amenities = (data.amenities || []).filter((amenity) => amenity.name && (!amenity.image || hasApprovedImage(amenity)));

  return { rooms, dining, venues, amenities, media };
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
