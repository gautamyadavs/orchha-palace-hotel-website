# Orchha Palace: content integration plan

Prepared 20 September 2026. Initial planning baseline below; implementation status and later owner decisions take precedence.

**Implementation update:** The owner confirmed Madira is closed and Patio Cafe replaces it, supplied the Patio Cafe photograph, requested private dining with existing imagery and call/WhatsApp arrangements outside the main navigation, and approved the Framer spa treatment names, durations and prices. These were published on 28 September 2026, along with a spa discovery link under Amenities and current-menu requests for dining. The release passed 71 tests, type checks, the production verifier and live responsive checks at nine widths. See [release record](../content/deployment-snapshots/dining-spa-2026-09-28.json). Unconfirmed food menus, room/venue specifications, reviews and conflicting policies remain pending. The original proposal to retain Madira is superseded.

The Framer skeleton contains useful additional service information, but also unfinished template content and conflicting facts. Integrate verified information into the existing website's guest journeys. Preserve the established design, booking behaviour and recent mobile refinements.

## 1. Sources and evidence

- Content reference: [owner-supplied Framer skeleton](https://grounded-mind-092212--build-luxury-resort-lsy7ycy41.framer.app/).
- Current experience: [orchhapalace.com](https://orchhapalace.com/), inspected directly in the browser on 20 September. A search-tool result for Rooms returned an old version; the current Rooms page was therefore verified directly in the browser.
- Existing decisions: [redesign plan](redesign-plan.md), [mobile UX audit](mobile-ux-audit.md), [September 18 mobile evidence](qa-2026-09-18/live-checks.json), [developer handoff](../DEVELOPER_HANDOFF.md), and the current source.
- Framer pages reviewed: homepage, About, Rooms, all three room details, Dining, restaurant menu, Dragon/bar menu, Patio Cafe, Ayurveda Spa, Activities, Events, all six linked venue details, Gallery, Contact, Reservations, Privacy and Terms. The room FAQs were expanded and read.
- “Present in the skeleton” means a candidate fact, not verified hotel policy, availability, pricing or publication approval. Conflicts remain pending until resolved by the hotel. An unanswered question does not approve the skeleton's version.

## 2. What to integrate, in priority order

Priority 1 covers information that directly supports a guest decision. Priority 2 enriches the experience after its facts are verified. Optional work requires a separate product decision.

| Priority / area | What is missing or thinner on the live site | Proposed placement and treatment | Confirmation needed |
| --- | --- | --- | --- |
| 1 — Restaurant menus | Live Dining describes Annajal, Dragon and Madira but does not provide menus. Framer's restaurant menu has three dishes; Dragon's menu page only displays a heading and subtitle. | Add a clear “View menu” action to each outlet with an approved menu. Use readable HTML menu pages, category jump links and optional PDF downloads. Keep “Ask about a table” specific to the outlet. | Complete current menus, INR prices, tax treatment, portions, dietary/allergen information, validity and person responsible for updates. The three Framer dishes are unverified candidates. |
| 1 — Patio Cafe | Framer names an additional cafe and lists drinks/snack categories; it is absent from live Dining. | If operational, add a fourth on-property outlet to `/dining/` with its own photo, location, hours, menu and enquiry action. Revise the current “Three places” heading. Preserve Madira and the separately labelled Betwa View Dining at Orchha Resort. | Official spelling, location, operating status/hours, menu, prices, reservation contact and approved photograph. Establish whether it is a distinct outlet or part of another restaurant. |
| 1 — Spa treatment catalogue | Live Amenities names Kairali Spa and Vanity Durbar but only gives a short description and general appointment link. Framer lists 11 treatments with durations and prices. | Keep a concise overview on `/hotel-amenities/`, linking to a proposed `/spa/` page if the full catalogue is approved. Show treatment name, duration and price immediately; make descriptions expandable. Use “Ask about this treatment,” carrying its name into the guest-initiated WhatsApp draft. | Current treatment/rate sheet; Kairali versus Ayurveda Spa naming; taxes; hours; advance-booking requirements; therapist availability; contact; what salon services belong separately to Vanity Durbar. |
| 1 — Accurate room facts | Skeleton adds occupancy, king-bed wording, a size range, Smart TVs and suite features that differ from or exceed live claims. | Update the existing five room records and their detail/compare surfaces once verified. Show capacity as a clear fact with child/extra-bed conditions nearby. Keep detailed amenities in disclosures. | Standard size and bed specifications; occupancy by category; inclusions; exact bathroom/TV/suite features. See conflict register below. |
| 1 — Practical FAQs | Skeleton proposes family, landmark-distance, payment and pet questions. Live homepage currently provides arrival and transfer guidance; policies remain general/rate-specific. | Add confirmed answers to the relevant room, amenities, contact or booking-policy page. Add only the most useful short questions to the homepage. Maintain one source for repeated facts. | Pet policy, family/extra-bed rules, payment methods and corporate-billing conditions; distance basis; authoritative cancellation wording. Resolve skeleton contradictions first. |
| 2 — Specific venue features | Framer associates Jeja Bagh with the amphitheatre, gives Indramani a 1,000+ claim and adds occasion-specific descriptions. Live venue finder already has richer layout handling and seven venues. | Enrich existing venue cards with short features and optional “Venue details” disclosures; carry the selected venue into the current enquiry. Add venue detail routes only if approved photos/floor plans and enough unique content justify them. | Jeja/amphitheatre relationship; capacity by seating layout; approved venue photos; indoor backup/arrangement details if offered. |
| 2 — Family and recreation detail | The skeleton explicitly claims a children's pool, private yoga/meditation/personal sessions, a merry-go-round and additional spa facilities. | Enrich the existing Amenities sections. Give practical access, availability and supervision information where confirmed. Link relevant activities to the current itinerary catalogue. | Availability, guest access, supervision/age guidance, paid versus included status, timings, advance notice, and accurate photographs. |
| 2 — Property story and useful facts | Framer gives a fuller Bundelkhand/garden narrative, 12-acre estate, 2.5 km fort distance, 2 km temple distance and a 100-room claim in its FAQ. Some property facts exist in source but are not prominent on the current homepage. | Put a short factual introduction in Hotel & amenities and arrival distances in Contact/Explore. A short sentence can enrich existing homepage copy; retain the existing section order. | Room inventory including suite count, current distances and whether measured by road, estate acreage, and any historical claims. Describe heritage-inspired design without asserting an unverified historic royal residence. |
| 2 — Guest reviews | Framer has a Guest Journal with named quotes, a Google 4.3 rating and “4,000+ reviews”; the live site has no equivalent section. | Once sourced, add a compact static review block near the later homepage decision point and a link to original Google reviews. Start with two or three short authentic excerpts. | Original review links, accurate author/date/text, current rating/count and a review/update owner. Omit aggregate figures until verified; no invented portraits, ratings or quotations. |
| Optional — Private dining | Skeleton mentions private poolside evenings; the live site already covers group dining and private-event imagery. | If it is a distinct bookable experience, add a short “Private dining” item under Dining with an enquiry action, rather than a new primary journey. | Actual setting, availability, inclusions, capacity, advance notice and how the team handles requests. |
| Optional — Guest feedback | Framer Contact has a rating form absent from the live site. This is a new operational feature, not just missing copy. | Keep pre-arrival Contact focused. If wanted, add a separate post-stay feedback route with all rating values, optional comments, honest success/failure states and a clear destination. | Whether it is wanted, recipient/owner, fields, privacy/retention and response process. Framer's visible rating choices are only 3, 4 and 5; do not copy that restricted scale. |

## 3. Existing features to retain

These are already present and should not be reported as missing or rebuilt from the skeleton:

- Five distinct room choices: Standard, Standard Twin, Deluxe, Deluxe Twin and Presidential Suite; comparison, filters, detailed galleries and retained URLs.
- Live Maximojo room pricing and booking handoff. The Presidential Suite remains call/WhatsApp only, with its photo gallery and click-loaded Instagram tour.
- Separate Weddings and Corporate events journeys, six wedding spaces, seven corporate spaces, layout-aware filtering, and the two-step enquiry.
- Diwan-e-Khas, which is present on the live site but absent from Framer's six linked venue pages.
- Corporate hosting logos with their established ordering and accessibility behaviour.
- The 21-experience catalogue and customisable two-/three-night itinerary, saved choices, PDF/copy/share, seasonal pool logic and explicit date handoff.
- Pool, fitness/yoga, spa/salon, Kids Zone, concierge, 24-hour dining, Wi-Fi and event-planning summaries. Most skeleton activity categories overlap existing functionality.
- Betwa View Dining's sister-property identity, separate phone number and location. It must never be implied to be an outlet inside Orchha Palace.
- Existing address, maps, reservation and event contacts, purposeful gallery filtering, and booking/policy destinations.

## 4. Accuracy and conflict register

All entries below are pending hotel confirmation unless they explicitly describe an observed site behaviour. Keep the current live fact until a replacement is confirmed; this is not a new certification of every existing claim.

| Item | Observed difference | Decision for implementation |
| --- | --- | --- |
| Room rates | Framer shows Standard $199, Deluxe $450 and Suite $799 per night. | Do not transfer these unverified static prices. Retain live rates for Standard/Deluxe and assisted quotes for the suite. |
| Room choices | Framer collapses double/twin choices into three categories; its reservation dropdown instead contains Double Deluxe, Superior and Family Suite. | Preserve the five live categories, slugs and booking rules. Do not import the mismatched reservation dropdown. |
| Standard size | Live: 400 sq. ft. Framer: 400–450 sq. ft. | Confirm whether the range is real and which rooms it covers. Update both double and twin records consistently. |
| Beds and occupancy | Live uses double/twin wording and does not publish these specific occupancy limits. Framer says king/twin, Standard 2 guests and Deluxe 3. | Confirm bed dimensions, base and maximum adult occupancy, extra-bed conditions and child age bands. Do not equate two beds with a particular guest limit. |
| Standard bathroom | Live says landscaped outdoor-shower feature. Framer adds private rain shower, living greenery and artificial-stone waterfall. | Confirm which features exist in every affected room; avoid implying uniformity if room-dependent. |
| Deluxe features | Both say 500 sq. ft. and bathtub. Framer adds marble bathroom, Smart TV and welcome drink; live lists different inclusions. | Confirm construction/TV specifications and included benefits before enriching copy. |
| Suite features | Both describe two bedrooms, living/dining, private pool and butler. Framer additionally says working fireplace, temperature-controlled jacuzzi, plunge pool, two master bedrooms and two Smart TVs. | Verify each addition and distinguish room amenities from spa facilities. Preserve the suite's existing steam/jacuzzi information until corrected by the owner. |
| Spa identity/facilities | Live names Kairali Spa and Vanity Durbar; Framer uses Ayurveda Spa and lists shared steam/jacuzzi/lounge/meditation/treatment spaces. | Confirm business names and actual guest-accessible facilities. A suite jacuzzi is not evidence of a communal spa jacuzzi. |
| Menus | Annajal links to three dishes; Dragon links to `/bar-menu`, whose visible body contains no dish list. Dining copy under Dragon describes a bar. | Obtain actual menus and fix the outlet mapping. Use descriptive production menu URLs. Never substitute Dragon for Madira. |
| Arrival/departure | Live and Framer FAQ: 2pm/10am. Framer Terms: 3pm/11am. | Retain 2pm/10am pending owner confirmation. Keep itinerary arrival/departure guidance consistent. |
| Cancellation | Live: depends on rate/stay dates. Framer FAQ: free up to 72 hours. Framer Terms: 48 hours and a one-night penalty. | Keep rate-specific guidance unless management supplies the exact applicable policy and exceptions. Do not publish either blanket window by assumption. |
| Pets | Framer FAQ: no pets. Framer Terms: designated pet-friendly rooms. | Ask management; publish one confirmed policy consistently, including any applicable assistance-animal arrangements. |
| Policy/contact boilerplate | Framer Terms includes +1 (555) 123-4567, unconfirmed age/payment/liability conditions. Its privacy page describes payment collection broadly. | Exclude template boilerplate. Keep policies aligned with the real website/provider processing and management's approved wording. |
| Indramani capacity | Live: layout-dependent. Framer: 1,000+ without a seating layout. | Require a capacity and layout record; do not add an unqualified number to filtering. |
| Samrat capacity | Live: up to 700 theatre-style. Framer: 250–700 guests without layouts. | Preserve theatre-specific capacity; request banquet/classroom figures separately. |
| Jeja amphitheatre | Framer explicitly associates it with Jeja Bagh; live shows amphitheatre photography without that exact venue relationship. | Confirm whether part of Jeja, adjacent, separately bookable or shared; label the photo accurately. |
| Boardroom | Both describe 14 seats; Framer calls it Executive Board Room. | Confirm preferred display name; keep the stable existing ID and the corporate-only journey. |
| Property inventory | Framer FAQ says 100 rooms. | Confirm operational inventory and whether suites are included before promoting room blocks or buyouts. |
| Reviews | Framer shows 4.3/4,000+ and named 2026 testimonials without original review links in the reviewed block. | Treat as unverified. Use original, current evidence before publication. |
| Images and copy | Skeleton includes an image described as desert architecture, “ancient olive trees,” an IMAGE PLACEHOLDER, generic social links and duplicated restaurant copy on Rooms. | Use approved real hotel assets and accurate descriptions. Exclude those template remnants and the visible 404 footer link. |

## 5. Approved spa catalogue

Transcribed from the supplied skeleton. **The owner approved these names, durations and prices on 20 September 2026.** Appointment availability and the final tax-inclusive total are confirmed by the hotel before booking.

| Treatment | Duration shown | INR price shown |
| --- | --- | --- |
| Abhyangam | 50 minutes | ₹2,200 |
| Shirodhara | 60 minutes | ₹3,080 |
| Marma Massage | 60 minutes | ₹2,750 |
| Nasyam | 25 minutes | ₹880 |
| Herbal Facial | 35 minutes | ₹1,650 |
| Synchronized Massage | 50 minutes | ₹3,300 |
| Ayur Herbal Wrap | 50 minutes | ₹3,520 |
| Reflexology | 25 minutes | ₹1,320 |
| Deep Tissue Massage | 30 minutes | ₹1,760 |
| Body Exfoliation Massage | 45 minutes | ₹2,860 |
| Head & Scalp Massage | 30 minutes | ₹1,100 |

Ask the spa operator to supply approved descriptions. Describe the service and experience plainly; do not copy unsupported health or “detox” claims. State that requests are subject to appointment confirmation. Avoid wording that implies clicking an enquiry immediately books a treatment.

Food-menu candidates still requiring confirmation: Saffron Paneer ₹780, Orchha Millet Kheer ₹420 and Bundelkhand Thali ₹850. Patio's page lists beverages, mocktails, pastries, pancakes, waffles and similar refreshments, but no item-level prices. Dragon's reviewed page is a placeholder heading, not a complete menu. Until complete menus are approved, outlet-specific WhatsApp links request the current menu.

## 6. Preserve the established UX and mobile-first behaviour

The latest implemented decisions take precedence over older proposals in the redesign document. In particular, preserve the September 18 mobile homepage treatment: the complete palace photograph, readable maroon introduction below it, then booking controls. Keep the existing immersive desktop treatment.

| Principle | Requirement for these additions |
| --- | --- |
| Strong hierarchy | Keep primary navigation: Rooms & suites, Weddings, Corporate events, Dining, Explore Orchha. Discover menus through Dining and the treatment catalogue through Hotel & amenities. |
| Short, useful homepage | Keep existing hero → availability → rooms editorial → hotel/dining → itineraries → occasions → practical details. Enrich those modules. Add at most one compact verified review block; put full catalogues on detail pages. |
| Mobile layout first | Start at 320–390px with a single column, 16–20px gutters, 16px body/form text, at least 14px regular labels and 44px interaction targets. Add columns at wider widths only where useful. |
| Progressive disclosure | Show decision facts before opening details. Menu item names/prices and spa names/durations/prices remain readable; long descriptions and supporting conditions can expand. Do not hide mandatory charges or booking conditions. |
| Clear actions | Dining: View menu / Ask about a table. Spa: Ask about this treatment. Events: Enquire about this space. Rooms: Check live rates; suite: Call / WhatsApp. Preserve the selected service in the draft. |
| One useful mobile action | Reuse the established contextual sticky action pattern; do not stack new room, dining and spa bars. A dedicated service page can use a matching enquiry action. Hide the bar during menu/dialog/keyboard use and reserve safe-area space. |
| Readable menus | Use HTML text, wrapping category navigation and vertically stacked content. A PDF may be supplementary. No image-only menu, pinch-to-read prices or wide phone table. |
| Booking continuity | Retain dates/guests, verified provider parameters, suite-assisted mode and one-night availability. Service enquiries do not create bookings or change room dates. |
| Accessibility | Semantic headings and controls, persistent labels, visible focus, readable contrast and text zoom. Disclosures work by touch and keyboard; dialogs retain focus/Escape/return behaviour. Avoid letter-by-letter accessible text or required animation. |
| Calm motion and feedback | Prefer static testimonials initially. Any later carousel must offer manual controls, pause and reduced motion. Do not copy Framer's animated typography or mandatory autoplay. |
| Honest information | Visibly distinguish venue area from capacity, venue-specific photography from examples, rate-dependent inclusions from standard amenities, and sister-property facilities from on-site ones. |
| Performance | Reuse local approved images with responsive sizes and reserved dimensions; lazy-load below-fold media. Avoid a third-party review widget or auto-loaded social/map embeds. Retain the existing click-loaded suite reel. |
| Maintainable copy | Store repeating facts once; use a content owner, source, review date and approval status for new rates, menus, room facts and reviews. Internal approval labels stay out of guest-facing copy. |

### Mobile review performed for this plan

On 20 September, all nine directly inspected live routes had document width equal to viewport width at **390px and 320px**: homepage, Rooms, Presidential Suite, Hotel & amenities, Dining, Weddings, Corporate events, Contact and Explore Orchha. The homepage at 390px, itinerary at 320px and open navigation at 320px were visually inspected. The homepage body font measured 16px, and the current mobile hero preserved the full property photograph.

This is a bounded baseline check, not full accessibility, real-device, performance or end-to-end certification. Existing stored itinerary state was observed without resetting it. No enquiry, reservation or payment was submitted.

### Acceptance checks for implementation

1. Review changed pages at 320, 360, 390, 430, 768, 1024 and 1440px, plus the site's 959/960px hero boundary where relevant. Verify no page overflow, clipped prices/headings, concealed actions or overlapping fixed surfaces.
2. Test real iOS Safari and Android Chrome, landscape, text enlargement/zoom, keyboard entry, focus order, dialogs, disclosures and reduced motion. Validate contrast and touch targets rather than relying only on screenshots.
3. Check the complete path from outlet to menu to the correctly addressed enquiry; similarly, from treatment to the treatment-specific draft. Confirm the message is a request and is only sent by the guest.
4. Verify all five room pages and comparison values remain consistent; the suite remains assisted; valid one-, two- and three-night booking searches retain their dates/guests.
5. Confirm layout-specific venue matching, unknown-capacity handling and selected-venue enquiry prefilling. Preserve Diwan-e-Khas and all current venue coverage.
6. Recheck itinerary IDs, saved plans, seasonal logic and date handoff if activity records are enriched; do not create duplicate cycling, rafting, spa or heritage activities.
7. Confirm useful content and contact/booking fallbacks remain accessible without JavaScript; test failed external media and missing optional menu/treatment data.
8. For an implementation release, run the existing tests, type checks, build and production verifier. Add focused tests only for new behaviour/contracts. Check titles, internal links, canonical URLs and sitemap entries for new pages.
9. Recheck mobile performance against the established goals: LCP ≤2.5s, INP ≤200ms and CLS ≤0.1. Distinguish lab checks from field results; this planning pass did not measure these metrics.
10. Publish only after confirmed content is integrated and the changed journeys pass review; record the release and rollback baseline. This document authorizes no deployment by itself.

## 7. Implementation sequence and affected areas

| Stage | Work | Completion evidence |
| --- | --- | --- |
| 1 — Resolve facts | Obtain hotel answers/rate sheets, mark each candidate approved/corrected/deferred, and resolve conflicting policies and specifications. | One fact register with source, owner and review date; no assumptions promoted to facts. |
| 2 — Useful service content | Add approved outlet/menu information and the spa catalogue. Include Patio only if confirmed. Enrich family/service details where confirmed. | A mobile guest can find the service, understand the relevant facts and reach the correct enquiry without losing context. |
| 3 — Room, venue and arrival precision | Apply confirmed room facts consistently, enrich current venue cards, and add concise contextual FAQs/distances. | Detail pages, comparison, finder, policies and itineraries agree. Existing booking flows still work. |
| 4 — Trust and optional enhancements | Add verified review excerpts and a short property story. Decide separately whether private dining needs a dedicated item and whether a post-stay feedback feature is wanted. | Source-linked review content; no unverified aggregate claim or new form with no operational owner. |
| 5 — Review and release | Complete mobile, accessibility, interaction and performance checks; review final copy; then follow the existing release workflow when implementation is requested. | Dated evidence for changed routes and a verified deployment/rollback record. |

Implementation should extend the current Astro project and Cloudflare workflow. It does not need a Framer migration, a new booking engine, a design-system replacement or a new primary-navigation structure.

Likely source touchpoints:

- `src/data/site.ts` and `src/lib/types.ts`: approved room, venue, dining and amenity fields; add structured menu/treatment records in dedicated data files as useful.
- `src/pages/dining.astro`, `src/pages/hotel-amenities.astro`, proposed `src/pages/spa.astro` and outlet menu routes: service discovery and detail content.
- `src/pages/rooms/[slug].astro`, room chooser/comparison, `src/components/VenueFinder.astro` and `src/components/EventPage.astro`: consistent guest-facing facts and venue detail disclosures.
- `src/pages/contact.astro`, `src/pages/booking-policies.astro` and `src/pages/index.astro`: short arrival/FAQ/story/review additions where approved.
- `src/data/activities.ts`: enrich existing entries only where confirmed; preserve stable IDs, templates and saved-itinerary compatibility.
- `src/lib/cms.ts` and `sanity/schemaTypes/index.ts`: if the optional CMS is used, wire new fields through schemas, queries and validation as well as local fallbacks. Adding a Studio field alone does not make it appear publicly; the current offer/policy/global-settings documents are not consumed by the website.
- `src/styles/global.css` / `src/styles/redesign.css`: reuse current tokens and components. Add focused responsive rules instead of importing Framer styling.
- `content/media-manifest.csv`: provenance, mapping and approval for any new hotel/outlet/venue assets. Use real approved photographs.

Suggested content fields: stable ID, category/outlet, title, short description, duration where relevant, INR amount, taxes/inclusions, availability, request contact, source reference, reviewed date, approver and publication status. Make unconfirmed/expired prices omit cleanly while retaining an honest enquiry route. Keep the new categories optional so missing CMS content does not blank the existing site.

## 8. Owner decisions still needed

Questions on Dining, Spa, Rooms, Policies, Venues and Reviews have been raised in this task. The following is the complete checklist; answers can be given by topic.

1. **Dining:** Patio Cafe's replacement of the closed Madira, its photograph, and private dining with call/WhatsApp arrangements are confirmed. Remaining details: operating hours, complete Annajal/Dragon/Patio menus and tax treatment, and any specific private-dining packages or settings to advertise. The three Annajal dish candidates remain pending.
2. **Spa:** Treatment names, durations and prices are approved and integrated. Remaining details: tax treatment, hours, any change from the existing Kairali/Vanity Durbar names or hotel booking contact, shared spa facilities, and salon service prices.
3. **Rooms:** Confirm Standard area, actual double/king and twin beds, adult/child/extra-bed capacity by category, inclusions and TV/bathroom details. Confirm the suite fireplace, temperature-controlled jacuzzi, two-master-bedroom wording and pool description.
4. **Policies:** Confirm 2pm/10am, pet rules, rate-specific cancellation, family/extra-bed conditions and payment/corporate-billing arrangements. No blanket 48- or 72-hour policy will be assumed.
5. **Venues:** Is the amphitheatre part of Jeja Bagh? What layouts support Indramani's 1,000+ claim and Samrat's stated range? Confirm preferred boardroom name and any additional approved capacity sheets.
6. **Recreation/property:** Confirm children's pool, merry-go-round, yoga/meditation/personal training, bicycle arrangements, access/supervision/hours, 100-room inventory, acreage and landmark distances.
7. **Reviews:** Supply original review links; verify any rating/count with a date. Retain only authentic attributed quotes.
8. **Feedback:** Decide whether a separate post-stay feedback form is wanted; identify who receives and handles it before development.

Pending facts can be deferred independently. They should not force unrelated, verified content to wait, and silence should never be treated as confirmation.
