# Orchha Palace Hotel & Convention Centre

A mobile-first, conversion-focused Astro website for Orchha Palace. Static content is served directly by Cloudflare; only the event-enquiry endpoint runs through a Worker.

## Hosted preview

The public staging preview is deployed from `main` with GitHub Actions at:

https://gautamyadavs.github.io/orchha-palace-hotel-website/

The GitHub Pages build automatically applies the repository subpath. It remains `noindex`, uses preview media and does not expose the event-lead Worker until the production Cloudflare deployment is configured.

## Local development

1. Copy `.env.example` to `.env` and keep all secrets out of Git.
2. Install dependencies with `npm install`.
3. Run `npm run dev` and open the local URL.
4. Run `npm run check`, `npm test`, and `npm run build` before release.

## Content and imagery

- The code ships with curated preview fallback content so the site can be reviewed before a Sanity project is provisioned. It is intentionally `noindex` unless `PUBLIC_SITE_STATUS=production` is set.
- Set the Sanity environment variables and run `npm run sanity` to edit CMS content.
- Preview assets currently carry `rightsStatus: verify` and `publishApproved: false`. Only assets with `publishApproved: true`, exact room/venue mapping and confirmed usage rights may be promoted to production in Sanity.
- Google Photos is a source archive, not a production CDN. Download originals, set focal points and alt text, then publish responsive derivatives.
- Identifiable guests, children, wedding attendees, political/VIP subjects, screenshots and promotional graphics are excluded by default.
- `content/media-manifest.csv` records source, category, people visibility, rights and mapping status for every preview asset.
- `content/room-image-audit.md` records the Standard/Deluxe cross-check, excluded people-visible photographs, Presidential Suite correction and room-size discrepancy.
- `content/launch-handoff.md` is the management sign-off checklist for booking parameters, room/venue mapping, policies and production integrations.

Each room detail page now has a booking-platform-style gallery with category-specific thumbnails, previous/next controls, swipe support, keyboard navigation, captions, a photo count and a full-screen view. The staging set currently includes 2 Standard, 2 Standard Twin, 5 Deluxe, 3 Deluxe Twin and 5 Presidential Suite views; the management handoff tracks the remaining production photography gaps.

## Booking handoff

`PUBLIC_BOOKING_URL` is the single source for the Maximojo handoff. Until the hotel supplies the final public engine URL and its query contract, the preview offers call and WhatsApp reservations instead of guessing or linking to an unverified page. Set `PUBLIC_MAXIMOJO_SUPPORTS_SEARCH=true` only after end-to-end verification with Maximojo and PayU.

A production build intentionally fails unless Sanity is configured with complete content and people-free media that is both rights-cleared and publication-approved. This prevents preview photography or unverified room/venue mappings from reaching the public domain accidentally.

The custom site never receives payment-card data.

## Event leads

The Cloudflare Worker validates payloads, verifies Turnstile in production, rate-limits repeat submissions when the optional KV binding is configured, and sends both the hotel notification and guest confirmation through Resend.

Configure Worker secrets with:

```sh
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put RESEND_API_KEY
```

If email delivery is unavailable, the form presents the hotel telephone, email and WhatsApp fallbacks without claiming success.

## Security before launch

Rotate every credential exposed in the supplied reference image before connecting the domain, CMS, booking engine, email provider or analytics. None of those credentials are stored in this project.
