import type { Amenity, DiningVenue, EventVenue, ImageAsset, Room, SiteData } from "@/lib/types";
import { withBase } from "@/lib/paths";

const image = (
  id: string,
  src: string,
  alt: string,
  category: ImageAsset["category"],
  subject: string,
  orientation: ImageAsset["orientation"] = "landscape",
  focalPoint = "50% 50%"
): ImageAsset => ({
  id,
  src: withBase(src),
  alt,
  category,
  subject,
  orientation,
  focalPoint,
  peopleVisible: false,
  rightsStatus: "verify",
  publishApproved: false
});

export const media: ImageAsset[] = [
  image("hero-orchha", "/images/hero-orchha.jpg", "Orchha cenotaphs beside the Betwa River at sunset", "destination", "Orchha cenotaphs", "landscape", "52% 42%"),
  image("property-exterior", "/images/property-exterior.jpg", "Orchha Palace exterior and landscaped gardens", "property", "Hotel exterior", "landscape", "50% 52%"),
  image("property-royal-ambience", "/images/property-royal-ambience.jpg", "Orchha Palace entrance and formal gardens glowing at sunset", "property", "Hotel entrance at sunset", "landscape", "50% 50%"),
  image("property-courtyard", "/images/property-courtyard.jpg", "Sandstone courtyard at Orchha Palace", "property", "Courtyard"),
  image("property-lobby", "/images/property-lobby.jpg", "Grand lobby with heritage-inspired details", "property", "Lobby"),
  image("standard-room", "/images/standard-room.jpg", "Standard room with a double bed, armchair and garden light", "room", "Standard Room"),
  image("standard-room-angle", "/images/standard-room-angle.jpg", "Standard room viewed from the bed toward the television and writing desk", "room", "Standard Room reverse angle", "portrait"),
  image("standard-twin", "/images/standard-twin.jpg", "Standard twin room with two separate beds and a writing desk", "room", "Standard Room Twin"),
  image("standard-twin-service", "/images/standard-twin-service.jpg", "In-room dining tray presented in front of two Standard twin beds", "room", "Standard Room Twin in-room dining"),
  image("deluxe-room", "/images/deluxe-room.jpg", "Spacious Deluxe room with a double bed, armchair and writing table", "room", "Deluxe Room"),
  image("deluxe-room-angle", "/images/deluxe-room-angle.jpg", "Deluxe room viewed toward the television and writing desk", "room", "Deluxe Room reverse angle", "portrait"),
  image("deluxe-room-evening", "/images/deluxe-room-evening.jpg", "Deluxe double bed with warm evening lighting", "room", "Deluxe Room evening view", "portrait"),
  image("deluxe-twin", "/images/deluxe-twin.jpg", "Deluxe twin room with two beds and a glass writing table", "room", "Deluxe Room Twin"),
  image("deluxe-bathroom", "/images/deluxe-bathroom.jpg", "Deluxe bathroom with a full bathtub and glass-enclosed walk-in shower", "room", "Deluxe bathroom"),
  image("deluxe-bathroom-angle", "/images/deluxe-bathroom-angle.jpg", "Deluxe bathroom bathtub and glass-enclosed shower from a second angle", "room", "Deluxe bathroom alternate angle", "portrait"),
  {
    ...image("presidential-suite", "/images/presidential-suite.webp", "Presidential Suite bedroom with carved timber bed and generous floor space", "room", "Presidential Suite bedroom"),
    mobileSrc: withBase("/images/presidential-suite-mobile.webp")
  },
  {
    ...image("presidential-suite-exterior", "/images/presidential-suite-exterior.webp", "Low-rise Presidential Suite exterior facing a private garden at Orchha Palace", "room", "Presidential Suite exterior", "landscape", "50% 54%"),
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("presidential-bedroom-two", "/images/presidential-bedroom-two.webp", "Presidential Suite second bedroom with a double bed, timber headboard and television", "room", "Presidential Suite second bedroom"),
    rightsStatus: "approved",
    publishApproved: true
  },
  image("suite-living", "/images/suite-living.jpg", "Presidential Suite private living room with carved sofas around a coffee table", "room", "Presidential Suite living room"),
  image("presidential-dining", "/images/presidential-dining.jpg", "Presidential Suite dining room with a six-seat table and adjoining lounge", "room", "Presidential Suite dining room"),
  image("presidential-private-pool", "/images/presidential-private-pool.jpg", "Private swimming pool in the Presidential Suite courtyard", "room", "Presidential Suite private pool"),
  image("presidential-jacuzzi", "/images/presidential-jacuzzi.jpg", "Presidential Suite master bathroom jacuzzi prepared with flower petals", "room", "Presidential Suite master bathroom", "portrait"),
  image("pool", "/images/pool.jpg", "Outdoor swimming pool surrounded by palace architecture", "wellness", "Swimming pool", "landscape", "50% 55%"),
  {
    ...image("spa-salon", "/images/spa-salon.webp", "Kairali Spa and Vanity Durbar services card beside the salon interior", "wellness", "Spa and salon"),
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("gym", "/images/gym.webp", "Hotel fitness room with treadmills, an elliptical trainer, free weights and exercise mats", "wellness", "Fitness room"),
    rightsStatus: "approved",
    publishApproved: true
  },
  image("kids-zone", "/images/kids-zone.jpg", "Outdoor play area for younger guests", "wellness", "Kids Zone"),
  image("annajal", "/images/annajal-selected.webp", "Annajal dining room set for service at Orchha Palace", "dining", "Annajal"),
  {
    ...image("dragon", "/images/dragon-selected.webp", "Dragon restaurant illuminated by its signature red lanterns", "dining", "Dragon"),
    peopleVisible: true
  },
  {
    ...image("madira", "/images/madira-selected.webp", "Madira bar with its warmly lit bottle display", "dining", "Madira Bar"),
    peopleVisible: true
  },
  image("food", "/images/dining-main.webp", "Formal dining room arranged for an evening meal at Orchha Palace", "dining", "Main dining room"),
  image("dining-groups", "/images/dining-groups.webp", "Decorative place setting prepared for a private group lunch", "dining", "Celebration dining place setting"),
  image("indramani", "/images/indramani-bagh.jpg", "Outdoor event lawn at Orchha Palace; exact venue mapping is awaiting hotel confirmation", "venue", "Indramani Bagh — mapping pending"),
  image("jeja", "/images/jeja-bagh.jpg", "Outdoor event lawn at Orchha Palace; exact venue mapping is awaiting hotel confirmation", "venue", "Jeja Bagh — mapping pending"),
  image("rudra", "/images/rudra-bagh.jpg", "Orchha Palace courtyard; exact Rudra Bagh mapping is awaiting hotel confirmation", "venue", "Rudra Bagh — mapping pending"),
  image("samrat", "/images/samrat-hall.jpg", "Indoor event hall at Orchha Palace; exact venue mapping is awaiting hotel confirmation", "venue", "Samrat Hall — mapping pending"),
  image("bundela", "/images/bundela-darbar.jpg", "Indoor banquet setup at Orchha Palace; exact venue mapping is awaiting hotel confirmation", "venue", "Bundela Darbar — mapping pending"),
  image("diwan", "/images/diwan-e-khas.jpg", "Indoor event hall at Orchha Palace; exact venue mapping is awaiting hotel confirmation", "venue", "Diwan-e-Khas — mapping pending"),
  {
    ...image("boardroom", "/images/boardroom.webp", "Orchha Palace boardroom with a long conference table, display and seating for fourteen guests", "venue", "Boardroom"),
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("private-date", "/images/private-date.webp", "A couple sharing a private candlelit dinner on the illuminated hotel lawn", "venue", "Private date-night setup"),
    peopleVisible: true,
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("event-showcase-one", "/images/event-showcase-one.webp", "Colourful daytime wedding celebration staged in the Orchha Palace gardens", "venue", "Daytime wedding celebration"),
    peopleVisible: true,
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("event-showcase-two", "/images/event-showcase-two.webp", "A couple walking through the pink open-air amphitheatre at Orchha Palace", "venue", "Open-air amphitheatre"),
    peopleVisible: true,
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("event-showcase-fireworks", "/images/event-showcase-fireworks.webp", "Wedding couple on a floral stage beneath a coordinated fireworks display", "venue", "Wedding finale with fireworks", "landscape", "50% 46%"),
    peopleVisible: true,
    rightsStatus: "approved",
    publishApproved: true
  },
  {
    ...image("private-garden-dining", "/images/private-garden-dining.jpg", "Private dining table arranged on the lawn beneath a carved stone wall", "venue", "Private garden dining", "portrait", "50% 61%"),
    peopleVisible: true
  },
  {
    ...image("wedding-showcase", "/images/wedding-showcase.jpg", "Grand outdoor wedding aisle with floral installations at Orchha Palace", "venue", "Orchha Palace wedding showcase", "landscape", "50% 58%"),
    mobileSrc: withBase("/images/wedding-showcase-mobile.webp"),
    peopleVisible: true
  },
  image("orchha-fort", "/images/orchha-fort.jpg", "Historic fort architecture in Orchha", "destination", "Orchha Fort"),
  image("ram-raja", "/images/ram-raja-temple.jpg", "Ram Raja Temple in Orchha", "destination", "Ram Raja Temple")
];

