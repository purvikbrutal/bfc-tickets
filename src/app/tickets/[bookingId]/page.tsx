import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { TicketDownloadButton } from "./ticket-download-button";
import { getBookingByBookingId } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { buildTicketDownloadPath, buildTicketPagePath, formatRupees } from "@/lib/utils";

type TicketPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ download?: string; token?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const { bookingId } = await params;
  const { download, token } = await searchParams;

  if (!token) {
    notFound();
  }

  const booking = await getBookingByBookingId(bookingId);

  if (!booking || booking.ticketToken !== token) {
    notFound();
  }

  if (!booking.bookingId) {
    notFound();
  }

  const confirmedBookingId = booking.bookingId;

  const ticketCards = await Promise.all(
    booking.tickets.map(async (ticket, index) => ({
      ticketId: ticket.ticketId,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName ?? booking.fullName,
      downloadUrl: buildTicketDownloadPath(confirmedBookingId, token, index),
      downloadFileName: `bfc-ticket-${confirmedBookingId}-${ticket.ticketCode}.pdf`,
      qrCodeDataUrl: await QRCode.toDataURL(ticket.ticketCode, {
        margin: 1,
        width: 360,
        color: {
          dark: "#F5F5F5",
          light: "#00000000",
        },
      }),
      ticketLabel: `Ticket ${index + 1}`,
    })),
  );

  if (ticketCards.length === 0) {
    notFound();
  }

  const ticketPageUrl = buildTicketPagePath(confirmedBookingId, token);
  const firstTicket = ticketCards[0];
  const totalLabel = formatRupees(booking.amountPaise / 100);
  const perTicketLabel = formatRupees(booking.amountPaise / booking.quantity / 100);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(180,31,50,0.16),_transparent_28%),linear-gradient(180deg,_#09090b,_#050507)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel noise-overlay rounded-[36px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <section className="glass-panel rounded-[30px] p-6 sm:p-8">
              <span className="eyebrow">{EVENT.brand}</span>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
                {EVENT.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
                Your booking is confirmed. Each seat below now has its own unique ticket code for entry.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Date</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{EVENT.dateLabel}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Time</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{EVENT.timeLabel}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Booked By</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{booking.fullName}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Phone</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{booking.phone}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Tickets</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{ticketCards.length}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Booking ID</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{booking.bookingId}</p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="glass-panel rounded-[30px] p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">Venue</p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[0em]">{EVENT.venueName}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/42">Total Paid</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.01em]">{totalLabel}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/42">Per Ticket</p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em]">{perTicketLabel}</p>

                <div className="mt-6 flex flex-col gap-3">
                  <TicketDownloadButton
                    autoDownload={download === "1"}
                    downloadUrl={firstTicket.downloadUrl}
                    fileName={firstTicket.downloadFileName}
                    label={ticketCards.length > 1 ? "Download Ticket 1 PDF" : "Download PDF Ticket"}
                  />
                  <p className="text-xs leading-6 text-white/46">{ticketPageUrl}</p>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {ticketCards.map((ticket, index) => (
              <article key={ticket.ticketId} className="glass-panel rounded-[30px] p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">{ticket.ticketLabel}</p>
                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.01em] text-white">
                      Seat {index + 1} of {ticketCards.length}
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/64">
                    {ticket.ticketCode}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
                  <div className="rounded-[26px] border border-white/10 bg-white/4 p-5 text-center">
                    <Image
                      src={ticket.qrCodeDataUrl}
                      alt={`QR code for ${ticket.ticketLabel}`}
                      width={240}
                      height={240}
                      unoptimized
                      className="mx-auto w-full max-w-[240px]"
                    />
                    <p className="mt-4 text-sm leading-6 text-white/62">Show this seat-level QR code at entry.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">Attendee</p>
                      <p className="mt-3 font-display text-2xl font-semibold tracking-[0em] text-white">
                        {ticket.attendeeName}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">Ticket Code</p>
                      <p className="mt-3 font-display text-xl font-semibold tracking-[0em] text-white">
                        {ticket.ticketCode}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">Date & Time</p>
                      <p className="mt-3 font-display text-2xl font-semibold tracking-[0em] text-white">
                        {EVENT.dateLabel}
                      </p>
                      <p className="mt-1 text-sm text-white/58">{EVENT.timeLabel}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/4 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">Venue</p>
                      <p className="mt-3 font-display text-2xl font-semibold tracking-[0em] text-white">
                        {EVENT.venueName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <TicketDownloadButton
                    downloadUrl={ticket.downloadUrl}
                    fileName={ticket.downloadFileName}
                    label={`Download Ticket ${index + 1} PDF`}
                  />
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
