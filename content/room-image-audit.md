# Room image audit

Audit date: 1 September 2026

This audit cross-checks the room-category galleries currently visible on [Booking.com](https://www.booking.com/hotel/in/orchha-palace-and-convention-centre.html), the room listing on [MakeMyTrip](https://www.makemytrip.com/hotels/rooms-in-orchha_palace_and_convention_centre-details-orchha.html), the hotel's [Presidential Suite page](https://orchhapalace.com/room/presidential-suite/), and the references supplied by hotel management. Third-party pages are evidence for category mapping, not proof of image rights. Every launch asset remains `rightsStatus: verify` and `publishApproved: false`.

## Mapping outcome

| Website category | Current staging gallery | Mapping evidence | Remaining launch requirement |
| --- | ---: | --- | --- |
| Standard Room | 2 images | Images shown inside Booking.com's Standard Double or Twin Room gallery | Add a verified Standard bathroom image and additional useful angles |
| Standard Room Twin | 2 images | Images shown inside the same Standard category gallery, including a true twin-bed view | Add a verified bathroom image and a clean second room angle |
| Deluxe Room | 5 images | Images shown inside Booking.com's Deluxe Double or Twin Room gallery, including bathtub and shower views | Hotel approval and one or more additional useful angles |
| Deluxe Room Twin | 3 images | True twin-bed view plus bathroom images from the same combined Deluxe category gallery | Add a second verified twin-room angle |
| Presidential Suite | 5 images | User-confirmed bedroom plus connected suite images for the private living room, dining room, pool and jacuzzi | Add a photograph of the second bedroom and a wider shower/bathroom view |

The resulting website interaction provides previous/next controls, swipe navigation, a thumbnail rail, a current-photo count, descriptive captions, keyboard arrow navigation, and a full-screen dialog on every room detail page.

## Maximojo catalogue status

The live Maximojo engine was checked without creating a reservation. It currently exposes only two sellable categories—Standard and Deluxe—rather than the five categories presented by the website. Its Deluxe carousel also contains an unrelated food photograph.

Before adding any `maximojoRoomCode` to website content, hotel operations must:

1. Confirm the PMS and channel-manager mapping for Standard, Standard Twin, Deluxe, Deluxe Twin and Presidential Suite.
2. Confirm inventory, occupancy and at least one active rate plan for every category.
3. Upload the approved, category-specific gallery set described above and remove unrelated images.
4. Run a dated search in Maximojo and verify all five cards, names, rates and galleries.
5. Record and test the corresponding `roomcode` for each website room slug.

Until those checks pass, room CTAs preserve the guest's room preference in the website interface but open the general Maximojo results rather than sending an invented room code.

## Standard versus Deluxe

The earlier preview incorrectly made the categories appear interchangeable. The current mapping is separated:

- Standard uses only photographs shown inside the Standard Double or Twin Room gallery.
- Deluxe uses only photographs shown inside the Deluxe Double or Twin Room gallery.
- Deluxe includes its verified bathtub and glass-shower photography.
- Standard does not reuse the Deluxe bathroom. No Standard bathroom photograph was found inside the current category gallery, so that gap is stated rather than hidden.
- A Standard photograph showing a staff member making the bed and a Deluxe photograph showing a guest were excluded.

## Presidential Suite

The previous primary photograph was wrong. It has been replaced with the bedroom reference supplied by the hotel. The staging gallery now shows:

1. Primary bedroom.
2. Private sofa living room.
3. Separate dining room.
4. Private courtyard swimming pool.
5. Master-bath jacuzzi.

The page copy also identifies the suite as a two-bedroom residence with two attached bathrooms, separate living and dining spaces, pantry, private pool and butler service. The second bedroom is not represented visually yet and remains an explicit photography requirement.

## Room-size discrepancy — management decision required

The room-size figures conflict across public sources:

| Source | Standard | Deluxe |
| --- | ---: | ---: |
| Booking.com category modal | 46 m² | 51 m² |
| MakeMyTrip room listing | 21 m² / 225 sq. ft. | 37 m² / 400 sq. ft. |
| Legacy hotel content used by the staging fallback | 400 sq. ft. | 500 sq. ft. |

No size was silently changed during this image correction. Hotel management must confirm the measured, saleable floor area and decide whether bathrooms, balconies or outdoor-shower areas are included before production publication.

## Approval rule

Third-party images must be replaced with hotel-owned originals from the source library where possible. Before production, record the matching original, exact category, rights owner, focal point, alt text and written publication approval in `content/media-manifest.csv` and Sanity.
