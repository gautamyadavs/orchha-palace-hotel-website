# Orchha Palace Hotel & Convention Centre

A mobile-first, conversion-focused Astro website for Orchha Palace. Cloudflare Workers Static Assets serves the Astro build, while the Worker enforces canonical redirects, security headers, cache policy and the event-enquiry API.

**Developer handoff:** Start with [DEVELOPER_HANDOFF.md](DEVELOPER_HANDOFF.md) for setup, architecture, source-transfer requirements, account access, integration contracts, release/rollback instructions and verified open work as of 18 September 2026.

## Hosted preview

The public staging preview is deployed from `main` with GitHub Actions at:

https://gautamyadavs.github.io/orchha-palace-hotel-website/

The GitHub Pages build automatically applies the repository subpath. It remains `noindex` and uses preview media. Event submission is enabled only when the repository variables `PUBLIC_LEAD_API_URL` and `PUBLIC_TURNSTILE_SITE_KEY` are both configured; otherwise the form is disabled and direct sales email, call and WhatsApp paths remain visible.

## Interactive guest journeys

The September redesign adds an immersive palace homepage with one editorial rooms-and-suites photograph and description, leading to all five choices on `/rooms/`; shared room-search dates and occupancy; bed/bathtub filters and two-room comparison; separate `/weddings/` and `/corporate-events/` pages with venue selection and two-step enquiries; and a nine-logo corporate carousel with reduced-motion and static alternatives. `/weddings-events/` remains a legacy journey chooser.

`/explore-orchha/` leads with suggested two- and three-night stays in expandable chronological day cards. Customise opens contextual Change pickers, with Move/Remove under More, saved ideas and one-step Undo. The 21-experience catalogue stays collapsed until requested. It saves actual changes locally, exports the full itinerary through the browser print/PDF dialog and supports copy/WhatsApp sharing. Missing arrival dates are requested in context; date conflicts appear only when a valid room search differs from the itinerary. Both suggested stays include arrival-evening aarti, the fort, a short sanctuary outing and Chhatris sunset followed by Betwa View Dining at the sister property, Orchha Resort, by the river. The three-night stay adds morning rafting, one pool/garden period and the Sound & Light Show on day 3. After rafting, summer pool time is labelled early evening; October–January and undated plans use afternoon. Breakfast, lunch breaks, dinner and packed-lunch guidance remain in shared and printed plans. One-night searches remain available in the normal booking form. The Presidential Suite retains assisted reservations and adds the supplied Instagram reel on demand alongside its photographs.

`src/data/activities.ts` and `src/data/clients.ts` contain the source-backed catalogues. Venue finders start with Any layout and every space in that journey. After a selection, capacity is numeric only for verified seating layouts; other layouts require confirmation. The Sanity schemas and read mappings support the new content while retaining approved repository fallbacks.

The owner-selected palace exterior introduces the homepage rooms section. The wedding gallery has six complete photographs, with the indoor floral mandap following daytime celebration and fireworks. Betwa View Dining has visible content, directions, its own telephone and Restaurant structured data on `/dining/#betwa-view-dining`; it is clearly identified as a sister-property venue.

See `design/redesign-plan.md`, `design/corporate-logo-register.md` and `design-qa.md` for implementation scope, asset provenance and current QA evidence. The redesign was deployed to https://orchhapalace.com on 14 September 2026. Release and rollback details are in `content/deployment-snapshots/release-2026-09-14/`. A local test CAPTCHA key must never be used for deployment; `verify:production` rejects recognised test keys unless `ALLOW_TEST_CAPTCHA=true` is explicitly set for a local verification run.

## Local development

1. Copy `.env.example` to `.env` and keep all secrets out of Git.
2. Install dependencies with `npm install`.
3. Run `npm run dev` and open the local URL.
4. Run `npm run check`, `npm test`, and `npm run build` before release.

## Content and imagery

- The approved repository content is the production fallback and is validated during a production build. Sanity is optional; a complete approved dataset overrides the repository content when configured.
- Set the Sanity environment variables and run `npm run sanity` only if the hotel chooses to manage content through Sanity.
- All current repository assets and mappings were approved for production by the hotel owner on 4 September 2026. New assets must still be rights-cleared and marked `publishApproved: true` before production use.
- Google Photos is a source archive, not a production CDN. Download originals, set focal points and alt text, then publish responsive derivatives.
- People visibility remains recorded as metadata; `publishApproved` represents the owner's permission to publish the current asset.
- `content/media-manifest.csv` records source, category, people visibility, rights and mapping status for every asset.
- `content/room-image-audit.md` records the Standard/Deluxe cross-check, excluded people-visible photographs, Presidential Suite correction and room-size discrepancy.
- `content/launch-handoff.md` is the management sign-off checklist for booking parameters, room/venue mapping, policies and production integrations.

