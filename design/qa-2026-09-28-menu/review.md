# Scrolled navigation regression review — 28 September 2026

## Reproduction and cause

At 1440 × 844 on Dining, open Menu after scrolling to the restaurant cards. Before the fix, the menu measured only 77px high although the viewport was 844px; its navigation links were clipped below the visible panel. The scrolled header's backdrop-filter created a containing block for the fixed menu nested inside it.

## Change

- Render the menu beside the header so its fixed inset follows the viewport.
- Reveal visibility immediately when opening, allowing focus to reach Close menu before the opacity animation finishes.
- Move focus without scrolling the underlying page; reset the menu's own scroll position on opening.
- Contain overscroll within the menu on shorter screens.

## Browser checks

Using the in-app browser and real pointer/keyboard interactions, open the menu after scrolling to Dining's group-celebration section. All seven checks showed a full-viewport overlay at top 0, eight navigation links, the first link visible and hittable, Close menu focused, and exactly unchanged page scroll on opening and closing. Escape closed the menu and returned focus to Menu.

| Viewport | Page scroll before/open/after | Menu height | Menu scroll height |
| --- | --- | --- | --- |
| 320 × 568 | 5450 / 5450 / 5450 | 568 | 749 |
| 390 × 844 | 5190 / 5190 / 5190 | 844 | 844 |
| 430 × 932 | 5060 / 5060 / 5060 | 932 | 932 |
| 768 × 1024 | 3940.5 / 3940.5 / 3940.5 | 1024 | 1024 |
| 844 × 390 | 4427 / 4427 / 4427 | 390 | 485 |
| 1024 × 768 | 2541 / 2541 / 2541 | 768 | 768 |
| 1440 × 844 | 2608 / 2608 / 2608 | 844 | 844 |

At 320 × 568, Shift+Tab from Close menu wrapped to the last contact link and scrolled only the menu (181.5px). Tab wrapped back to Close menu, returning menu scroll to 0. A Gallery menu link navigated successfully. At 390 × 844, opening from the page top also worked; Check availability opened the booking dialog, and Escape closed it without leaving the menu scroll lock active.

Desktop and mobile screenshots were inspected in the conversation. Physical device/browser-engine coverage and field performance were not measured. No reservation, enquiry, call, or message was submitted.

## Repeatable regression steps

1. Open Dining at 1440 × 844 and scroll several screens down.
2. Click Menu at its on-screen position. Confirm full viewport coverage and visible links; use pointer clicks to avoid test tools automatically scrolling a sticky button into view.
3. Press Escape. Confirm focus returns to Menu and the page stays at the same position.
4. Repeat at 390 × 844 and 320 × 568; navigate through all menu items by keyboard and scroll the menu when needed.
5. Follow Gallery and verify the destination, then check Menu → Check availability → Escape.

71 existing tests, Astro/Worker type checks, the production build, 30-file artifact verification, and Cloudflare strict dry run passed.
