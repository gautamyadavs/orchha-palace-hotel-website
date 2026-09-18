# Developer handoff — Orchha Palace Hotel & Convention Centre

Prepared: **18 September 2026**. This document describes the inspected working directory, including its uncommitted changes. It is the technical onboarding guide; the existing launch checklist and deployment records remain supporting evidence.

**Contents:** [Start here](#1-start-here) · [Setup](#2-local-setup-and-commands) · [Access](#3-accounts-and-access-to-transfer) · [Architecture](#4-architecture-and-source-map) · [Business rules](#5-business-rules-and-browser-state) · [Enquiry API](#6-event-enquiry-api) · [Content and integrations](#7-content-design-and-optional-integrations) · [Release and rollback](#8-release-and-rollback) · [Verification and open work](#9-verification-baseline-and-open-work) · [Troubleshooting](#10-troubleshooting) · [Supporting records](#11-supporting-records) · [Transfer inventory](#12-source-transfer-inventory).

## 1. Start here

Orchha Palace is a static Astro website served through a Cloudflare Worker. It promotes stays, weddings and corporate events; transfers room searches to Maximojo; emails event enquiries through Resend; and includes a browser-based Orchha itinerary planner. The website has no guest accounts, reservation database or payment-processing backend.

| Item | Location / recorded state |
| --- | --- |
| Source repository | [gautamyadavs/orchha-palace-hotel-website](https://github.com/gautamyadavs/orchha-palace-hotel-website) |
| Production | [orchhapalace.com](https://orchhapalace.com) |
| Canonical hostname | `orchhapalace.com`; `www` redirects with HTTP 308 |
| GitHub Pages preview | [Preview website](https://gautamyadavs.github.io/orchha-palace-hotel-website/) |
| Preflight Worker URL recorded in runbook | `https://orchha-palace-hotel-preflight.orchhapalace-hotel.workers.dev` |
| Inspected branch / committed HEAD | `main` / `7505f185d6b0fc288847ca45afcaae728d1500c4` |
| Latest recorded release | 18 September 2026, mobile homepage hero and Kids Zone |
| Latest recorded Worker version | `15507f2c-83f6-4871-b0e0-c9026f8f1c79` |
| Recorded previous Worker version | `79726066-abe6-4405-b3b3-482385ebcf47` |

**Transfer the current working source, not just the committed HEAD.** At preparation time, 14 tracked files had changes and additional implementation files, images and release evidence were untracked. The recorded September 15–18 releases include work newer than the committed source. A fresh clone alone will therefore miss that work until it is reviewed, committed and pushed.

Latest-version statements above come from repository deployment records. This documentation task did not query the live Cloudflare account, deploy, submit an enquiry or make a reservation.

### First-day sequence

1. Receive repository and service access listed in section 3.
2. Reconcile the current working directory with Git, including the files listed in section 12. Preserve the existing changes.
3. Install the locked dependencies, start the site and run the checks below.
4. Read the booking and enquiry contracts before changing either journey.
5. Confirm the current production deployment in Cloudflare before any release or rollback.

## 2. Local setup and commands

The project requires **Node.js >=22.12.0**. Both checked-in CI workflows use **22.12.0**; use that version when reproducing CI. npm and `package-lock.json` are the dependency workflow. No Node version-manager file is checked in.

For a new checkout, after the latest source has been transferred:

```sh
git clone https://github.com/gautamyadavs/orchha-palace-hotel-website.git
cd orchha-palace-hotel-website
npm ci
cp .env.example .env
npm run dev
```

Copy `.env.example` only when `.env` does not already exist. For ordinary local work, keep `DEPLOY_TARGET=local` and `PUBLIC_SITE_STATUS=staging`; leave `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_LEAD_API_URL` empty. This keeps the enquiry form disabled with visible direct-contact alternatives. The example endpoint contains `YOUR-SUBDOMAIN` and is not a working service address.

Open the URL printed by Astro, normally `http://localhost:4321`. Neither `astro dev` nor `astro preview` runs the Cloudflare Worker, its API, redirects or response headers. `npm test` exercises the Worker using mocked dependencies without sending email. Wrangler-based testing is needed for the complete serving layer; its configured preflight environment is a deployed service, not a local mock.

| Command | Purpose / consequence |
| --- | --- |
| `npm ci` | Install versions from the lockfile |
| `npm run dev` | Astro development server |
| `npm run check` | Astro diagnostics, then Worker TypeScript checking |
| `npm test` | Node test runner over `tests/*.test.ts` |
| `npm run build` | Generate static website in `dist/` |
| `npm run preview` | Serve the generated static website locally |
| `npm run verify:production` | Inspect an already-built production artifact |
| `npm run sanity` | Start optional Sanity Studio |
| `npm run sanity:deploy` | Publish optional Sanity Studio |
| `npm run cf-typegen` | Generate Wrangler binding types |
| `npm run deploy` | Build, verify and deploy to the production Worker; does not itself run tests/type checks |
| `npm run deploy:preflight` | Deploy the existing `dist/` and Worker to preflight; does not build first |

### Configuration ownership

All `PUBLIC_*` values are public build configuration. Changing them requires a new build. Never place a secret in a `PUBLIC_*` variable.

| Variable | Usage |
| --- | --- |
| `DEPLOY_TARGET` | `local`, `github-pages` or `cloudflare`; Pages uses a repository subpath |
| `GITHUB_REPOSITORY` | Required for a Pages build, e.g. `gautamyadavs/orchha-palace-hotel-website` |
| `PUBLIC_SITE_URL` | Production canonical origin is `https://orchhapalace.com`; Pages CI derives its origin from GitHub |
| `PUBLIC_SITE_STATUS` | `staging` adds page `noindex`; `production` activates production content validation and the same-origin lead endpoint |
| `PUBLIC_BOOKING_URL` | Official Maximojo URL, including the hotel `hid`; required by production build configuration |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public widget key; required by production build configuration |
| `PUBLIC_LEAD_API_URL` | Explicit enquiry endpoint; leave empty for production `/api/event-leads`; preview needs a full endpoint URL |
| `PUBLIC_GTM_ID` | Optional GTM container; analytics stay inactive when absent |
| `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` | Optional build-time CMS source; dataset defaults to `production` |
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` | Optional Studio/CLI configuration |
| `PUBLIC_MEDIA_PREVIEW` | Present in examples/workflows, but no current source code reads it; do not rely on it to enforce media approval |

`astro.config.mjs` reads required production settings from `process.env`. Export them in the invoking shell or supply them through CI, rather than relying solely on Astro's page-level `.env` loading. `PUBLIC_MAXIMOJO_SUPPORTS_SEARCH` appears in type declarations but has no active implementation switch.

Worker configuration is separate: `wrangler.jsonc` defines `ENVIRONMENT`, `LEAD_ALLOWED_ORIGINS`, `LEAD_FROM_EMAIL`, `LEAD_TO_EMAIL`, the `ASSETS` binding and `LEAD_RATE_LIMIT` KV binding. `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` are Cloudflare Worker secrets. The secret placeholders in `.env.example` are not an instruction to copy production secrets into local files.

## 3. Accounts and access to transfer

Invite the incoming developer to the existing services. Transfer credentials through the owner's approved credential manager, separately from this document.

| Service | Access / information needed | Why |
| --- | --- | --- |
| GitHub repository | Source, Actions, repository variables, protected `production` environment | Review source and run releases |
| Cloudflare | Hotel account, `orchhapalace.com` zone, Workers, KV, Turnstile and deployment logs | Hosting, routing, protection and rollback |
| Domain registrar | Owner-controlled DNS delegation access when required | Nameserver recovery; not needed for ordinary content releases |
| Resend | Sending domain `updates.orchhapalace.com`, delivery logs and API-key administration | Diagnose enquiry delivery |
| Hotel sales mailbox | Staff contact able to verify `sales@orchhapalace.com` receipt | Confirm real enquiry delivery |
| Maximojo / PMS contact | Staff/provider contact for room mapping and booking validation | Inventory, rates and category handoff |
| Sanity, if adopted | Actual project, dataset and editor/admin invitations | Optional CMS; not required for repository-backed operation |
| GTM / analytics, if adopted | Approved container and reporting access | Optional measurement; currently not wired into production workflow |

GitHub's `production` environment uses encrypted secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, plus variable `PUBLIC_TURNSTILE_SITE_KEY`. The runbook records a Cloudflare deployment-token expiry of **12 September 2027**; confirm the actual account value and renewal owner.

Worker secrets must exist independently in production and preflight. For an authorized rotation, use the interactive commands below; do not put values in command history:

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY --env=""
npx wrangler secret put RESEND_API_KEY --env=""
npx wrangler secret put TURNSTILE_SECRET_KEY --env preflight
npx wrangler secret put RESEND_API_KEY --env preflight
```

Existing KV namespaces and domains are already recorded in `wrangler.jsonc`. Do not recreate them as routine onboarding. Preserve hotel email MX/TXT records when handling DNS; Resend uses the `updates` subdomain.

## 4. Architecture and source map

```text
Repository data / optional Sanity
              |
       Astro static build
              |
            dist/
              |
Cloudflare Worker + ASSETS --------> HTML, CSS, JavaScript, images
              |
       POST /api/event-leads
              |
   Validation -> KV -> Turnstile -> Resend sales email
                                        -> guest acknowledgement

Browser room search ------------------> external Maximojo booking engine
Browser itinerary --------------------> localStorage / print / share links
```

The application uses Astro templates, TypeScript and CSS, with DOM-based browser interactions. There is no React application, server-rendered Astro adapter, database migration process or authentication system. Workers KV stores short-lived hashed-IP counters, not enquiry records. Guest enquiry details are delivered through email.

Locked core versions: Astro `7.2.10`, TypeScript `6.0.3`, Sanity `6.11.0`, `@sanity/client` `8.4.0`, Wrangler `4.127.1`. See `package-lock.json` for the exact full dependency graph.

| Path | Responsibility |
| --- | --- |
| `src/pages/` | File-based routes and page-specific copy/SEO |
| `src/layouts/BaseLayout.astro` | Metadata, shared chrome, fonts, CSS order, booking dialog and global script |
| `src/components/` | Booking forms, hero, room gallery/chooser, event forms, venue finder, planner and carousel |
| `src/data/site.ts` | Approved local room, dining, venue, amenity and media catalogue |
| `src/data/activities.ts` | 21 experiences and two-/three-night itinerary templates |
| `src/data/clients.ts` | Nine corporate-client logos with provenance |
| `src/data/betwa-view-dining.ts` | Sister-property dining identity, contact, image variants and Restaurant structured data |
| `src/lib/cms.ts`, `src/lib/types.ts` | CMS read/projection/fallback rules and shared data types |
| `src/lib/contact.ts` | Hotel telephone, email, address, maps and intent-specific WhatsApp links |
| `src/lib/booking.ts`, `booking-state.ts` | Search validation, Maximojo URL contract and session state |
| `src/lib/itinerary.ts`, `itinerary-print.ts` | Planner state transitions, migration, summaries and print export |
| `src/lib/venues.ts`, `enquiry-options.ts` | Venue matching and server/client shared enquiry choices |
| `src/scripts/site.ts` | Shared navigation, consent, booking, event form and gallery behaviour |
| Other `src/scripts/*.ts` | Room chooser, venue finder, itinerary planner and client carousel interactions |
| `src/styles/global.css`, `redesign.css` | Base design tokens/styles followed by redesign overrides |
| `worker/index.ts`, `lead-validation.ts` | HTTP routing, headers, redirects and event enquiry backend |
| `public/` | Static images, icons and robots file copied into the build |
| `sanity/schemaTypes/index.ts` | Optional Studio schemas |
| `tests/` | Booking, Worker, validation, itinerary and venue tests |
| `scripts/verify-production.mjs` | Production artifact guardrails |
| `.github/workflows/` | Automatic preview and manually dispatched production deployment |
| `content/`, `design/`, `design-qa.md` | Asset provenance, release records, sign-offs and historical QA evidence |

### Routes

The repository fallback produces **20 pages**, including the five room details and `404.html`.

| Route | Role |
| --- | --- |
| `/` | Homepage, palace hero, availability and editorial feature links |
| `/rooms/` | Five room choices, filters and two-room comparison |
| `/rooms/standard-room/`, `/rooms/standard-room-twin/` | Standard double/twin room details |
| `/rooms/deluxe-room/`, `/rooms/deluxe-room-twin/` | Deluxe double/twin room details |
| `/rooms/presidential-suite/` | Assisted reservations, gallery and on-demand Instagram reel |
| `/weddings/`, `/corporate-events/` | Separate venue-finding and two-step enquiry journeys |
| `/weddings-events/` | Legacy journey chooser with enquiry form |
| `/dining/` | Hotel dining and `/dining/#betwa-view-dining` sister-property feature |
| `/explore-orchha/` | Suggested stays and editable itinerary planner |
| `/hotel-amenities/`, `/gallery/`, `/contact/` | Amenities, imagery and contact information |
| `/offers/` | No active public offers; intentionally `noindex`, including in production |
| `/privacy/`, `/terms/`, `/booking-policies/` | Source-authored policy pages |
| `404.html` | Generated not-found page |

Legacy redirects live in `worker/index.ts`, including `/accommodation/` → `/rooms/`, conference URLs → `/corporate-events/`, `/wedding-blog/` → `/weddings/`, and `/room/*` → `/rooms/*`. Explicit legacy redirects return 301 and retain the query string. Use `withBase()` from `src/lib/paths.ts` for new internal links and asset paths so GitHub Pages continues to work under its subpath.

## 5. Business rules and browser state

### Booking

Official engine: `https://bookingengine.maximojo.com/?hid=India54468d49-cd5b-4af2-a615-303eda366eea`.

| Site field | Maximojo query parameter |
| --- | --- |
| `checkIn`, `checkOut` | `checkin`, `checkout`, ISO `YYYY-MM-DD` |
| `adults`, `children` | `nAdults`, `nChildrens` |
| Optional `promoCode` | `promocode` |
| Verified optional `roomCode` | `roomcode` |

The handoff continues in the same tab. Validation requires real dates, check-in today or later, checkout after check-in, 1–12 adults and 0–8 children. One-night bookings are supported.

Maximojo does not preserve this site's room-count parameter. `createBookingUrl()` removes guessed/legacy `rooms`, `nRooms`, `adults`, `children` and `promo` keys. Guests add further rooms inside the engine.

Four room categories are eligible for online booking: Standard, Standard Twin, Deluxe and Deluxe Twin. **No `maximojoRoomCode` is currently populated in the local catalogue.** Recorded engine verification exposed only Standard and Deluxe; staff/provider verification is needed before enabling category-specific handoff. Do not imply that a clicked room category was reserved or transmitted when no verified code exists.

**The Presidential Suite is always assisted-only.** Preserve `bookingMode: "assisted"`, suite-specific call/WhatsApp actions and the `assisted-suite` layout journey. It must not receive an online booking button or Maximojo room code. The site never receives card details, PayU credentials or payment callbacks.

### Contacts

| Purpose | Current source value |
| --- | --- |
| Reservations / primary phone | `+91 95160 06201`, `reservations@orchhapalace.com` |
| Wedding/corporate enquiry-card and group-stay Call links | `+91 95160 06204` |
| Sales email | `sales@orchhapalace.com` |
| Hotel WhatsApp | `+91 95160 06201`, with intent-specific text |
| Betwa View Dining at Orchha Resort | `+91 99935 42070`, Kanchan Ghat; separate from the Palace |

The September 15 sales-phone correction was scoped to event-page contact cards and group-stay links. Header/sticky controls, enquiry fallback text and acknowledgement email currently still use the primary number. Preserve that distinction unless the owner requests a broader change. The itinerary print footer and privacy-page email also contain literal contact text; inspect them when changing contacts globally.

### Venues and itinerary

Venue finders start at **Any layout**: six wedding spaces and seven corporate spaces. Numeric capacity is valid only for the selected, verified seating layout. Current numeric entries are Samrat Hall theatre 700, Bundela Darbar theatre 700, Diwan-e-Khas theatre 250 and Boardroom 14. Outdoor and unverified layout capacities require staff confirmation.

The itinerary planner offers two- and three-night suggestions, contextual Change/Move/Remove, saved ideas, Undo, date-conflict handling, and copy/WhatsApp/print sharing. Both stays retain arrival-evening aarti, the fort, a short conditional sanctuary outing and Chhatris sunset followed by Betwa View Dining. The three-night suggestion adds rafting, pool/garden time and the Sound & Light Show on day 3. After rafting, pool timing is early evening for February–September and afternoon for October–January or undated plans. Check `poolSlot()` when editing other pool placements; seasonal handling also covers custom plans.

PDF export uses the browser print dialog and local print CSS. There is no PDF service or automatic reservation of activities. Keep meal guidance and saved ideas in shared/printed output, and preserve existing custom plans when changing templates.

| Browser key | Storage | Contract |
| --- | --- | --- |
| `orchha_booking_v1` | `sessionStorage` | Shared dates/occupancy/promo; room code is not persisted; memory fallback |
| `orchha_itinerary_v1` | `localStorage` | Saved data is **version 2** despite the key name; version 1 restoration remains supported |
| `orchha_analytics_consent` | `localStorage` | `accepted` / `declined`; analytics require both a GTM ID and accepted consent |

Maintain the planner's migration/validation logic and focus restoration when changing its DOM. Essential journeys must continue working if storage is unavailable. Gallery captions, image and selected thumbnail update together after decoding; keep the slow-load/failure handling when editing galleries.

## 6. Event enquiry API

Endpoint: `POST /api/event-leads`. JSON body, exact permitted `Origin`, and a Turnstile token for action `event-enquiry` are required in production. `OPTIONS` returns CORS preflight information. The browser selects `PUBLIC_LEAD_API_URL` first, otherwise the same-origin endpoint in production. A missing endpoint or public key disables the form at build time.

### Payload

| Field | Requirement |
| --- | --- |
| `name` | Required, 2–100 characters |
| `phone` | Required, 7–30 characters matching digits, spaces, `+`, parentheses or hyphens |
| `email` | Required, valid basic format, max 160 characters; normalized to lowercase |
| `eventType` | Required; one of the shared values in `src/lib/enquiry-options.ts` |
| `guestCount` | Required integer, 2–5000 |
| `consent` | Must be boolean `true` |
| `tentativeDate` | Optional valid `YYYY-MM-DD`, today or future; Worker comparison uses UTC date |
| `preferredVenue` | Optional; one of the shared venue names |
| `message` | Optional, max 2000 characters |
| `journey` | Optional `wedding` or `corporate` |
| `organisation`, `functions`, `avNeeds` | Optional strings, max 160 / 500 / 500 characters |
| `seatingLayout` | Optional `Theatre`, `Banquet`, `Classroom`, `Boardroom` or `Outdoor` |
| `guestRooms` | Optional integer, 0–500 |
| `turnstileToken` | Max 2048 characters; verified against hostname and action |
| `website` | Honeypot; must be empty |
| `submissionId` | Optional UUID for older clients; current browser sends one and retains it across ambiguous retries |

The Worker rejects bodies over **16,000 bytes**. It applies a KV counter keyed by a truncated SHA-256 hash of the Cloudflare client IP. The code rejects after five counted attempts; each increment resets a 3600-second TTL, and counting occurs before CAPTCHA verification. This is a KV read/modify/write limit, not an atomic global quota.

Allowed origins are the GitHub Pages origin, apex and `www`. Production requests without an allowed Origin are rejected. Missing KV, missing required secrets, missing client IP or failed upstream protection produce safe failures. Turnstile and Resend requests each have a 10-second timeout.

### Delivery and responses

1. Validate sender `enquiries@updates.orchhapalace.com` and the sole sales recipient `sales@orchhapalace.com`.
2. Await Resend acceptance of the sales notification, with guest email as `Reply-To`.
3. Send the guest acknowledgement as best effort, with sales as `Reply-To`, using `context.waitUntil()` on the deployed Worker.
4. Use separate `event-lead-staff-<submissionId>` and `event-lead-guest-<submissionId>` idempotency keys.

HTTP 200 with `{"ok":true}` means the critical send was accepted by the email provider; actual inbox delivery is checked in Resend/mailbox evidence. It does not confirm a venue booking. Guest-acknowledgement failure does not turn a successful staff send into an API failure. There is no lead database or application retry queue.

| Status | Meaning |
| --- | --- |
| `200` / `204` | Send accepted / allowed preflight |
| `400` | Invalid data, honeypot, or failed CAPTCHA validation |
| `403` | Origin rejected |
| `405` | Unsupported method |
| `413` / `415` | Body too large / unsupported content type |
| `429` | Submission counter exceeded |
| `503` | Protection/configuration/upstream/send failure |

Errors normally return `{"ok":false,"message":"..."}` with `Cache-Control: no-store`. The frontend retains direct sales email, call and WhatsApp alternatives and does not claim success on a failed response. Check Resend by submission ID before manually resending an ambiguous enquiry.

## 7. Content, design and optional integrations

### Where to make routine changes

| Change | Edit |
| --- | --- |
| Room copy, amenities, galleries or booking mode | `src/data/site.ts`; room rendering is `src/pages/rooms/[slug].astro` |
| Hotel contacts | `src/lib/contact.ts`; inspect hardcoded policy/print text too |
| Venue descriptions/capacities | `src/data/site.ts`; update `src/lib/enquiry-options.ts` if adding/renaming selectable venues |
| Experiences and suggested stays | `src/data/activities.ts`; update related itinerary tests |
| Betwa feature | `src/data/betwa-view-dining.ts`, `src/components/BetwaDiningFeature.astro` |
| Corporate logos | `src/data/clients.ts`, `public/images/clients/`, provenance register |
| Homepage hero | `src/pages/index.astro`, `PalaceHero.astro`, `redesign.css`; keep preloads aligned in `BaseLayout.astro` |
| Navigation / shared actions | `Header.astro`, `Footer.astro`, `MobileStickyBar.astro` and layout journey |
| Page title, description, schema | Page's `BaseLayout` props; shared metadata in layout |
| Policies and offers | Corresponding `.astro` pages; currently not read from CMS |

`BaseLayout.astro` imports `global.css` first and `redesign.css` second. The later stylesheet overrides shared tokens and many component rules. Check both before changing a selector. The palette is ivory/maroon with Cormorant Garamond headings and Manrope body text, served from bundled font assets.

The latest homepage intentionally shows the **complete landscape image with welcome text underneath below 960px**; desktop remains immersive. Do not apply that rule to the wedding hero. The homepage room feature is one editorial image and link; all five choices remain on `/rooms/`. The amenities feature now displays Kids Zone. Wedding galleries contain six complete photographs using the optional uncropped presentation; room gallery defaults differ.

For media, add appropriately sized local derivatives, accurate alt text and image dimensions, then update `content/media-manifest.csv`. Record source, mapping and publication approval. The current repository imagery was owner-approved; that approval does not automatically cover future assets. Production data validation checks `publishApproved` and rights status. Google Photos is a source archive, not a production image host. Betwa View Dining must remain identified as a sister-property venue with its own contacts.

Images under `/images/` have a seven-day browser cache. Prefer a new filename when replacing an image so returning users receive the new version. Hashed `/_assets/` files have one-year immutable caching; ordinary pages revalidate. Headers and the Content Security Policy are implemented in the Worker.

### Sanity: implemented support and limits

Sanity is optional and queried **at build time**. Without its project ID, or when the fetch is unavailable/incomplete, the site uses the approved repository catalogue. Changes in Studio require a website rebuild; no CMS webhook is checked in.

`getSiteData()` sanitizes CMS records and uses CMS catalogue output only when rooms, dining, venues, amenities and media are all nonempty. This is a nonempty-category check, not a guarantee that every expected room exists. Activities are overlaid onto known local IDs; client logos retain approved local paths; itinerary templates are validated through restoration logic. The Presidential reel remains sourced from the local fallback.

The Studio has `offer`, `policy` and `globalSettings` schemas, but the website query does **not** consume them. Booking URL and contacts remain in configuration/source. Do not promise that changing those Studio documents updates the website.

Before activating CMS imagery, resolve the serving policy: CMS image projections return remote asset URLs, while the current Worker `img-src` policy does not permit the Sanity image CDN. Either ingest approved images locally or make and validate a narrowly scoped CSP change. The production workflow also needs explicit environment mappings for optional Sanity variables; creating GitHub variables alone does not pass them into the build.

### Analytics and embedded media

`src/lib/analytics.ts` drops events unless a GTM ID exists and consent is accepted. Events include booking-sheet opens, room comparison, engine handoff, event form start/completion/failure and planner handoff. Do not put enquiry contact details into analytics events. The checked-in production workflow does not supply `PUBLIC_GTM_ID`; enabling analytics requires an approved container, workflow wiring and a fresh consent check.

The Presidential Suite Instagram script loads only when requested, with a retained photo, retry state and original-reel link. The Worker CSP permits the official Instagram script/frame origins. The Betwa resort reel is an external link. Preserve local-photo fallbacks when these providers are unavailable.

## 8. Release and rollback

### Environments

| Environment | Trigger / artifact | Important behaviour |
| --- | --- | --- |
| Local | `npm run dev` | Astro only; no Worker backend |
| GitHub Pages | Push to `main` or manual `deploy.yml` run | Repository subpath, staging/noindex; external lead URL and public key required for submission |
| Preflight Worker | `npm run deploy:preflight` after building | Separate Worker/KV; production-grade protection, `workers.dev` noindex headers/robots |
| Production Worker | Manual `production.yml` dispatch | Root paths, apex + `www` Custom Domains, existing runtime secrets |

The preview workflow does not run the full test/type-check gates. Production workflow runs `npm ci`, tests, checks, `git diff --check`, build, artifact verification and strict Wrangler deployment. The runbook records the GitHub `production` environment as restricted to `main`; account configuration was not rechecked for this handoff.

### Production build and verification

For a reproducible repository-backed build, export public configuration. The public Turnstile key below is the value recorded in the runbook; confirm it remains the configured widget before a release. It is not the Turnstile secret.

```sh
export DEPLOY_TARGET=cloudflare
export PUBLIC_SITE_URL=https://orchhapalace.com
export PUBLIC_SITE_STATUS=production
export PUBLIC_MEDIA_PREVIEW=false
export PUBLIC_BOOKING_URL='https://bookingengine.maximojo.com/?hid=India54468d49-cd5b-4af2-a615-303eda366eea'
export PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAEmnNIWctv7ZfMf2
export PUBLIC_LEAD_API_URL=''
export PUBLIC_SANITY_PROJECT_ID=''
export PUBLIC_GTM_ID=''
unset ALLOW_TEST_CAPTCHA
npm test
npm run check
git diff --check
npm run build
npm run verify:production
```

Stop on any failed command. Empty CMS/GTM values reproduce the repository-backed baseline; supply reviewed integration configuration when intentionally enabling those services. A normal staging build is expected to fail `verify:production`.

The verifier checks canonical origin, production indexing, enabled enquiry markup, same-origin API URLs, Turnstile action, recognized test-key patterns, root paths and common server-secret markers in generated text files. It does not prove that secrets are configured remotely or that email/payment works. Do not use `ALLOW_TEST_CAPTCHA=true` for a release.

For an authorized CLI release, first inspect the current deployment and retain its version ID, then:

```sh
npx wrangler deploy --env="" --dry-run --strict
npx wrangler deploy --env="" --strict
```

Alternatively dispatch **Deploy production to Cloudflare** from GitHub Actions after the complete source has reached `main`. Do not deploy a Pages/subpath artifact to the production Worker. The `run_worker_first` asset setting is required for canonical redirects, security headers and API routing.

### Post-release acceptance

- Confirm homepage, room list/details, both event journeys, Dining, Explore, amenities and the expected 404.
- Confirm `www` redirects to the apex with path/query retained, and representative legacy 301 redirects still work.
- Check production canonical tags, `robots.txt`, sitemap and response headers; preview hosts must remain noindex.
- Test dates/occupancy/promo through the Maximojo handoff without completing a purchase; verify Suite call/WhatsApp actions remain assisted-only.
- Check menu, booking dialog, filters, galleries and planner on mobile and desktop, including widths immediately below/at 960px.
- When staff has scheduled a controlled delivery test, verify Turnstile, sales receipt, guest acknowledgement and Reply-To behaviour through the actual provider/mailboxes.
- Record deployment version, previous version, relevant source commit, checks and evidence under `content/deployment-snapshots/`.

### Recovery

Application rollback uses a previously verified Worker version. The latest recorded previous version is shown below; confirm it in Cloudflare before use, as later deployments may supersede it:

```sh
npx wrangler rollback 79726066-abe6-4405-b3b3-482385ebcf47 --env=""
```

Repeat the same smoke checks after rollback and preserve the source/release record that produced the recovered version. A Worker rollback does not restore external provider configuration or DNS changes.

For email-only failure, the current API fails safely and exposes fallback contact options. **Removing the public Turnstile key is not a valid production rebuild procedure:** `astro.config.mjs` rejects a production build without that key. If an explicit maintenance state is needed, implement a reviewed form-disable flag or rendering change while retaining required build configuration, then test and deploy it.

The historical pre-cutover DNS export is evidence, not a guaranteed working rollback destination: the runbook records no working legacy web origin before cutover. Coordinate any routing/DNS recovery with the owner, preserving mail records.

## 9. Verification baseline and open work

Fresh local checks performed while preparing this handoff:

| Check | Result |
| --- | --- |
| Runtime used | Node `26.3.0`, npm `11.16.0`; CI remains pinned to Node `22.12.0` |
| `npm test` | **68 passed**, 0 failed |
| `npm run check` | **0 errors, 0 warnings, 0 hints**; Astro inspected 68 files and Worker type check passed |
| Explicit production-mode build | **20 pages** generated from repository content |
| `npm run verify:production` | **29 generated text files passed**, without a test-CAPTCHA override |

Worker tests intentionally log simulated provider/protection failures; these are expected when the test suite exits successfully. Browser checks, account access, strict deployment dry run, live delivery, payment and physical-device checks were not rerun for this documentation task.

Historical evidence includes September 18 local/live checks at 320, 390, 430, 640, 768, 844, 959, 960 and 1440px. Earlier reports include gallery loading/swipe/focus checks, planner storage/Undo/printing, axe scans and a real logged-out Instagram playback test. Those reports describe their own date, mocks and limitations; they are not a current full-site certification. No repeatable browser-test npm command or browser-test CI job is checked in.

| Follow-up | Owner / completion evidence |
| --- | --- |
| Reconcile uncommitted deployed changes with repository | Outgoing + incoming developer; a reviewed commit containing all implementation assets and release records |
| Verify four Maximojo category mappings before adding room codes | Hotel reservations + Maximojo/PMS; recorded per-category handoff checks |
| Controlled payment completion and cancellation/amendment test | Authorized hotel staff; launch handoff still has blank evidence fields |
| Confirm production enquiry delivery after transfer/integration changes | Developer + sales; recorded Resend and inbox receipt, correct Reply-To; preflight delivery was documented on September 11 |
| Final physical iOS Safari / Android Chrome checks | Incoming developer or QA; real-device evidence |
| Recheck homepage performance on the deployed site | Incoming developer; earlier local mobile Lighthouse LCP was 3.7s against a 2.5s target, predating the latest hero change |
| Complete outstanding policy ownership/sign-off fields | Hotel management; occupancy/child policy owner, cancellation/refund owner and privacy-contact sign-off |
| Confirm optional Sanity/GTM scope and preflight retention | Owner + developer; no assumption that optional integrations or historical cleanup were completed |
| Confirm deployment-token renewal ownership | Cloudflare account owner; verify the recorded September 2027 expiry |

## 10. Troubleshooting

| Symptom | Check first |
| --- | --- |
| Production build fails before rendering | Export `PUBLIC_BOOKING_URL` and `PUBLIC_TURNSTILE_SITE_KEY`; inspect `process.env` configuration without printing secrets |
| Enquiry controls are disabled | Built page's public key and resolved endpoint; local staging defaults intentionally disable it |
| Enquiry returns 403 | Exact browser Origin versus `LEAD_ALLOWED_ORIGINS`; current allowlist excludes localhost |
| Enquiry returns 400 after valid fields | Turnstile token, widget hostname and `event-enquiry` action; also shared enum/date validation |
| Enquiry returns 429 | KV attempt counter; it includes attempts that later fail CAPTCHA |
| Enquiry returns 503 | Worker logs, required secrets, KV binding, sender/recipient configuration and provider timeouts |
| Guest acknowledgement missing but form succeeded | Resend acknowledgement log; staff send may already have succeeded |
| CMS edits do not appear | Build-time fetch, dataset, required nonempty collections, validation/fallback warning and rebuild |
| CMS images fail only behind the Worker | CSP image-origin restrictions |
| Pages preview links/assets fail | `DEPLOY_TARGET`, `GITHUB_REPOSITORY` and use of `withBase()` |
| Production verifier reports preview paths/noindex | Wrong build target/status or stale `dist/`; rebuild with production configuration |
| A replaced photo remains old | Seven-day `/images/` cache; use a new asset filename and rebuild references |
| Planner seems to ignore new suggestions | Saved custom itinerary restoration; Reset to suggested stay intentionally applies the new template |
| CSS edit seems ineffective | Later `redesign.css` override and active breakpoint |
| Suite reel fails to load | External provider availability, CSP and retry/original-link fallback |

Cloudflare observability is enabled in `wrangler.jsonc`. Use its Worker logs for runtime errors and Resend for actual delivery state. The repository does not configure a separate error-tracking or uptime-monitoring service.

## 11. Supporting records

- [README](README.md): project overview and existing integration notes.
- [Deployment runbook](content/deployment-runbook.md): provisioned resources, preflight evidence and release history.
- [Launch handoff](content/launch-handoff.md): management/business sign-offs; some launch-era wording and fields remain incomplete.
- [Latest release snapshot](content/deployment-snapshots/mobile-hero-kids-zone-2026-09-18.json): latest recorded deployment and previous version.
- [Latest local browser checks](design/qa-2026-09-18/checks.json) and [live browser checks](design/qa-2026-09-18/live-checks.json).
- [Design QA history](design-qa.md): historical interaction, accessibility, print and performance evidence; read dates and superseding notes.
- [Media manifest](content/media-manifest.csv) and [room image audit](content/room-image-audit.md).
- [Corporate logo register](design/corporate-logo-register.md), [activity register](design/itinerary-activity-register.md) and [Betwa media notes](design/betwa-dining-media.md).

For implementation behaviour, use the source and current configuration. For release status, use the most recent dated snapshot and confirm the Cloudflare deployment before acting. Older QA statements such as “not deployed” describe their original review pass.

## 12. Source-transfer inventory

This is the pre-existing work observed before adding this handoff. It is not a request to discard, reset or overwrite anything.

**Modified tracked files:**

```text
content/deployment-runbook.md
content/launch-handoff.md
content/media-manifest.csv
src/components/AvailabilityBar.astro
src/components/EventPage.astro
src/components/PalaceHero.astro
src/data/betwa-view-dining.ts
src/layouts/BaseLayout.astro
src/lib/contact.ts
src/pages/dining.astro
src/pages/explore-orchha.astro
src/pages/hotel-amenities.astro
src/pages/index.astro
src/styles/redesign.css
```

**Untracked implementation and release files:**

```text
src/components/BetwaDiningFeature.astro
public/images/betwa-view-dining-480.webp
public/images/betwa-view-dining-800.webp
public/images/betwa-view-dining-1280.webp
public/images/betwa-view-dining-1600.webp
content/deployment-snapshots/phone-correction-2026-09-15.json
content/deployment-snapshots/betwa-dining-2026-09-15.json
content/deployment-snapshots/mobile-hero-kids-zone-2026-09-18.json
design/betwa-dining-media.md
```

**Untracked evidence directories:** `design/audit-2026-09-11/`, `design/qa-2026-09-12/`, `design/qa-2026-09-13/`, `design/qa-2026-09-13-editorial/`, `design/qa-2026-09-13-usability/`, `design/qa-2026-09-15-betwa/`, `design/qa-2026-09-18/`.

Include this document and its README/runbook documentation updates in the reviewed transfer. Review evidence files before publishing them to a repository. Exclude local `.env`, `.wrangler/`, `node_modules/`, `.astro/` and generated `dist/` from a source package; preserve the lockfile, public assets, source, tests and deployment configuration. The transfer is complete when the receiving developer can reproduce the build from the transferred source and the owner has confirmed the required account access.