Each room detail page has a category-specific gallery with previous/next controls, swipe support, keyboard navigation, captions, a photo count and a full-screen view. The wedding gallery opts into complete, uncropped images in a responsive 3:2/16:9 frame, beginning with the daytime celebration. Photo, caption and thumbnail selection update together after decoding; choosing a thumbnail scrolls only its strip.

## Booking handoff

`PUBLIC_BOOKING_URL` points to the verified Orchha Palace Maximojo engine. The website sends `checkin`, `checkout`, `nAdults`, `nChildrens`, optional `promocode`, and an optional management-approved `roomcode`, then continues in the same tab. Maximojo ignores its `nRooms` query value, so additional rooms are added inside the engine instead of collecting a room count that cannot be preserved.

The public engine currently exposes only Standard and Deluxe. Do not populate `maximojoRoomCode` or claim category-specific handoff until management and Maximojo have configured and checked the four online categories: Standard, Standard Twin, Deluxe and Deluxe Twin. The Presidential Suite has `bookingMode: "assisted"`; it must never receive a Maximojo room code or an online-booking action. The custom site never receives payment-card data, Maximojo passwords, PayU merchant credentials or payment callbacks.

A production build uses the approved repository content when Sanity is absent or incomplete. It still fails if selected production content is incomplete or references media that is not publication-approved.

Payment completion has not been tested by design. A controlled payment-completion check remains a staff task; the live room-search handoff is verified separately.

## Event leads

The browser posts to `PUBLIC_LEAD_API_URL`, falling back to `/api/event-leads` for same-origin Cloudflare production hosting. The Worker accepts exact origins from `LEAD_ALLOWED_ORIGINS`, handles CORS preflight, validates bounded payloads and allowed form choices, checks the honeypot, verifies the Turnstile token, hostname and action, and applies a five-submissions-per-hour IP limit through `LEAD_RATE_LIMIT` KV.

The sales notification is sent only to `sales@orchhapalace.com` and is awaited as the critical delivery. The guest confirmation is sent afterward as best effort. Both Resend calls use separate submission-scoped idempotency keys; staff replies go to the guest and guest replies go to sales.

Verify `updates.orchhapalace.com` in Resend, then configure both the isolated preflight Worker and production Worker without placing either secret in Git:

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY --env preflight
npx wrangler secret put RESEND_API_KEY --env preflight
npx wrangler secret put TURNSTILE_SECRET_KEY --env=""
npx wrangler secret put RESEND_API_KEY --env=""
```

Before deploying, create a KV namespace for each environment and let Wrangler write the generated IDs into `wrangler.jsonc`:

```sh
npx wrangler kv namespace create LEAD_RATE_LIMIT --env preflight --binding LEAD_RATE_LIMIT --update-config
npx wrangler kv namespace create LEAD_RATE_LIMIT --env="" --binding LEAD_RATE_LIMIT --update-config
```

Keep `LEAD_TO_EMAIL=sales@orchhapalace.com` and ensure the Turnstile widget permits `gautamyadavs.github.io`, `orchhapalace.com` and `www.orchhapalace.com`.

After deployment, set these GitHub repository variables and rebuild Pages:

- `PUBLIC_LEAD_API_URL`: the preflight Worker `/api/event-leads` URL before cutover, then `https://orchhapalace.com/api/event-leads`
- `PUBLIC_TURNSTILE_SITE_KEY`: the public key for the allowed hostnames

If either public value or any server-side protection is unavailable, the form presents sales email, telephone and event-specific WhatsApp fallbacks without claiming success.

## Production deployment

`DEPLOY_TARGET=github-pages` is set only in the preview workflow. The manually dispatched production workflow sets `DEPLOY_TARGET=cloudflare`, builds with root-relative paths, verifies the artifact, and deploys through the protected `production` GitHub environment.

Configure these GitHub production-environment secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` scoped to the Orchha Palace Worker, KV and zone routes

Configure `PUBLIC_TURNSTILE_SITE_KEY` as a GitHub environment/repository variable. Worker email and Turnstile secrets stay in Cloudflare and are not copied to GitHub. Follow `content/deployment-runbook.md` for preflight, cutover and rollback.

## Security before launch

Rotate every credential exposed in the supplied reference image before connecting the domain, CMS, booking engine, email provider or analytics. None of those credentials are stored in this project.
