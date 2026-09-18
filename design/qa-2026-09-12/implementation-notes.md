# September redesign — implementation and QA

Completed locally on 13 September 2026. This replaces the earlier QA summary; captures from earlier designs remain historical references. No production deployment, real event enquiry, email or payment transaction was performed.

## Implemented

- Booking-first homepage with authentic hotel imagery, visible mobile date fields, shared session dates/occupancy, field-level recovery and the verified Maximojo parameter contract. Ordinary searches still allow one-night stays.
- Room filtering by bed and bathtub, comparison of two choices, clearer room facts, category-matched galleries and assisted Presidential Suite reservations.
- Separate weddings and meetings/corporate-events pages, distinct imagery and requirements, a venue finder using numeric layout capacities, and two-step enquiry forms. Unknown capacities are grouped for team confirmation. Legacy event URLs remain supported.
- Nine locally hosted corporate logos, preserving owner order with SBI third. Pause, previous/next, touch navigation, reduced motion and a static list are available. IRIA and Chemists & Druggists Federation are excluded; ASISC artwork could not be retrieved reliably and is omitted. See `design/corporate-logo-register.md`.
- The supplied Presidential Suite reel loads only when requested, beside photographs, with an independent Instagram link and assisted reservation actions.
- Editable two-night/three-day and three-night/four-day itineraries, all requested experiences, hotel downtime, add/replace/move/remove, retained unscheduled ideas, local saving, copy/WhatsApp sharing and explicit booking-date review. Activity selection never reserves an experience.
- Sanity schemas/read mappings, approved repository fallbacks, structured event payload validation and staff/guest message templates extended for the new features. Consent-aware interaction events are present; analytics is not configured locally.

## Verification

| Check | Result |
| --- | --- |
| Astro and Worker TypeScript | 0 errors, warnings or hints |
| Automated tests | 54 passed |
| Production-mode build | 20 pages generated |
| Production artifact verifier | 28 files checked; local test CAPTCHA override used |
| Deployment safeguard | Normal verifier rejects the local test CAPTCHA key |
| Internal links and image references | 811 references checked; no missing local targets |
| Responsive layouts | No page overflow on 10 pages at 320, 360, 390, 430, 768, 1024 and 1440px |
| Accessibility automation | No axe violations in the checked WCAG 2 A/AA, 2.1 A/AA and 2.2 AA rules on six main pages |

Browser checks used an isolated Chrome profile. They covered menu Escape/focus return, blank dates and validation, booking state across navigation, bed/bathtub filters, two-room comparison, venue/form prefilling, contact-step back navigation, mocked delivery failure/retry/success, itinerary extension and shortening, replacement, reload persistence and booking-date conflicts. No outbound enquiry was allowed: browser responses and Worker email providers were mocked.

Additional checks passed for a full carousel loop, reduced-motion pause, gallery controls/dialog focus return, the reel at 320px, a landscape menu, no-JavaScript content/static logos and unavailable local storage. All nine logos decoded successfully. Hidden sticky actions are now inert; their labels use 14px type. A suite call-button colour conflict and crowded room facts were corrected during visual review.

The compact CAPTCHA layout is selected to fit narrow form columns; Cloudflare documents it at 150 × 140px ([widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)). Third-party CAPTCHA requests were blocked in the interaction/accessibility runs, so those runs do not verify the provider's rendered widget or token issuance.

## Performance baseline

Lighthouse mobile lab runs against the local built static files, using the standard simulated mobile throttling:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | 97 | 100 | 100 | 100 | 2.3s | 0.001 | 0ms |
| Presidential Suite | 97 | 100 | 100 | 100 | 2.2s | 0.001 | 0ms |

The suite initially measured 2.8s LCP. Removing unused room-image preloads and deferring hidden full-screen gallery images reduced that to 2.2s in the follow-up run. The homepage report also identified a visible/accessibility-name mismatch in the wordmark; the label was corrected and the final axe scan passed. Lab results vary and do not establish field Core Web Vitals, INP or complete WCAG compliance. Local Python serving does not apply Cloudflare cache/compression headers.

## Evidence

`design/qa-2026-09-12/` contains the browser result JSON, accessibility findings, Lighthouse reports and mobile/desktop captures. The batch began on 12 September and finished on 13 September. Key views: `home-390.png`, `home-1440.png`, `corporate-events-1440.png`, `logos-390.png`, `comparison-390.png`, `planner-390.png`, `suite-fixed-390.png` and `menu-landscape.png`. The event-success image uses a simulated response.

## Deployment and device checks still required

- Configure the real Turnstile site key and the existing Worker email/KV secrets in the intended deployment environment. The local environment has no real CAPTCHA or lead endpoint configured. Build again with real configuration and run the normal production verifier without its local test override.
- Check on physical iOS Safari and Android Chrome, including the software keyboard, browser zoom and assistive technology. The viewport and touch emulation checks are not substitutes for those devices.
- Confirm the Instagram reel's public playback in the launch environment. Local checks establish click-to-load behavior, contained sizing and a working fallback path, not Instagram availability.
- Complete a controlled staff booking/payment test and enquiry-delivery test in the designated environment. The existing verified handoff remains; no payment was attempted here.
- Recheck performance on Cloudflare and collect real booking/enquiry conversion and stay-length outcomes after launch. No uplift is claimed from local tests.

The implementation is ready for local review. The live website is unchanged.