const byId = (id: string) => media.find((item) => item.id === id) as ImageAsset;

const sharedAmenities = [
  "Central air conditioning",
  "40-inch LED television",
  "Tea and coffee maker",
  "Mini bar",
  "In-room safe",
  "Wi-Fi access",
  "24-hour in-room dining",
  "Around-the-clock housekeeping"
];

export const rooms: Room[] = [
  {
    slug: "standard-room",
    name: "Standard Room",
    shortName: "Standard",
    eyebrow: "Calm, generous comfort",
    description: "A spacious 400 sq. ft. room designed for quiet stays, with warm timber details, a comfortable double bed and an unusually generous bathroom.",
    size: "400 sq. ft.",
    bed: "Double bed",
    idealFor: "Couples and solo travellers",
    bathroom: "Large bathroom with landscaped outdoor-shower feature",
    view: "Garden or courtyard aspect",
    image: byId("standard-room"),
    gallery: [byId("standard-room"), byId("standard-room-angle")],
    highlights: ["Landscaped outdoor-shower feature", "24-hour dining", "Heritage-inspired interiors"],
    amenities: sharedAmenities,
    inclusions: ["Welcome drink on arrival", "Complimentary mineral water", "Daily housekeeping"]
  },
  {
    slug: "standard-room-twin",
    name: "Standard Room Twin",
    shortName: "Standard Twin",
    eyebrow: "Flexible twin comfort",
    description: "The same generous 400 sq. ft. footprint with separate beds—well suited to friends, colleagues or family members travelling together.",
    size: "400 sq. ft.",
    bed: "Two separate beds",
    idealFor: "Friends, colleagues and families",
    bathroom: "Large bathroom with landscaped outdoor-shower feature",
    view: "Garden or courtyard aspect",
    image: byId("standard-twin"),
    gallery: [byId("standard-twin"), byId("standard-twin-service")],
    highlights: ["True twin configuration", "24-hour dining", "Generous bathroom"],
    amenities: sharedAmenities,
    inclusions: ["Welcome drink on arrival", "Complimentary mineral water", "Daily housekeeping"]
  },
  {
    slug: "deluxe-room",
    name: "Deluxe Room",
    shortName: "Deluxe",
    eyebrow: "More room to settle in",
    description: "A 500 sq. ft. retreat with added space for longer stays, central air conditioning and a bathroom with a full bathtub.",
    size: "500 sq. ft.",
    bed: "Double bed",
    idealFor: "Couples and longer stays",
    bathroom: "Full bathroom with bathtub",
    view: "Garden or palace aspect",
    image: byId("deluxe-room"),
    gallery: [byId("deluxe-room"), byId("deluxe-room-angle"), byId("deluxe-room-evening"), byId("deluxe-bathroom"), byId("deluxe-bathroom-angle")],
    highlights: ["Full bathtub", "Extra living space", "24-hour dining"],
    amenities: sharedAmenities,
    inclusions: ["Welcome drink on arrival", "Complimentary cookies", "Daily housekeeping"]
  },
  {
    slug: "deluxe-room-twin",
    name: "Deluxe Room Twin",
    shortName: "Deluxe Twin",
    eyebrow: "Space, shared beautifully",
    description: "A 500 sq. ft. twin room that pairs independent sleeping comfort with the generous proportions and bathtub of the Deluxe category.",
    size: "500 sq. ft.",
    bed: "Two separate beds",
    idealFor: "Friends, families and colleagues",
    bathroom: "Full bathroom with bathtub",
    view: "Garden or palace aspect",
    image: byId("deluxe-twin"),
    gallery: [byId("deluxe-twin"), byId("deluxe-bathroom"), byId("deluxe-bathroom-angle")],
    highlights: ["True twin configuration", "Full bathtub", "Extra living space"],
    amenities: sharedAmenities,
    inclusions: ["Welcome drink on arrival", "Complimentary cookies", "Daily housekeeping"]
  },
  {
    slug: "presidential-suite",
    name: "Presidential Suite",
    shortName: "Presidential Suite",
    eyebrow: "The palace at its most private",
    description: "A two-bedroom residence with separate living and dining spaces, two attached bathrooms, a pantry, private pool and dedicated butler service.",
    size: "Two-bedroom suite",
    bed: "Two bedrooms",
    idealFor: "Families, wedding parties and private stays",
    bathroom: "Two attached bathrooms; master bath with jacuzzi and steam",
    view: "Private pool and garden setting",
    image: byId("presidential-suite"),
    gallery: [byId("presidential-suite"), byId("presidential-suite-exterior"), byId("presidential-bedroom-two"), byId("suite-living"), byId("presidential-dining"), byId("presidential-private-pool"), byId("presidential-jacuzzi")],
    highlights: ["Private pool", "Dedicated butler", "Living and dining room", "Jacuzzi and steam bath"],
    amenities: [...sharedAmenities, "56-inch television", "Media console", "Pantry", "Private pool"],
    inclusions: ["Welcome cake or wine", "Fruit basket", "Floral arrangement", "Butler service"]
  }
];

