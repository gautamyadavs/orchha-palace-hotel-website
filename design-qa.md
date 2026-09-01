# Design QA — Quiet Royal Heritage

Reference: `design/quiet-royal-heritage-source.png`

Implementation captures:

- `design/qa-mobile-390.png`
- `design/qa-desktop.png`
- `design/qa-event-form.png`
- `design/qa-presidential-suite.png`
- `design/qa-room-gallery-mobile.png`
- `design/qa-room-gallery-desktop.png`
- `design/qa-wedding-mobile.png`
- `design/qa-wedding-tablet-fixed.png`
- `design/qa-home-royal-ambience.png`
- `design/qa-home-private-dining.png`

## Visual comparison

- Direction: retained the reference's sandstone/ivory/maroon palette, editorial serif display type, restrained sans-serif utility type, full-bleed authentic Orchha imagery and pale booking surface crossing the hero boundary.
- Mobile hierarchy: property mark and contact/menu controls remain in the first viewport; the destination label, main promise and persistent availability action are legible at 360, 390 and 430 pixels.
- Booking divergence: the reference's date fields are intentionally replaced by call and WhatsApp reservation actions until the confirmed Maximojo URL and parameter contract are supplied. The final component automatically restores the date search when `PUBLIC_MAXIMOJO_SUPPORTS_SEARCH=true` is verified.
- Content expansion: the same visual system continues through room comparisons, room details, dining, amenities, venue cards, destination content, forms and policies without changing tone.

## Responsive and interaction checks

- 360 px: no horizontal overflow; header controls, hero copy and sticky booking action remain visible and operable.
- 390 px: no horizontal overflow; booking surface enters the first viewport; navigation drawer is opaque, Escape-closeable and keyboard-focus-contained.
- 430 px: no horizontal overflow; increased spacing preserves the same hierarchy.
- 1440 px: full navigation is visible, the mobile sticky bar is removed and the booking surface spans the hero cleanly.
- Room comparison renders all five categories; room detail pages include five decision facts, amenities, inclusions and booking handoff.
- Room galleries are category-specific and provide thumbnail selection, previous/next controls, a visible count, captions, swipe navigation, keyboard arrows and a native full-screen dialog.
- Standard starts with 2 verified category views and never borrows Deluxe bathroom photography. Deluxe shows 5 category-matched views, including bathtub and glass-shower angles. The exact Standard bathroom remains a documented launch gap.
- Presidential Suite shows 5 user-confirmed views: bedroom, sofa living room, dining room, private pool and jacuzzi. The page correctly identifies two bedrooms and two attached bathrooms; a second-bedroom photograph remains a documented launch gap.
- The hotel-selected wedding photograph is now the weddings hero, followed by the seven-space comparison and supporting indoor/outdoor event imagery.
- Responsive picture sources deliver dedicated mobile crops for the Presidential Suite and wedding heroes.
- Event form required-field validation focuses the first error, and failed delivery exposes call/WhatsApp fallback without claiming success.
- Wedding hero at the reported 923 × 762 viewport: the revised two-line heading is 69.2 px, occupies 135.7 px vertically and remains fully separated from the 92 px header. The photograph and supporting copy remain visible without horizontal overflow.
- The home heritage editorial now uses the user-selected warm royal ambience photograph in its native wide ratio rather than forcing a portrait crop.
- The events card now uses the user-selected private garden dining photograph and renders at a consistent 4:3 ratio instead of inheriting the source image's portrait height.

## Automated evidence

- Astro production-shaped staging build: 18 routes generated successfully.
- Unit tests: 8 passed for booking URL and event-lead validation.
- Type checks: Astro/TypeScript and Cloudflare Worker entry points passed with 0 errors, warnings or hints.
- Lighthouse mobile: Performance 97, Accessibility 100, Best Practices 100; LCP 2.4 s, CLS 0.001, total blocking time 0 ms. SEO remains intentionally reduced on staging because every page is `noindex` until launch approval.
- Presidential Suite mobile Lighthouse after the gallery and responsive-image update: Performance 96, Accessibility 100, Best Practices 100; raw LCP 2.554 s (2.6 s displayed), CLS 0.001 and total blocking time 0 ms. This is 0.054 s above the 2.5 s target in local throttling and should be rechecked on Cloudflare staging; the representative homepage remains within target.
- Production safety gate: a production build without Sanity and approved rights-cleared media fails intentionally.

## Launch holds

- Confirm the public Maximojo URL and supported date/occupancy parameters.
- Approve rights and exact room/restaurant/venue mappings in the media manifest and Sanity.
- Supply the exact Standard bathroom, Presidential second bedroom and remaining 6–10-image launch set for each room type.
- Confirm the conflicting Standard and Deluxe room sizes documented in `content/room-image-audit.md`.
- Rotate all credentials exposed in the supplied image before any external integration.

final result: passed
