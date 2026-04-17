export const BUSINESS = {
  name: "Brutal Fight Club",
  shortName: "BFC",
  organizer: "Brutal Fight Club",
  collaboration: "GGK",
  presentedBy: "Purvik Brutal",
  contactEmail: "brutalfightclub@gmail.com",
  contactPhone: "+91 7680895508",
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/purvik_brutal", external: true },
    { label: "YouTube", href: "https://www.youtube.com/@Purvik_Brutal", external: true },
    { label: "Terms", href: "/terms", external: false },
    { label: "Privacy", href: "/privacy", external: false },
  ],
} as const;

export const EVENT_CONTENT = {
  name: "Fight Night",
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
  venueAddress:
    "23-107/4 NH65, Saroornagar, Sri Sai Shivani Complex, Kamala Nagar, Hyderabad, Telangana 500035",
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

export const SITE_METADATA = {
  title: `${BUSINESS.name} | ${EVENT_CONTENT.name}`,
  description: "One night. No mercy.",
  openGraphImageAlt: `${BUSINESS.name} ${EVENT_CONTENT.name}`,
} as const;
