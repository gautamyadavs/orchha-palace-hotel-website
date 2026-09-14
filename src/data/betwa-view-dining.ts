/** Current name and sister-property relationship confirmed by the hotel owner.
 * Address and telephone: https://orchharesort.com/dining.html (13 September 2026).
 * Do not inherit Orchha Palace's address, contact or opening hours for this venue.
 */
export const betwaViewDining = {
  name: "Betwa View Dining",
  property: "Orchha Resort, by the river",
  path: "/dining/#betwa-view-dining",
  propertyUrl: "https://orchharesort.com/",
  phone: "+91 99935 42070",
  telephone: "+919993542070",
  address: "Kanchan Ghat, Orchha, Madhya Pradesh 472246",
  maps: "https://www.google.com/maps/search/?api=1&query=Betwa+View+Dining+Orchha+Resort+Kanchan+Ghat+Orchha"
};

export const betwaViewDiningSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `https://orchhapalace.com${betwaViewDining.path}`,
  name: betwaViewDining.name,
  url: `https://orchhapalace.com${betwaViewDining.path}`,
  description: "Riverside dining at Orchha Resort, by the river, in Kanchan Ghat, Orchha. A relaxed evening meal after visiting the Royal Chhatris and watching sunset on the Betwa.",
  telephone: betwaViewDining.telephone,
  address: { "@type": "PostalAddress", streetAddress: "Kanchan Ghat", addressLocality: "Orchha", addressRegion: "Madhya Pradesh", postalCode: "472246", addressCountry: "IN" },
  containedInPlace: { "@type": "Hotel", name: betwaViewDining.property, url: betwaViewDining.propertyUrl }
};
