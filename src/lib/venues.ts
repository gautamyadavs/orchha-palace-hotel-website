import type { EventJourney, EventVenue, SeatingLayout } from "./types";
export function venueMatch(venue: EventVenue, journey: EventJourney, setting: string, layout: SeatingLayout | "", guests?: number): "match" | "confirm" | "excluded" {
  if (!venue.journeys?.includes(journey) || (setting && venue.type !== setting)) return "excluded";
  if (!layout) {
    if (!guests) return "match";
    const capacities = Object.values(venue.capacities || {}).filter(value => Number.isFinite(value) && value > 0);
    // An unspecified layout cannot establish that an unmeasured arrangement is unsuitable.
    return capacities.some(capacity => capacity >= guests) ? "match" : "confirm";
  }
  if (layout === "Outdoor" && venue.type !== "Outdoor") return "excluded";
  if (venue.type === "Boardroom" && layout !== "Boardroom") return "excluded";
  if (layout === "Boardroom" && venue.type === "Outdoor") return "excluded";
  const capacity = venue.capacities?.[layout];
  if (capacity === undefined || !Number.isFinite(capacity) || capacity <= 0) return "confirm";
  return guests && capacity < guests ? "excluded" : "match";
}
