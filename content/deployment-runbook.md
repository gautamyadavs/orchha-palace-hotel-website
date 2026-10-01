# Production deployment runbook

## One-time service setup

1. Sign in with `npx wrangler login` and confirm the selected account owns the `orchhapalace.com` zone.
2. In Resend, add `updates.orchhapalace.com`, publish only the generated subdomain SPF/DKIM records, and wait for verification. Do not edit or remove the apex MX/TXT records used by hotel email.
3. Create a Turnstile widget named `Orchha Palace event enquiry` with only `gautamyadavs.github.io`, `orchhapalace.com`, and `www.orchhapalace.com` as allowed hostnames.
4. Create the preflight and production `LEAD_RATE_LIMIT` KV namespaces with the commands in `README.md`.
5. Enter `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` for both Wrangler environments with the interactive secret commands in `README.md`.
6. Set GitHub variable `PUBLIC_TURNSTILE_SITE_KEY`; set `PUBLIC_LEAD_API_URL` to the preflight Worker endpoint for the GitHub Pages delivery test.

### Provisioned resources

- Resend sending domain: `updates.orchhapalace.com` (verified; apex Google Workspace MX records unchanged)
- Turnstile public site key: `0x4AAAAAAEmnNIWctv7ZfMf2`
- Turnstile hostnames: `gautamyadavs.github.io`, `orchhapalace.com`, `www.orchhapalace.com`
- Preflight Worker: `https://orchha-palace-hotel-preflight.orchhapalace-hotel.workers.dev`
- Preflight KV namespace: `f451820f0f814c588ac414c611cfad7a`
- Production KV namespace: `f8c5af66eb594bce8ee8ada913523efb`
- GitHub `production` environment: deployments restricted to `main`; Cloudflare credentials stored as encrypted environment secrets; Turnstile site key stored as an environment variable
- Cloudflare deployment token: account-owned, scoped to Worker scripts/account reads and Worker routes for `orchhapalace.com`, expiring 2027-09-12

The Resend and Turnstile secret values are stored only in the two Cloudflare Worker environments. They must not be copied into GitHub variables, local environment files, or this runbook.

## Preflight without domain cutover

1. Build with the production variables and run `npm test`, `npm run check`, `npm run verify:production`, and `npx wrangler deploy --env="" --dry-run`.
2. Run `npm run deploy:preflight`; confirm its `workers.dev` HTML and `robots.txt` return `X-Robots-Tag: noindex, nofollow`.
3. Rebuild GitHub Pages with the preflight endpoint and production Turnstile site key.
4. Submit one clearly labelled controlled enquiry from GitHub Pages. Confirm the sales message reaches only `sales@orchhapalace.com`, contains every field, and replies to the guest. Confirm the guest acknowledgement arrives and replies to sales.
5. Confirm invalid origin, invalid Turnstile, sixth same-hour attempt, and simulated provider failure return safe JSON errors and expose no secrets.

### Preflight evidence

- 2026-09-11: GitHub Pages submitted a controlled enquiry through the preflight Worker and displayed the sales-team receipt confirmation.
- Resend reported the staff message delivered only to `sales@orchhapalace.com`; it contained every submitted field and used the guest address as `Reply-To`.
- Resend reported the separate guest acknowledgement delivered; it used `sales@orchhapalace.com` as `Reply-To`.
- The public preflight endpoint accepted the exact GitHub Pages origin and rejected an unapproved origin. Automated tests cover the remaining validation, Turnstile, rate-limit, timeout, idempotency, and provider-failure cases.
- Before cutover, public DNS delegated to `ns09.domaincontrol.com` and `ns10.domaincontrol.com`. The apex had no A/AAAA record and `www` pointed to the unresolved apex, so no working legacy web origin was available. Cloudflare assigned `jack.ns.cloudflare.com` and `olivia.ns.cloudflare.com`.

## Cutover

1. Export or screenshot the current apex and `www` DNS records, proxy state, SSL/TLS mode, redirect rules and current origin values. Record the latest working Worker deployment/version ID. The 2026-09-11 pre-cutover Cloudflare zone export is archived at `content/deployment-snapshots/cloudflare-dns-before-cutover-2026-09-11.txt`.
2. Keep the current web origin running. Do not alter apex mail MX/TXT records.
3. Configure the protected GitHub `production` environment with `CLOUDFLARE_ACCOUNT_ID`, the least-privilege `CLOUDFLARE_API_TOKEN`, and `PUBLIC_TURNSTILE_SITE_KEY`.
4. Manually dispatch `Deploy production to Cloudflare`. The final Wrangler configuration attaches both Custom Domains and disables production `workers.dev` access.
5. Verify `https://orchhapalace.com`, the `www` 308 redirect, representative legacy redirects, `robots.txt`, sitemap, 404, cache/security headers, booking handoff, and a real production enquiry.
6. Change GitHub `PUBLIC_LEAD_API_URL` to `https://orchhapalace.com/api/event-leads`, rebuild Pages, and remove the preflight Worker after the production endpoint is confirmed.

