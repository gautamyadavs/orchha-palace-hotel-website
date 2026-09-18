# Betwa View Dining media — 15 September 2026

## Chosen presentation

Use the owner-selected riverside photograph as the main visual on Dining and Explore Orchha. It shows the actual tables, lawn and river in one view. Keep the complete 4:3 composition and introduce the feature with the same ivory, maroon and serif styling as the site.

Keep the resort reel as a secondary, explicitly labelled Instagram link that opens a new tab. No Instagram script or iframe loads on either page. This avoids adding a second video loading state, embedded social controls or a tall vertical player to the itinerary journey. The reel was identified as content from theorchharesort; its label is a resort reel, not a dedicated restaurant tour.

The Dining feature retains table enquiries, directions, the sister-property identity and a link back to stay planning. The Explore feature stays below the planner and leads to the Dining section. Original itinerary templates, first-view stay choices, save/print behaviour and booking interfaces are unchanged.

## Implementation

- Shared `src/components/BetwaDiningFeature.astro` with Dining and Explore variants.
- Four local WebP images at 480, 800, 1280 and 1600px: approximately 23, 60, 154 and 239 KB. The source photograph is 4032×3024 and approximately 2.1 MB. Responsive files retain the original composition.
- Intrinsic dimensions, a stable 4:3 frame, lazy loading and asynchronous decoding. No new client JavaScript.
- Mobile image above copy; two columns from 960px; minimum 44px action height.
- Descriptive alt text, property caption and accessible new-tab indication.
- Restaurant structured data references the same published image.
- Image provenance is in `content/media-manifest.csv`.

Sources supplied by the owner:
- https://gos3.ibcdn.com/655fb202-213a-4285-8277-59c25505735b.jpg
- https://www.instagram.com/reel/DbGAPfEIeDg/

## Verification and status

68 existing tests passed. Astro/Worker checks passed with zero errors, warnings or hints. The production build and production artifact verifier passed with the real CAPTCHA key. Generated HTML checks passed for both variants, responsive image choices, intrinsic dimensions, lazy loading, no embedded Instagram requests, correct reel destination and restaurant image metadata. See `qa-2026-09-15-betwa/static-checks.json`.

The source photograph and fresh browser screenshots were visually reviewed. Responsive checks at 320, 390, 768, 1030 and 1440px confirmed the full 4:3 photograph, no horizontal overflow and action heights of at least 44px. The Explore first view at 390×844 still shows the stay choices and first activity. The live Explore-to-Dining link was followed successfully, and keyboard focus on the Dining links remains visible above the mobile action bar. Screenshots and responsive evidence are in `qa-2026-09-15-betwa/`.

Published to the existing Cloudflare Worker on 15 September 2026. Live version: `79726066-abe6-4405-b3b3-482385ebcf47`. Previous working version for rollback: `09e7ae64-df56-4836-a013-30876bb381d9`. The strict deployment dry run passed before publication. Both custom domains and existing service bindings are retained.

Live checks passed for both pages, all four photo files (matching the local production build), the optional reel destinations, restaurant image metadata and the previously corrected event/group phone links. See `qa-2026-09-15-betwa/live-checks.json` and `../content/deployment-snapshots/betwa-dining-2026-09-15.json`.

The earlier workspace credit error was resolved on continuation. No GitHub push was performed. Instagram playback itself remains controlled by Instagram; this release provides an explicitly labelled outbound reel link and does not depend on an embedded player.
