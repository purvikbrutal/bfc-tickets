import Image from "next/image";
import { notFound } from "next/navigation";

import { getBookingByBookingId } from "@/lib/bookings/repository";
import { buildTicketPresentation } from "@/lib/tickets/presentation";

type TicketPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const { bookingId } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  const booking = await getBookingByBookingId(bookingId);

  if (!booking || booking.ticketToken !== token) {
    notFound();
  }

  const ticket = await buildTicketPresentation(booking);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(180,31,50,0.16),_transparent_28%),linear-gradient(180deg,_#09090b,_#050507)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel noise-overlay rounded-[36px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <section className="glass-panel rounded-[30px] p-6 sm:p-8">
              <span className="eyebrow">{ticket.brand}</span>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                {ticket.eventName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
                Digital ticket preview for entry and download.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Date</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.dateLabel}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Time</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.timeLabel}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Attendee</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.attendeeName}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Phone</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.phone}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Quantity</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.quantity}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Booking ID</p>
                  <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.bookingId}</p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="glass-panel rounded-[30px] p-6 text-center sm:p-8">
                <Image
                  src={ticket.qrCodeDataUrl}
                  alt="QR code for entry"
                  width={260}
                  height={260}
                  unoptimized
                  className="mx-auto w-full max-w-[260px]"
                />
                <p className="mt-4 text-sm leading-6 text-white/62">{ticket.instructions}</p>
              </div>

              <div className="glass-panel rounded-[30px] p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">Venue</p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">{ticket.venueName}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/42">Total Paid</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em]">{ticket.amountLabel}</p>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={ticket.downloadUrl}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92"
                  >
                    Download PDF Ticket
                  </a>
                  <p className="text-xs leading-6 text-white/46">{ticket.pageUrl}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
