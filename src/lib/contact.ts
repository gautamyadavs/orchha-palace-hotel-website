const primaryPhoneDigits = "919516006201";
const whatsappUrl = (message: string) => `https://wa.me/${primaryPhoneDigits}?text=${encodeURIComponent(message)}`;

export const contact = {
  primaryPhone: "+91 95160 06201",
  primaryPhoneHref: `tel:+${primaryPhoneDigits}`,
  primaryPhoneSchema: "+91-95160-06201",
  phones: ["+91 95160 06201", "+91 95160 06203", "+91 95160 06204"],
  reservationsEmail: "reservations@orchhapalace.com",
  salesEmail: "sales@orchhapalace.com",
  address: "Sawant Nagar, Near Ramraja Temple, Distt. Niwari, Orchha, Madhya Pradesh 472246",
  whatsapp: {
    stay: whatsappUrl("Hello Orchha Palace, I'd like help planning a stay."),
    roomBooking: whatsappUrl("Hello Orchha Palace, I'd like help with a room booking."),
    groupStay: whatsappUrl("Hello Orchha Palace, I'd like help with a multi-room booking."),
    event: whatsappUrl("Hello Orchha Palace, I'd like to plan an event."),
    presidentialSuite: whatsappUrl("Hello Orchha Palace, I'd like to reserve the Presidential Suite.")
  },
  maps: "https://maps.app.goo.gl/NPxqpeqWNFf4j6c36"
} as const;
