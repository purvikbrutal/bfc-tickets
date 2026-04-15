export const EVENT = {
  name: "Fight Night",
  brand: "Brutal Fight Club",
  shortBrand: "BFC",
  organizer: "Brutal Fight Club",
  collaboration: "GGK",
  presentedBy: "Purvik Brutal",
  heroHeadline: "Brutal Fight Club presents Fight Night",
  heroSubheadline: "in collaboration with GGK, brought to you by Purvik Brutal",
  startsAtIso: "2026-04-26T17:00:00+05:30",
  dateLabel: "April 26, 2026",
  timeLabel: "5:00 PM",
  price: 199,
  priceLabel: "Rs 199",
  discountLabel: "Rs 899 OFF",
  dealLabel: "Limited Time Deal",
  category: "Boxing Matches",
  entry: "Ticketed Event",
  seats: "Limited Entry",
  venueName: "Sri Sai Shivani Complex",
  venueAddress: "23-107/4 NH65, Saroornagar, Sri Sai Shivani Complex, Kamala Nagar, Hyderabad, Telangana 500035",
  venueEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "",
  venueDirectionsUrl: process.env.NEXT_PUBLIC_VENUE_DIRECTIONS_URL ?? "",
  galleryQuote: "The pressure, the posture, the moments before the bell.",
  galleryImages: [
    "/gallery/gallery-01.JPG",
    "/gallery/gallery-02.JPG",
    "/gallery/gallery-03.JPG",
    "/gallery/gallery-04.PNG",
    "/gallery/gallery-05.JPG",
  ],
  venuePlaceholderNote: "Replace this with the confirmed venue and live map embed.",
} as const;

export const NAV_LINKS = [
  { href: "#event", label: "Event" },
  { href: "#gallery", label: "Gallery" },
  { href: "#booking", label: "Tickets" },
  { href: "#venue", label: "Venue" },
  { href: "#faq", label: "FAQ" },
] as const;

export const EVENT_DETAILS = [
  { label: "Date", value: EVENT.dateLabel },
  { label: "Time", value: EVENT.timeLabel },
  { label: "Format", value: EVENT.category },
  { label: "Access", value: EVENT.seats },
  { label: "Entry", value: EVENT.entry },
] as const;

export const FAQS = [
  {
    question: "How do I receive my ticket?",
    answer: "Right after payment verification by email with your ticket link.",
  },
  {
    question: "Will I get email confirmation?",
    answer: "Yes. Your ticket and booking details are sent instantly.",
  },
  {
    question: "Will I get WhatsApp confirmation?",
    answer: "A WhatsApp confirmation flow placeholder is ready to connect.",
  },
  {
    question: "Can I show the digital ticket at entry?",
    answer: "Yes. The QR ticket can be shown directly at entry.",
  },
  {
    question: "Are tickets refundable?",
    answer: "Tickets are marked non-refundable by default.",
  },
] as const;
