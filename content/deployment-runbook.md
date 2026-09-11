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
4. Manually dispatch `Deploy production to Cloudflare`. The final Wrangler configuration attaches the canonical `orchhapalace.com` Custom Domain and disables production `workers.dev` access. The imported legacy `www` CNAME remains untouched unless the owner separately approves replacing it with a managed Worker domain.
5. Verify `https://orchhapalace.com`, representative legacy redirects, `robots.txt`, sitemap, 404, cache/security headers, booking handoff, and a real production enquiry. Verify the existing `www` behavior separately without changing its DNS record.
6. Change GitHub `PUBLIC_LEAD_API_URL` to `https://orchhapalace.com/api/event-leads`, rebuild Pages, and remove the preflight Worker after the production endpoint is confirmed.

## Rollback

- Application regression: roll back to the recorded previous Cloudflare Worker deployment, then repeat smoke checks.
- Routing or platform failure: detach the Worker Custom Domains, restore the captured apex/`www` DNS and redirect configuration exactly, and confirm the previous origin is serving HTTPS again.
- Email-only failure: leave the site online, disable the form by removing its public Turnstile key on the next build, keep the visible sales email/call/WhatsApp fallbacks, and repair Resend or Turnstile without resubmitting ambiguous leads.
- Do not enable HSTS preload or decommission the previous origin during the initial stabilization period.
