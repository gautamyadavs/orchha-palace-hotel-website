export type ImageAsset = {
  id: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  category: "property" | "room" | "dining" | "wellness" | "venue" | "destination";
  subject: string;
  orientation: "landscape" | "portrait" | "square";
  focalPoint?: string;
  peopleVisible: boolean;
  rightsStatus: "hotel-owned" | "approved" | "verify";
  publishApproved: boolean;
};

export type Room = {
  category?: "Standard" | "Deluxe" | "Presidential";
  bedType?: "double" | "twin" | "two-bedroom";
  featureTags?: string[];
  tour?: { provider: "instagram"; url: string; title: string };
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  description: string;
  size: string;
  bed: string;
  idealFor: string;
  bathroom: string;
  view: string;
  image: ImageAsset;
  gallery: ImageAsset[];
  highlights: string[];
  amenities: string[];
  inclusions: string[];
  bookingMode: "online" | "assisted";
  /** Only set after the corresponding Maximojo room category has been verified. */
  maximojoRoomCode?: string;
};

export type JourneyMode = "stay" | "event" | "assisted-suite";

export type DiningVenue = {
  slug: string;
  name: string;
  type: string;
  description: string;
  location: string;
  capacity?: string;
  image: ImageAsset;
  highlights: string[];
};

export type EventVenue = {
  journeys?: EventJourney[];
  capacities?: Partial<Record<SeatingLayout, number>>;
  slug: string;
  name: string;
  type: "Indoor" | "Outdoor" | "Boardroom";
  size: string;
  capacity: string;
  description: string;
  image: ImageAsset;
  layouts: string[];
};

export type EventJourney = "wedding" | "corporate";
export type SeatingLayout = "Theatre" | "Banquet" | "Classroom" | "Boardroom" | "Outdoor";
export type CorporateClient = { id: string; name: string; order: number; logo: string; sourceUrl: string; reviewedAt: string; status: "ready" | "pending" };
export type ActivityCategory = "Heritage" | "Spiritual" | "Nature" | "Adventure" | "Rural & food" | "At the hotel";
export type TimeBlock = "earlyMorning" | "morning" | "afternoon" | "evening";
export type Activity = {
  id: string; name: string; categories: ActivityCategory[]; description: string;
  duration: string; block: TimeBlock; bookingStatus: string; sourceUrl: string;
  actionLabel: string; bookingUrl?: string; reviewedAt: string; note: string;
  variantOf?: string;
};
export type ItineraryTemplate = { nights: 2 | 3; days: Record<TimeBlock, string[]>[] };
export type SavedItinerary = ItineraryTemplate & { version: 2; arrival: string; unscheduled: string[] };

export type Amenity = {
  name: string;
  icon: string;
  description: string;
  image?: ImageAsset;
};

export type BookingSearch = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  promoCode?: string;
  roomCode?: string;
};

export type EventLead = {
  journey?: EventJourney;
  organisation?: string;
  functions?: string;
  seatingLayout?: SeatingLayout;
  avNeeds?: string;
  guestRooms?: number;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  tentativeDate?: string;
  guestCount: number;
  preferredVenue?: string;
  message?: string;
  consent: boolean;
  turnstileToken?: string;
};

export type SiteData = {
  clients: CorporateClient[];
  activities: Activity[];
  itineraryTemplates: ItineraryTemplate[];
  rooms: Room[];
  dining: DiningVenue[];
  venues: EventVenue[];
  amenities: Amenity[];
  media: ImageAsset[];
};
