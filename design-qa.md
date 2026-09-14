# Production release — 14 September 2026

Published the reviewed redesign to `https://orchhapalace.com` using the existing Cloudflare production Worker, real Turnstile site key and retained server secrets. Version: `b121fb25-9392-4d63-9194-cad9c1768601`. Previous working version for rollback: `369414a2-7fa1-4cb4-8678-6321efd391d4`.

Release checks reran all 68 tests, Astro/Worker types (zero errors, warnings or hints), the 20-page production build, the 29-file artifact verifier without a test-CAPTCHA override, and a strict Wrangler dry run. Seventeen live HTTP checks passed: revised pages, robots/sitemap, intended 404, legacy redirects, canonical www redirect, production CAPTCHA markup and exact new-image/favicon bytes. Asset hashes and HTTP evidence are in `content/deployment-snapshots/release-2026-09-14/`.

The live mobile planner opens correctly, contextual Change/Cancel restores focus, missing dates prompt in context, and a three-night search reaches the official Maximojo URL with 13–16 October 2026 and two adults. No reservation, payment or outbound enquiry was submitted. The local-review reports below remain historical evidence, including their stated limits.

---

# Editorial homepage, balanced itineraries and Betwa dining — current QA

Completed locally on 14 September 2026 following the owner's second review and clarification to keep arrival-evening aarti and move pool time to day 3. No deployment was performed. This section supersedes the room-card count, wedding-photo count and suggested activity sequences in the historical reports below.

## Current implementation

- Homepage: one owner-selected palace photograph, a spacious centered Rooms + suites description and one link to the full room chooser. All five room and bed choices remain on `/rooms/`. The selected photo has local responsive WebP variants; no external Google Photos request is required to display it.
- Wedding gallery: daytime celebration → fireworks → indoor floral mandap (new owner-selected image) → amphitheatre → celebration dining → private date. All six photos use the existing optional complete-image gallery presentation. Room gallery defaults are unchanged.
- Both suggested stays: arrival-day Chaturbhuj visit and evening Ram Raja Mandir/aarti; day 2 guided fort visit, a short conditional sanctuary outing, then Royal Chhatris and Betwa sunset. Lunch, rest, transfers and weather/access checks temper the fort/sanctuary combination; a long sanctuary trail is not suggested after the fort.
- Three-night stay: day 3 rafting, pool/garden time, then Sound & Light Show. No pool is suggested on arrival or day 2. With February–September arrival dates, the post-rafting swim is labelled Early evening; October–January uses Afternoon. Undated plans use Afternoon. Changing a seasonal pool slot to another activity explains the timing change before confirmation.
- Betwa View Dining at Orchha Resort, by the river: visible recommendation after Chhatris in both stays, dedicated dining-page section, Explore cross-link, practical contact/directions links and a separate Restaurant JSON-LD entity. The owner confirmed the current name and sister-property relationship; the resort's official pages supplied the property address/contact. No fabricated ratings, hours or ranking promises are included.
- Breakfast, dinner and packed-lunch guidance remains in concise day notes and the complete PDF/WhatsApp summaries. A Chhatris day recommends riverside dinner rather than simultaneously instructing guests to return to the Palace for dinner.
- SavedItinerary remains version 2. Existing custom plans are preserved; Reset to suggested stay applies the new templates. Contextual editing, Saved ideas, Undo and booking interfaces remain intact.

## Verification