export const dining: DiningVenue[] = [
  {
    slug: "annajal",
    name: "Annajal",
    type: "Indian & international",
    description: "The lobby-level all-day restaurant brings together regional Indian favourites, international classics and generous buffet spreads.",
    location: "Lobby level",
    capacity: "125 indoors · 30 outdoors",
    image: byId("annajal"),
    highlights: ["À la carte and buffet dining", "Regional Indian specialities", "Outdoor seating"]
  },
  {
    slug: "dragon",
    name: "Dragon",
    type: "Pan-Asian",
    description: "A focused menu of Chinese, Thai and Indian-Chinese favourites served in a polished first-floor dining room.",
    location: "First floor",
    capacity: "54 seats",
    image: byId("dragon"),
    highlights: ["Chinese and Thai dishes", "Indian-Chinese favourites", "Intimate dining room"]
  },
  {
    slug: "madira",
    name: "Madira",
    type: "Bar & lounge",
    description: "A relaxed evening setting for wines, spirits, cocktails and conversation after a day exploring Orchha.",
    location: "Hotel lounge",
    image: byId("madira"),
    highlights: ["Signature cocktails", "Wines and spirits", "Relaxed lounge seating"]
  }
];

export const venues: EventVenue[] = [
  { slug: "indramani-bagh", name: "Indramani Bagh", type: "Outdoor", size: "140,000 sq. ft.", capacity: "Custom by event layout", description: "The estate's largest lawn for destination weddings, exhibitions and large-format celebrations.", image: byId("indramani"), layouts: ["Wedding", "Reception", "Exhibition", "Festival"] },
  { slug: "jeja-bagh", name: "Jeja Bagh", type: "Outdoor", size: "15,000 sq. ft.", capacity: "Custom by event layout", description: "A landscaped lawn with a heritage backdrop for ceremonies, cocktails and private dinners.", image: byId("jeja"), layouts: ["Ceremony", "Cocktail", "Dinner", "Reception"] },
  { slug: "rudra-bagh", name: "Rudra Bagh", type: "Outdoor", size: "10,000 sq. ft.", capacity: "Custom by event layout", description: "An intimate outdoor venue for focused celebrations and open-air corporate gatherings.", image: byId("rudra"), layouts: ["Ceremony", "Dinner", "Team event"] },
  { slug: "samrat-hall", name: "Samrat Hall", type: "Indoor", size: "9,000 sq. ft.", capacity: "Up to 700 theatre style", description: "A large, flexible hall for conferences, launches, banquets and wedding functions.", image: byId("samrat"), layouts: ["Theatre", "Banquet", "Classroom", "Exhibition"] },
  { slug: "bundela-darbar", name: "Bundela Darbar", type: "Indoor", size: "9,000 sq. ft.", capacity: "Up to 700 theatre style", description: "A generous banquet and convention space with flexible staging and service access.", image: byId("bundela"), layouts: ["Theatre", "Banquet", "Classroom", "Exhibition"] },
  { slug: "diwan-e-khas", name: "Diwan-e-Khas", type: "Indoor", size: "4,500 sq. ft.", capacity: "Up to 250 theatre style", description: "A more intimate hall for private celebrations, seminars and mid-sized conferences.", image: byId("diwan"), layouts: ["Theatre", "Banquet", "Classroom"] },
  { slug: "boardroom", name: "Boardroom", type: "Boardroom", size: "Fixed boardroom", capacity: "14 guests", description: "A private meeting room with display, video-conferencing and high-speed internet facilities.", image: byId("boardroom"), layouts: ["Boardroom"] }
];

