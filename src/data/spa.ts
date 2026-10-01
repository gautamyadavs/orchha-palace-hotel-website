// Treatment names, durations and INR prices approved by the owner on 20 September 2026.
// Source: supplied Framer /ayurveda-spa page. Facilities and medical claims are not inferred.
export const spaMenuReviewedAt = "2026-09-20";
export const spaTreatments = [
  { id: "abhyangam", name: "Abhyangam", minutes: 50, price: 2200, description: "A full-body Ayurvedic massage with warm herbal oil." },
  { id: "shirodhara", name: "Shirodhara", minutes: 60, price: 3080, description: "A traditional ritual with a gentle, continuous stream of warm herbal oil over the forehead." },
  { id: "marma-massage", name: "Marma Massage", minutes: 60, price: 2750, description: "An Ayurvedic massage focused on the body's traditional marma points." },
  { id: "nasyam", name: "Nasyam", minutes: 25, price: 880, description: "A traditional Ayurvedic treatment using herbal oil applied through the nasal passage. Discuss suitability with the spa team." },
  { id: "herbal-facial", name: "Herbal Facial", minutes: 35, price: 1650, description: "A facial using herbal skincare preparations, with products discussed before your appointment." },
  { id: "synchronized-massage", name: "Synchronized Massage", minutes: 50, price: 3300, description: "A four-hand massage performed by two therapists using coordinated movements." },
  { id: "ayur-herbal-wrap", name: "Ayur Herbal Wrap", minutes: 50, price: 3520, description: "An Ayurvedic body wrap using herbal preparations." },
  { id: "reflexology", name: "Reflexology", minutes: 25, price: 1320, description: "A treatment using focused pressure on points of the feet and hands." },
  { id: "deep-tissue-massage", name: "Deep Tissue Massage", minutes: 30, price: 1760, description: "A focused massage using deeper pressure. Discuss your preferred pressure and areas of attention with the therapist." },
  { id: "body-exfoliation-massage", name: "Body Exfoliation Massage", minutes: 45, price: 2860, description: "A body treatment combining massage with gentle exfoliation." },
  { id: "head-scalp-massage", name: "Head & Scalp Massage", minutes: 30, price: 1100, description: "A massage for the head, neck and shoulders." }
] as const;

export const formatSpaPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