## Rollback

- Application regression: roll back to the recorded previous Cloudflare Worker deployment, then repeat smoke checks.
- Routing or platform failure: detach the Worker Custom Domains, restore the captured apex/`www` DNS and redirect configuration exactly, and confirm the previous origin is serving HTTPS again.
- Email-only failure: leave the site online and use its existing sales email/call/WhatsApp fallbacks while repairing Resend or Turnstile, without resubmitting ambiguous leads. Do not remove the public Turnstile key to disable the form: production builds require that key. If a visible maintenance state is needed, implement and verify a dedicated form-disable flag or rendering change while retaining required production configuration; see `../DEVELOPER_HANDOFF.md`.
- Do not enable HSTS preload or decommission the previous origin during the initial stabilization period.

## 14 September 2026 redesign release

- Published the owner-approved redesign with the existing authenticated Wrangler CLI after production build, strict dry run, tests, type checks and artifact verification passed.
- Live Worker version: `b121fb25-9392-4d63-9194-cad9c1768601`.
- Previous working version: `369414a2-7fa1-4cb4-8678-6321efd391d4`.
- Existing custom domains, KV, Turnstile/Resend secrets and mail DNS are retained.
- Source/artifact evidence: `deployment-snapshots/release-2026-09-14/`.
- Roll back the application if needed with `npx wrangler rollback 369414a2-7fa1-4cb4-8678-6321efd391d4 --env=""`, then repeat live checks. This command is a recovery instruction and was not executed.

## 15 September 2026 Betwa dining media release

- Live Worker version: `79726066-abe6-4405-b3b3-482385ebcf47`.
- Previous working version: `09e7ae64-df56-4836-a013-30876bb381d9`.
- Published the owner-selected responsive riverside photograph and optional Instagram resort reel link on Dining and Explore Orchha.
- Existing event and group-stay contact corrections remain verified live.
- Build, tests, type checks, artifact verification, strict dry run, responsive browser review and live page/asset checks passed.
- Release evidence: `deployment-snapshots/betwa-dining-2026-09-15.json` and `../design/qa-2026-09-15-betwa/`.

## 18 September 2026 mobile hero and Kids Zone release

- Live Worker version: `15507f2c-83f6-4871-b0e0-c9026f8f1c79`.
- Previous working version: `79726066-abe6-4405-b3b3-482385ebcf47`.
- The amenities photo feature now shows Kids Zone using the existing gallery photograph.
- Below 960px, the homepage shows the complete landscape photograph with the welcome copy underneath. Desktop and wedding hero layouts retain their existing treatment.
- Type checks, 68 tests, production artifact verification, strict deployment dry run and responsive browser checks at nine widths passed.
- Repeated the nine-width browser checks against the live site; image framing, Kids Zone photo, navigation and booking controls passed with no page errors.
- Release evidence: `deployment-snapshots/mobile-hero-kids-zone-2026-09-18.json` and `../design/qa-2026-09-18/`.

## 28 September 2026 dining and spa content release

- Live Worker version: `9ab15aea-5d34-4cd4-bea5-6832bfe4faf5`.
- Previous working version: `15507f2c-83f6-4871-b0e0-c9026f8f1c79`.
- Replaced the closed Madira with Patio Cafe and the owner-supplied photograph. Private dining remains a separate section on Dining with the existing garden image and WhatsApp/call arrangements; primary navigation is unchanged.
- Published eleven approved spa treatments with durations/prices at `/spa/`, linked from Hotel & amenities. Complete food menus and other unconfirmed facts remain pending in the integration plan.
- All 71 tests, type checks, production build, artifact verification and strict dry run passed. Live pages/assets matched the build, redirects passed, and the three changed service pages passed layout checks at nine widths from 320–1440px.
- Published from the local working tree based on `50c6f16d20825e97509799d158fe7b86fc3bb351`; this release's source changes have not yet been committed or pushed. Preserve them before a later CI deployment.
- Release evidence: `deployment-snapshots/dining-spa-2026-09-28.json` and `../design/qa-2026-09-28-content/`. Physical device and field-performance measurements are outside this verification.

## 28 September 2026 scrolled navigation fix

- Live Worker version: `68c7e19b-047f-4267-a53d-e2c7c737b6de`.
- Previous working version: `9ab15aea-5d34-4cd4-bea5-6832bfe4faf5`.
- The navigation drawer is now outside the header, preventing the scrolled header's backdrop filter from clipping it to header height. Opening and closing preserve page position; focus moves into the visible menu, returns on closing, and remains trapped while open.
- Verified at seven viewport sizes including short phone and landscape layouts. Live checks at 390px and 1440px showed all eight menu links visible and hittable after scrolling, with no page movement or console errors.
- 71 tests, type checks, build, artifact verification and strict dry run passed. Source changes remain in the local working tree.
- Release evidence: `deployment-snapshots/navigation-menu-2026-09-28.json` and `../design/qa-2026-09-28-menu/review.md`.
