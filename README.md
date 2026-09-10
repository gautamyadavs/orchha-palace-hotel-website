# Orchha Palace Hotel & Convention Centre

A mobile-first, conversion-focused Astro website for Orchha Palace. Cloudflare Workers Static Assets serves the Astro build, while the Worker enforces canonical redirects, security headers, cache policy and the event-enquiry API.

## Hosted preview

The public staging preview is deployed from `main` with GitHub Actions at:

https://gautamyadavs.github.io/orchha-palace-hotel-website/

The GitHub Pages build automatically applies the repository subpath. It remains `noindex` and uses preview media. Event submission is enabled only when the repository variables `PUBLIC_LEAD_API_URL` and `PUBLIC_TURNSTILE_SITE_KEY` are both configured; otherwise the form is disabled and direct sales email, call and WhatsApp paths remain visible.

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

Each room detail page has a category-specific gallery with previous/next controls, swipe support, keyboard navigation, captions, a photo count and a full-screen view.

## Booking handoff

`PUBLIC_BOOKING_URL` points to the verified Orchha Palace Maximojo engine. The website sends `checkin`, `checkout`, `nAdults`, `nChildrens`, optional `promocode`, and an optional management-approved `roomcode`, then continues in the same tab. Maximojo ignores its `nRooms` query value, so additional rooms are added inside the engine instead of collecting a room count that cannot be preserved.

The public engine currently exposes only Standard and Deluxe. Do not populate `maximojoRoomCode` or claim category-specific handoff until management and Maximojo have configured and checked the four online categories: Standard, Standard Twin, Deluxe and Deluxe Twin. The Presidential Suite has `bookingMode: "assisted"`; it must never receive a Maximojo room code or an online-booking action. The custom site never receives payment-card data, Maximojo passwords, PayU merchant credentials or payment callbacks.

A production build uses the approved repository content when Sanity is absent or incomplete. It still fails if selected production content is incomplete or references media that is not publication-approved.

Payment completion has not been tested by design. Staff must complete a controlled production booking before the site can be promoted from staging.

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