| Check | Result |
| --- | --- |
| Existing and updated unit tests | 68 passed |
| Astro / Worker type checks | 0 errors, warnings or hints across 67 files |
| Final production-mode local build | 20 pages generated |
| Production artifact verifier | 29 files passed with the explicit local test-CAPTCHA override |
| Home, Explore and Weddings widths | 320, 390, 611, 768, 1030 and 1440px; no horizontal overflow |
| Explore opening view at 390×844 | Choices end at y=448.23px; first activity name ends at y=680.73px, above the sticky action; introductory image is 140px high |
| Homepage room feature | One image, one room-chooser link and zero room cards at all six widths; responsive sources decoded |
| Wedding photographs | All six × all six widths decoded, with matching image/caption/selected thumbnail, `contain`, and 3:2 or 16:9 frames; new photo also checked fullscreen at 611px |
| Customisation journeys | Summer pool Change/Cancel, empty-filter recovery, timing explanation on replacement, Saved ideas, Move, Remove/Undo, Done and Reset passed |
| Focus / scroll | Cancel returned to the original pool slot, retaining scrollY=1774; no jump to the catalogue |
| State / room dates | Restored plan label, explicit 2-night link preserving day-3 activities in Saved ideas, Undo to 3 nights, missing-arrival prompt, and 1–4 December fixture dates in the booking dialog passed |
| Seasonal plan | Rafting → early-evening pool → show in summer; rafting → afternoon pool → show in winter |
| Final PDF artifacts | Summer 3-night: 3 pages; shortened 2-night with Saved ideas: 2 pages; winter 3-night: 3 pages. All eight pages rendered and visually checked |

The PDF button invoked the browser print flow, but the native Save dialog was not exposed to automation. Export layout verification used HTML produced by the actual `printItinerary` helper and production stylesheet, rendered to PDF in an isolated headless Chrome process. Text and raster checks confirmed complete activities, meals, saved ideas and hotel contact information without clipped text or an orphan contact-only page. This is artifact validation, not a claim that the native Save dialog was automated. Fixtures use distant 2099 dates.

Previous keyboard, swipe, loading-race, date-conflict, storage-compatibility and axe checks remain documented in the prior pass; those unchanged paths were not all repeated in this follow-up. A third-party Turnstile `300030` error appeared in the local wedding preview with the test setup. No enquiry, booking, payment or WhatsApp message was submitted. Production CAPTCHA/delivery setup and physical-device launch checks remain separate, as does the previously recorded homepage LCP follow-up.

## Visual review and evidence

The reference (`homepage-reference.png`, 1276×1346) was compared with the desktop room feature (`homepage-editorial-comparison.png`, 1272×1141 captured viewport) and the complete mobile composition (`homepage-editorial-390.png`, 390×844). The reference informs the single-photo, centered-title, generous-copy and understated-link hierarchy. The owner's photograph keeps its original wide composition, and the existing ivory/maroon palette and Manrope typography remain intentional adaptations. The image is sharp, the copy is original to Orchha Palace, the CTA remains legible with a 44px target, and mobile spacing avoids sticky-action overlap. Review result: passed for the requested composition and responsive usability; no unresolved P0/P1/P2 defect was identified in these changed surfaces. This is a visual review, not a measured conversion result or pixel-identical reproduction of the reference.

Evidence is in `design/qa-2026-09-13-editorial/`: `responsive-results.json`, normal viewport screenshots, contextual picker states, six-photo gallery views, and the three `*-final.pdf` files with their page renders. Broken full-page stitched screenshots from the browser capture provider were discarded; they were not used to assess layout. Both selected Google Photos assets were successfully imported after the owner's confirmation and are recorded in `content/media-manifest.csv`.

---

# Previous pass: Explore Orchha usability and wedding gallery

Implemented locally on 13 September 2026 against the owner's approved suggested-stay plan. No deployment was performed. Earlier annotation-round evidence is retained below.

## Behaviour in that pass

- One compact introduction and approved Orchha photograph; mobile image capped at 140px. Visible two-/three-night choices, optional arrival dates, and a chronological column of expandable days. The first day opens initially, with activity names in the other summaries.
- Reading and editing are separate. Customise reveals Change and More (Move/Remove), with Done to return. Change uses a contextual mobile sheet/desktop dialog; Cancel and confirmations retain focus and scroll. Long arrangements and sources are under Details, with meals consolidated into day notes.
- Saved ideas retain displaced outings. One-step Undo persists until the next change and remains in Options after its notification is dismissed. Reset appears only for a plan that differs from its seasonal template. Suggested, Restored and Customised labels distinguish state; ordinary renders do not write storage. SavedItinerary remains version 2, with compatible v1 restoration.
- Check rooms is the primary action, PDF is secondary, and Copy/WhatsApp are grouped beneath. The mobile action includes the selected stay length. Missing/past arrival dates open an in-context prompt; only differing valid room-search dates produce a conflict choice. Keeping room-search dates refreshes the booking form from that retained search.
- Wedding order: daytime celebration → fireworks → amphitheatre → celebration dining → private date. An optional gallery prop contains full images in 3:2 frames below 960px and 16:9 frames above. Room defaults remain unchanged. Thumbnail navigation moves only the strip. Decoded photos, captions and selection update atomically, including slow/failed/retried requests.

