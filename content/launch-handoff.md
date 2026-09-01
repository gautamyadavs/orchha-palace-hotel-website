# Orchha Palace launch handoff

Complete this once with hotel management before enabling a production build.

## 1. Booking engine

- Confirmed public Maximojo booking URL:
- Does it accept prefilled dates? Yes / No
- Check-in parameter name and format:
- Check-out parameter name and format:
- Adults parameter name:
- Children parameter name:
- Room-count parameter name:
- Promo-code parameter name:
- Test booking reference completed through PayU:
- Cancellation/amendment journey checked by:

If any parameter is uncertain, keep `PUBLIC_MAXIMOJO_SUPPORTS_SEARCH=false`; the site will open the engine without appending dates.

## 2. Room approval

For each category, confirm its exact primary photo, 6–10 gallery photos, name, size, bed configuration, maximum occupancy, view/aspect, bathroom, amenities and inclusions.

- Standard Room: 2 category-matched staging images; exact Standard bathroom and 4–8 additional useful views required.
- Standard Room Twin: 2 category-matched staging images; exact Standard bathroom and clean alternate angles required.
- Deluxe Room: 5 category-matched staging images, including bathtub and shower; hotel approval and 1–5 more useful views required.
- Deluxe Room Twin: 3 category-matched staging images; add at least one additional verified twin-room angle.
- Presidential Suite: 5 user-confirmed staging images cover the primary bedroom, living room, dining room, private pool and jacuzzi; add the second bedroom and wider shower/bathroom view.

Resolve the room-size discrepancy documented in `content/room-image-audit.md` before approval. Booking.com, MakeMyTrip and the legacy hotel content currently show different Standard and Deluxe sizes.

## 3. Dining approval

For Annajal, Dragon and Madira, confirm exact photos, cuisine/offer, location, seating capacity and current opening times.

- Annajal:
- Dragon:
- Madira:

## 4. Wedding and event approval

Confirm exact photos, dimensions, maximum capacities by layout and any restrictions for:

- Indramani Bagh:
- Jeja Bagh:
- Rudra Bagh:
- Samrat Hall:
- Bundela Darbar:
- Diwan-e-Khas:
- Boardroom:

Outdoor capacities should remain “confirmed after layout review” unless the events team approves a specific published number.

## 5. Media rights

Update `content/media-manifest.csv` and the corresponding Sanity media record only after all of the following are true:

- the asset is hotel-owned or has recorded publication permission;
- the exact room/restaurant/venue mapping is confirmed;
- no identifiable guest, child, wedding attendee or VIP appears without written consent;
- alt text accurately describes the image;
- `rightsStatus` is `hotel-owned` or `approved`; and
- `publishApproved` is `true`.

## 6. Public details and policies

- Reservations phone and email:
- Wedding/events phone and email:
- WhatsApp number:
- Postal address and Maps link:
- Check-in/check-out times:
- Occupancy and child policy:
- Cancellation/refund policy owner:
- Privacy contact:

## 7. Integration and launch sign-off

- All credentials visible in the supplied image have been rotated.
- Sanity production dataset is complete.
- Turnstile production keys are configured.
- Resend sender domain is verified and delivery is tested.
- GTM container is approved and analytics consent is tested.
- Staging remains `noindex` during staff/guest review.
- Production build succeeds with `PUBLIC_SITE_STATUS=production`.
- Hotel management has signed off the final content and imagery.
