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
};

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
  slug: string;
  name: string;
  type: "Indoor" | "Outdoor" | "Boardroom";
  size: string;
  capacity: string;
  description: string;
  image: ImageAsset;
  layouts: string[];
};

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
  rooms: number;
  promoCode?: string;
};

export type EventLead = {
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
  rooms: Room[];
  dining: DiningVenue[];
  venues: EventVenue[];
  amenities: Amenity[];
  media: ImageAsset[];
};