## Verification in that pass

| Check | Result |
| --- | --- |
| Unit tests | 65 passed |
| Astro / Worker types | 0 errors, warnings or hints across 64 files |
| Production-mode local build | 20 pages generated |
| Production artifact verifier | 29 files passed, using the explicit local test-CAPTCHA override |
| Requested responsive widths | 320, 390, 611, 768, 1030 and 1440px; no horizontal overflow |
| 390×844 opening view | Stay choices end at y=444px; first activity name ends at y=677px, above the sticky action |
| Default 390px page height | 2,952px, compared with the earlier 13,531px audit; catalogue remains available on demand |
| Editing journeys | Change/Cancel, filter/empty-state recovery, explicit existing-activity moves, Remove, Undo, notification dismissal, Reset and Done passed |
| State / booking journeys | Restored plans, v1 compatibility, explicit length links, seasonal pool placement, unavailable storage, missing arrival, equal dates and both genuine conflict choices passed |
| Wedding gallery | All five photographs and labels checked at all six widths; keyboard, fullscreen and touch-pointer swipes passed; vertical gestures do not advance |
| Image loading | Delayed images preserve the current view; stale requests cannot overwrite a newer choice; failures retain the current image and support retry |
| Accessibility automation | No axe WCAG 2 A/AA or 2.1 AA violations in suggested mobile, picker mobile or wedding mobile states |
| Small viewport | At 390×500, picker context and confirmation controls remain visible, with a scrollable experience list |
| PDF / sharing | Three-night summer itinerary (3 pages) and shortened two-night plan with saved ideas (2 pages); all five PDF pages rendered and visually reviewed; closed days and meal notes remain in PDF/WhatsApp |
| Browser errors | None in the acceptance and edge-case runs |

Evidence is in `design/qa-2026-09-13-usability/`: browser results, six-width screenshots, five wedding-photo views, picker states, and PDF fixtures/renders. The browser journeys use isolated Chrome profiles and distant fixture dates; no enquiry, message, payment or production booking was sent. Touch-pointer simulation and automated accessibility checks do not replace a physical iOS/Android launch check. The earlier homepage performance limitation remains documented below; no new performance or conversion uplift is claimed.

---

# Earlier annotated website revisions — implementation and QA

Completed locally on 13 September 2026. The live website is unchanged. The earlier redesign and its test evidence remain in `design/qa-2026-09-12/`; this report covers the owner's latest annotated revisions.

## Changes

- Removed the unnecessary one-night FAQ while preserving normal one-night searches.
- Show all five individual room choices on the homepage, including double and twin bed configurations, with a prominent Presidential Suite card. The existing Maximojo handoff remains unchanged; no unsupported room preference is claimed as transmitted.
- Replaced the homepage's split introduction with the owner's sunset palace photograph as an immersive backdrop. Added a matching full-width wedding hero, elegant serif headings, transparent initial navigation and reservations below the homepage hero. Responsive AVIF images retain WebP fallbacks; key hero fonts are preloaded.
- Wedding gallery order: fireworks/reception, daytime garden celebration, amphitheatre celebration, celebration dining, private date. Corporate gallery order: boardroom, outdoor gathering, celebration dining. Ordering reflects editorial judgement, not a measured conversion ranking.
- Venue finders start with **Any layout**, showing all six wedding or seven corporate spaces. Filters and capacity-confirmation groups apply after a choice.
- The two-/three-night planner foregrounds Ram Raja Mandir, the guided fort visit and Chhatris/Betwa sunset. The extra day includes a sanctuary outing and Sound & Light Show. The catalogue mixes interests, with Ram Raja first; no measured popularity claim is made.
- Breakfast precedes activities on full days and check-out on the final day; dinner follows evening plans. Sanctuary, birdwatching, rafting and trekking selections include a packed-lunch offer to arrange with the hotel.
- Dated full-day pool visits use early morning in February–September and afternoon in October–January; undated plans default to afternoon. Season changes preserve other selected outings, retaining a pool idea in Unscheduled if its destination is occupied. Earlier saved plans migrate to version 2 without losing edits.
- **Save as PDF** opens the browser print/PDF options using a dedicated branded layout with the current edited plan, meals, unscheduled ideas and hotel contacts. No guest data is sent to a PDF service.
- Added favicon and touch-icon sizes using the supplied hotel emblem. Asset provenance is recorded in `content/media-manifest.csv`.

