const primaryPhoneDigits = "919516006201";
export const whatsappUrl = (message: string) => `https://wa.me/${primaryPhoneDigits}?text=${encodeURIComponent(message)}`;

export const contact = {
  primaryPhone: "+91 95160 06201",
  primaryPhoneHref: `tel:+${primaryPhoneDigits}`,
  primaryPhoneSchema: "+91-95160-06201",
  salesPhone: "+91 95160 06204",
  salesPhoneHref: "tel:+919516006204",
  phones: ["+91 95160 06201", "+91 95160 06203", "+91 95160 06204"],
  reservationsEmail: "reservations@orchhapalace.com",
  salesEmail: "sales@orchhapalace.com",
  address: "Sawant Nagar, Near Ramraja Temple, Distt. Niwari, Orchha, Madhya Pradesh 472246",
  whatsapp: {
    stay: whatsappUrl("Hello Orchha Palace, I'd like help planning a stay."),
    roomBooking: whatsappUrl("Hello Orchha Palace, I'd like help with a room booking."),
    groupStay: whatsappUrl("Hello Orchha Palace, I'd like help with a multi-room booking."),
    event: whatsappUrl("Hello Orchha Palace, I'd like to plan an event."),
    dining: whatsappUrl("Hello Orchha Palace, I'd like to ask about dining and the current menus."),
    privateDining: whatsappUrl("Hello Orchha Palace, I'd like to arrange private dining. Please help me with the setting, menu, dates and availability."),
    spa: whatsappUrl("Hello Orchha Palace, I'd like to arrange a spa appointment. Please help me choose a treatment and confirm availability and the total price."),
    presidentialSuite: whatsappUrl("Hello Orchha Palace, I'd like to reserve the Presidential Suite.")
  },
  maps: "https://maps.app.goo.gl/NPxqpeqWNFf4j6c36"
} as const;
