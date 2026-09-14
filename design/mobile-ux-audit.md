# Orchha Palace: current UX audit

Reviewed 11 September 2026 using the live [website](https://orchhapalace.com/), in-app browser screenshots, rendered DOM measurements and local source. Screenshots below were captured and inspected during this review. The existing historical QA report is not current audit evidence.

## Findings by journey step

| Step | Observed state | Health | Priority change |
| --- | --- | --- | --- |
| 1. Enter the homepage | Attractive imagery and a visible booking CTA, but no date entry in the first mobile screen. Approximately 10,878px page height at 390px; room heading around 2,139px. | Needs redesign | Compact hero, early booking controls and room chooser; remove repeated promotional sections. |
| 2. Choose a room | Accurate-looking category imagery and size/bed facts, but five long articles require remembering differences. No interactive comparison. | Needs decision support | Filterable category/bed choices and comparison of two rooms. |
| 3. Enter booking details | Native dialog, labels and a visible rate action work. Dates default to two weeks away without user selection. Room preference appears even when no category code is transmitted. | Functional with misleading cues | Explicit dates, shared state and truthful handoff labels. |
| 4. Reach live rates | Maximojo received 25–27 September 2026, two adults, zero children. Standard and Deluxe results loaded. No reservation was created. | Handoff works; category limitation | Retain provider; verify codes before promising a specific bed/category. |
| 5. Plan an event | Wedding-led content also serves corporate visitors. At 360px, document width is 368px and the lead form is 348px inside a 320px content area. | Confirmed responsive defect | Separate journeys, correctly shrinking grid/form children and mobile venue cards. |

The venue table is 720px wide inside a 350px container at 390px, and a 320px container at 360px. It scrolls internally; that is distinct from the confirmed whole-page overflow near the lead layout. Venue comparison starts around 2,500px down the 390px page and the enquiry heading around 9,100px; a top anchor exists, so guests are not forced to manually scroll the entire distance.

During the initial first-visit check, the privacy prompt overlapped the hero actions. The saved homepage screenshot below follows refusal of optional analytics and therefore shows the unobstructed state. Source inspection confirms a fixed privacy surface above the bottom action area; retest first-visit overlap in the release matrix.

The desktop rooms page was visually checked at 1280px. Its large hero occupies most of the initial viewport before room choices. Existing navigation, room-gallery controls, direct contact links and the suite's assisted-booking distinction are useful foundations to retain.

Source inspection also found public copy about image approval and internal publishing checks, an empty Offers destination, and separate booking forms without shared cross-page state. These are source/content findings, not results from a complete usability study.

## Screenshot evidence

### 1. Homepage — 390 × 844

![Mobile homepage](</Users/gautamyadav/Documents/ChatGPT/Orchha Palace Hotel & Convention Centre/design/audit-2026-09-11/01-home-mobile.jpg>)

The hero communicates atmosphere. The date controls remain behind another action, and the image portrays the destination rather than the property itself.

### 2. Room choice — 390 × 844

![Mobile room choice](</Users/gautamyadav/Documents/ChatGPT/Orchha Palace Hotel & Convention Centre/design/audit-2026-09-11/02-room-choice-mobile.jpg>)

One room consumes nearly the entire visible content area. Primary facts are readable, but cross-category comparison depends on scrolling and memory.

### 3. Booking panel — 390 × 844

![Mobile booking panel](</Users/gautamyadav/Documents/ChatGPT/Orchha Palace Hotel & Convention Centre/design/audit-2026-09-11/03-booking-mobile.jpg>)

The form is usable; lengthy introductory copy and preference information push the action lower. Small labels and input rendering deserve real-device review. “Preferred stay” does not establish confirmed availability.

### 4. External availability results — 390 × 844

![Live booking engine results](</Users/gautamyadav/Documents/ChatGPT/Orchha Palace Hotel & Convention Centre/design/audit-2026-09-11/04-live-rates-mobile.jpg>)

The search reached the official engine with dates preserved. This screen is controlled by the provider; website redesign alone cannot change its visual design or inventory. Displayed rates are a dated audit observation, not proposed website pricing.

### 5. Event enquiry — 360 × 740

![Mobile event enquiry with overflow](</Users/gautamyadav/Documents/ChatGPT/Orchha Palace Hotel & Convention Centre/design/audit-2026-09-11/05-event-enquiry-mobile.jpg>)

The right edge exceeds the intended content width. The enquiry begins below a large introduction/contact block. Corporate and wedding requirements use the same generic form.

## Evidence limits

This is a focused design and interaction audit. It does not establish WCAG compliance, physical-device behavior, fresh Lighthouse scores, field performance, actual conversion rates, event-email delivery or successful payment. No enquiry was sent and no booking was created. Browser menus and dialogs were inspected, but full keyboard and screen-reader testing remains an implementation acceptance requirement.

Instagram's public profile and one corporate highlight were reviewed. A wedding-story identity prompt was not accepted; detailed wedding-history coverage is incomplete. Use public themes and approved hotel assets, and do not carry social claims or historical client logos into new website claims without checking them.
