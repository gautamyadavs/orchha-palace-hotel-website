import type { DiningVenue, ImageAsset } from "./types";

// Owner confirmed Madira's closure and Patio Cafe's replacement on 20 September 2026.
// Older CMS content must not restore a closed outlet or replace the selected photograph.
export const isClosedDiningContent = (item: { slug?: string; id?: string; name?: string; subject?: string; alt?: string; src?: string }) =>
  /\bmadira\b/i.test([item.slug, item.id, item.name, item.subject, item.alt, item.src].filter(Boolean).join(" "));

export function currentDining(venues: DiningVenue[], approved: DiningVenue[]): DiningVenue[] {
  const active = venues.filter(venue => !isClosedDiningContent(venue));
  return approved.map(fallback => fallback.slug === "patio-cafe" ? fallback : active.find(venue => venue.slug === fallback.slug) || fallback);
}

export function currentDiningMedia(media: ImageAsset[], patio: ImageAsset): ImageAsset[] {
  return [...media.filter(asset => !isClosedDiningContent(asset) && asset.id !== patio.id), patio];
}
