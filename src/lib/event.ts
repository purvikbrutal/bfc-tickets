import { BUSINESS, EVENT_CONTENT } from "@/config/business";

export const EVENT = {
  name: EVENT_CONTENT.name,
  brand: BUSINESS.name,
  shortBrand: BUSINESS.shortName,
  organizer: BUSINESS.organizer,
  collaboration: BUSINESS.collaboration,
  presentedBy: BUSINESS.presentedBy,
  heroHeadline: EVENT_CONTENT.heroHeadline,
  heroSubheadline: EVENT_CONTENT.heroSubheadline,
  startsAtIso: EVENT_CONTENT.startsAtIso,
  dateLabel: EVENT_CONTENT.dateLabel,
  timeLabel: EVENT_CONTENT.timeLabel,
  price: EVENT_CONTENT.price,
  priceLabel: EVENT_CONTENT.priceLabel,
  discountLabel: EVENT_CONTENT.discountLabel,
  dealLabel: EVENT_CONTENT.dealLabel,
  category: EVENT_CONTENT.category,
  entry: EVENT_CONTENT.entry,
  seats: EVENT_CONTENT.seats,
  venueName: EVENT_CONTENT.venueName,
  venueAddress: EVENT_CONTENT.venueAddress,
  venueEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "",
  venueDirectionsUrl: process.env.NEXT_PUBLIC_VENUE_DIRECTIONS_URL ?? "",
  galleryQuote: EVENT_CONTENT.galleryQuote,
  galleryImages: EVENT_CONTENT.galleryImages,
  venuePlaceholderNote: EVENT_CONTENT.venuePlaceholderNote,
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
    answer: "Yes, when WhatsApp delivery is enabled for the event you will receive a confirmation with your ticket link.",
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
