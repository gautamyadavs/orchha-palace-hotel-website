# Orchha Palace launch handoff

Repository content, imagery, rights and mappings were approved for production by the owner on 4 September 2026. Complete the remaining external-integration checks before domain cutover.

## 1. Booking engine

- Confirmed public Maximojo booking URL: `https://bookingengine.maximojo.com/?hid=India54468d49-cd5b-4af2-a615-303eda366eea`
- Prefilled dates verified: Yes, ISO `YYYY-MM-DD`
- Check-in parameter: `checkin`
- Check-out parameter: `checkout`
- Adults parameter: `nAdults`
- Children parameter: `nChildrens`
- Room-count parameter: unsupported in the current engine; add rooms after handoff
- Promo-code parameter: `promocode`
- Optional room parameter: `roomcode`, only after each catalogue mapping is verified
- Test booking reference completed through PayU:
- Cancellation/amendment journey checked by:

The website-to-Maximojo handoff has been verified without creating a reservation. Payment success remains unverified until staff completes a controlled booking.

## 2. Room approval

The current primary photos, galleries, names, sizes, bed configurations, occupancy guidance, bathrooms, amenities and inclusions are approved for production.

Maximojo room-specific codes may be published only after the four online categories are verified: Standard, Standard Twin, Deluxe and Deluxe Twin. Confirm the PMS/channel mapping and rate plans before changing production inventory. The Presidential Suite is assisted-reservation-only and must not be added to the website's online booking handoff.

- Standard Room: approved.
- Standard Room Twin: approved.
- Deluxe Room: approved.
- Deluxe Room Twin: approved.
- Presidential Suite: approved as assisted-reservation-only.
- Presidential Suite direct call and suite-specific WhatsApp journey checked on listing, detail, header and mobile sticky actions: automated assertions pass; complete final live-device check before cutover.

The owner approved the room descriptions currently recorded in the repository. Future inventory changes should still be reconciled against the PMS and booking engine.

## 3. Dining approval

The current photos, cuisine descriptions, locations and capacity copy are approved. Opening times remain intentionally directed to the hotel for confirmation.

- Annajal: approved.
- Dragon: approved.
- Madira: approved.

## 4. Wedding and event approval

The current photos, dimensions and capacity language are approved for:

- Indramani Bagh.
- Jeja Bagh.
- Rudra Bagh.
- Samrat Hall.
- Bundela Darbar.
- Diwan-e-Khas.
- Boardroom.

Outdoor capacities should remain “confirmed after layout review” unless the events team approves a specific published number.

## 5. Media rights

All current manifest entries meet the owner's production approval. For new media, update `content/media-manifest.csv` and any corresponding Sanity record only after all of the following are true:

- the asset is hotel-owned or has recorded publication permission;
- the exact room/restaurant/venue mapping is confirmed;
- no identifiable guest, child, wedding attendee or VIP appears without written consent;
- alt text accurately describes the image;
- `rightsStatus` is `hotel-owned` or `approved`; and
- `publishApproved` is `true`.

## 6. Public details and policies

- Reservations phone and email: `+91 95160 06201`, `reservations@orchhapalace.com`.
- Wedding/events phone and email: `+91 95160 06201`, `sales@orchhapalace.com`.
- WhatsApp number: `+91 95160 06201` with intent-specific messages.
- Postal address and Maps link: centralized in `src/lib/contact.ts` and approved.
- Check-in/check-out times: 2:00 PM / 10:00 AM.
- Occupancy and child policy:
- Cancellation/refund policy owner:
- Privacy contact:

## 7. Integration and launch sign-off

- All credentials visible in the supplied image have been rotated.
- Approved repository content is validated in the production build; Sanity remains optional.
- Turnstile production keys are configured.
- Turnstile site key permits `gautamyadavs.github.io`, `orchhapalace.com` and `www.orchhapalace.com`.
- `LEAD_RATE_LIMIT` Workers KV binding is configured and a sixth same-hour test is rejected.
- Worker `LEAD_ALLOWED_ORIGINS` contains only the three approved exact origins.
- Worker sends the critical staff notification only to `sales@orchhapalace.com`; guest confirmation failure is non-blocking.
- GitHub repository variables `PUBLIC_LEAD_API_URL` and `PUBLIC_TURNSTILE_SITE_KEY` are configured.
- A controlled enquiry from GitHub Pages and each production hostname reaches sales with every submitted field.
- Resend sender domain is verified and delivery is tested.
- GTM remains disabled until a production container is supplied; consent behavior is covered independently.
- Staging remains `noindex` during staff/guest review.
- Production build succeeds with `PUBLIC_SITE_STATUS=production`.
- Hotel management has signed off the final content and imagery: 4 September 2026.
