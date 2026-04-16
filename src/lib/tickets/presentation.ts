import QRCode from "qrcode";

import type { BookingRecord, BookingWithTickets } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { buildAbsoluteUrl, buildTicketDownloadPath, buildTicketPagePath, formatRupees } from "@/lib/utils";

export type TicketPresentation = {
  brand: string;
  eventName: string;
  dateLabel: string;
  timeLabel: string;
  venueName: string;
  attendeeName: string;
  phone: string;
  quantity: number;
  bookingId: string;
  amountLabel: string;
  instructions: string;
  pageUrl: string;
  downloadUrl: string;
  qrCodeDataUrl: string;
};

export async function buildTicketPresentation(booking: BookingRecord | BookingWithTickets): Promise<TicketPresentation> {
  if (!booking.bookingId || !booking.ticketToken) {
    throw new Error("Booking is missing a booking ID or ticket token.");
  }

  const pageUrl = buildAbsoluteUrl(buildTicketPagePath(booking.bookingId, booking.ticketToken));
  const downloadUrl = buildAbsoluteUrl(buildTicketDownloadPath(booking.bookingId, booking.ticketToken));
  const qrCodeDataUrl = await QRCode.toDataURL(pageUrl, {
    margin: 1,
    width: 360,
    color: {
      dark: "#F5F5F5",
      light: "#00000000",
    },
  });

  return {
    brand: EVENT.brand,
    eventName: EVENT.name,
    dateLabel: EVENT.dateLabel,
    timeLabel: EVENT.timeLabel,
    venueName: EVENT.venueName,
    attendeeName: "tickets" in booking ? booking.tickets[0]?.attendeeName ?? booking.fullName : booking.fullName,
    phone: booking.phone,
    quantity: booking.quantity,
    bookingId: booking.bookingId,
    amountLabel: formatRupees(EVENT.price * booking.quantity),
    instructions: "Show this ticket at entry",
    pageUrl,
    downloadUrl,
    qrCodeDataUrl,
  };
}