export const amenities: Amenity[] = [
  { name: "Outdoor pool", icon: "ph:swimming-pool", description: "A landscaped freeform pool with sun deck, poolside refreshments and an inbuilt stage.", image: byId("pool") },
  { name: "Spa & salon", icon: "ph:sparkle", description: "Massage and facial treatments alongside hair, beauty and grooming services by appointment.", image: byId("spa-salon") },
  { name: "Fitness & yoga", icon: "ph:barbell", description: "A dedicated gym with cardio equipment, free weights and space to stretch or practise yoga.", image: byId("gym") },
  { name: "Kids Zone", icon: "ph:balloon", description: "A 4,100 sq. ft. outdoor play area with slides, swings, climbing frames and trampolines.", image: byId("kids-zone") },
  { name: "24-hour dining", icon: "ph:bell-ringing", description: "Round-the-clock in-room dining for early arrivals, late evenings and quiet meals in." },
  { name: "Concierge", icon: "ph:map-pin", description: "Local sightseeing, transport and private Orchha experiences arranged on request." },
  { name: "Event planning", icon: "ph:confetti", description: "Dedicated specialists for weddings, conferences, launches and private celebrations." },
  { name: "Wi-Fi", icon: "ph:wifi-high", description: "Wireless internet access across rooms and key guest areas." }
];

export const fallbackSiteData: SiteData = { rooms, dining, venues, amenities, media };

export const contact = {
  phones: ["+91 95160 06201", "+91 95160 06203", "+91 95160 06204"],
  reservationsEmail: "reservations@orchhapalace.com",
  salesEmail: "sales@orchhapalace.com",
  address: "Sawant Nagar, Near Ramraja Temple, Distt. Niwari, Orchha, Madhya Pradesh 472246",
  whatsapp: "https://wa.me/919516006201?text=Hello%20Orchha%20Palace%2C%20I%27d%20like%20help%20planning%20a%20stay.",
  maps: "https://maps.app.goo.gl/NPxqpeqWNFf4j6c36"
};

export const propertyFacts = [
  { value: "12 acres", label: "landscaped estate" },
  { value: "5 stays", label: "room and suite choices" },
  { value: "7 venues", label: "indoors and outdoors" },
  { value: "2 km", label: "from Ram Raja Temple" }
];
