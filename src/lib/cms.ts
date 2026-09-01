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
    rightsStatus in ["hotel-owned", "approved"] &&
    peopleVisible != true
  ] | order(category asc, subject asc) ${mediaProjection}
}`;

const hasApprovedImage = (value: { image?: ImageAsset }) => Boolean(
  value.image?.src &&
  value.image.publishApproved &&
  value.image.rightsStatus !== "verify" &&
  !value.image.peopleVisible
);

function sanitizeCmsData(data: CmsSiteData): SiteData {
  const media = (data.media || []).filter((asset) => asset.src && asset.publishApproved && asset.rightsStatus !== "verify" && !asset.peopleVisible);
  const rooms = (data.rooms || [])
    .filter((room) => room.slug && room.name && hasApprovedImage(room))
    .map((room) => ({ ...room, gallery: (room.gallery || []).filter((asset) => media.some((item) => item.id === asset.id)) }));
  const dining = (data.dining || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue));
  const venues = (data.venues || []).filter((venue) => venue.slug && venue.name && hasApprovedImage(venue));
  const amenities = (data.amenities || []).filter((amenity) => amenity.name && (!amenity.image || hasApprovedImage(amenity)));

  return { rooms, dining, venues, amenities, media };
}

export async function getSiteData(): Promise<SiteData> {
  const production = (import.meta.env.PUBLIC_SITE_STATUS || "staging") === "production";
  if (!client) {
    if (production) throw new Error("A Sanity project is required for a production build so media approvals cannot be bypassed.");
    return fallbackSiteData;
  }

  try {
    const cmsData = sanitizeCmsData(await client.fetch<CmsSiteData>(query));
    const complete = cmsData.rooms.length && cmsData.dining.length && cmsData.venues.length && cmsData.amenities.length && cmsData.media.length;
    if (!complete) {
      if (production) throw new Error("Production CMS content is incomplete or includes unapproved media.");
      return fallbackSiteData;
    }
    return cmsData;
  } catch (error) {
    if (production) throw error;
    console.warn("Sanity content unavailable; using no-index preview content.", error);
    return fallbackSiteData;
  }
}