## Suite reel

The official Instagram embed script now loads only on request. The suite photograph remains visible during connection and the player is revealed after its iframe loads. Timeout/error handling provides retry and a persistent original-reel link; the player and its controls stay contained on mobile. The Worker CSP permits the official Instagram script and frame origins.

A real logged-out browser run with the Worker Content Security Policy applied loaded the owner's public reel and advanced video playback beyond one second. No CSP errors or failed requests were recorded. See `suite-live-provider.json` and `suite-live-provider-390.png`. Separate mocked tests verify blocked-script recovery, retry and successful transition; they are not used as evidence of real playback.

An attempted direct video download was previously rejected by automatic approval review because workspace credits were unavailable. No downloaded or expiring CDN video URL is used. The requested official embed now works in the verified local browser; production-domain and physical-device checks remain launch checks.

## Verification

| Check | Result |
| --- | --- |
| Astro and Worker TypeScript | 0 errors, warnings or hints across 64 files |
| Automated tests | 60 passed |
| Production-mode build | 20 pages generated |
| Production artifact verifier | 29 files checked with the explicit local test-CAPTCHA override |
| Responsive overflow | None on the five revised pages at 320, 390, 759, 1030 and 1440px |
| Browser interactions | Five homepage rooms, removed FAQ, favicon references, menu, gallery ordering, default/filtered/reset venues, seasonal planner, saved-state restoration and PDF actions passed |
| Accessibility automation | No axe violations for the checked WCAG 2 A/AA and 2.1 AA rules on the five revised pages |
| Console errors | None in the local interaction run |
| PDF exports | Three-night summer and edited two-night October plans exported; all 3 + 2 pages rendered and visually reviewed for clipping, overlap and page breaks |
| Real suite video | Public Instagram playback confirmed with deployment CSP applied |

The browser runs use isolated Chrome profiles. External services were blocked or mocked in interaction/accessibility tests; the real Instagram test was a separate provider run. No outbound enquiry, email or payment was submitted. PDF fixtures use distant test dates and should not be mistaken for a live travel quote. The two-night fixture intentionally includes unscheduled ideas retained when shortening a three-night plan.

## Performance

Final Lighthouse mobile lab measurements against the local Python static preview:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | 88 | 100 | 100 | 100 | 3.7 s | 0 | 0 ms |
| Weddings | 96 | 100 | 100 | 100 | 2.5 s | 0 | 10 ms |

The first revised-homepage measurement was 81 performance, 4.5s LCP and 0.074 CLS. Responsive AVIF images, matched image preloads and font preloads improved that to 88, 3.7s and approximately zero CLS. The 480px hero is 32KB AVIF; higher-density screens receive the 864px, 94KB version. Browser checks at 1× and 2× confirm the appropriate source and exactly one hero image request; WebP fallback also decodes successfully.

**The homepage still misses the planned 2.5s mobile LCP target in this uncompressed local lab run.** This remains a performance follow-up, not a passed acceptance criterion. The local server does not apply Cloudflare compression/cache headers; validate the actual deployment and continue optimization if needed. No field Core Web Vitals, INP or conversion uplift is claimed. Earlier redesign scores are historical and do not describe this revision.

## Evidence and launch scope

`design/qa-2026-09-13/` contains the latest browser JSON, screenshots, PDF fixtures and Lighthouse reports. Automated checks do not establish complete WCAG compliance or replace physical iOS Safari and Android Chrome checks.

Configure real CAPTCHA and Worker delivery secrets before deployment, rebuild and run the normal verifier without the local test override. Confirm reel playback on the production domain, carry out designated booking/enquiry delivery tests, and check real-device behaviour. No production deployment was performed in this task.
