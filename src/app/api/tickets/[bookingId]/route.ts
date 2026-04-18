import { NextResponse } from "next/server";

import { getBookingByBookingId } from "@/lib/bookings/repository";
import { generateTicketPdf } from "@/lib/tickets/pdf";

type TicketRouteProps = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(request: Request, { params }: TicketRouteProps) {
  try {
    const { bookingId } = await params;
    const searchParams = new URL(request.url).searchParams;
    const token = searchParams.get("token");
    const ticketIndexValue = searchParams.get("index");
    const ticketIndex = ticketIndexValue === null ? 0 : Number(ticketIndexValue);

    if (!token) {
      return NextResponse.json({ error: "Ticket token is required." }, { status: 400 });
    }

    if (!Number.isInteger(ticketIndex) || ticketIndex < 0) {
      return NextResponse.json({ error: "Ticket index must be a non-negative integer." }, { status: 400 });
    }

    const booking = await getBookingByBookingId(bookingId);

    if (!booking || booking.ticketToken !== token) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const selectedTicket = booking.tickets[ticketIndex];

    if (!selectedTicket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const ticketCode = selectedTicket.ticketCode;
    const attendeeName = selectedTicket.attendeeName ?? booking.fullName;
    const pdfBuffer = await generateTicketPdf(booking, ticketCode, attendeeName);

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: "PDF generation is temporarily unavailable. Please use the digital ticket page." },
        { status: 503 },
      );
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bfc-ticket-${booking.bookingId ?? bookingId}-${ticketCode}.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate ticket PDF." },
      { status: 500 },
    );
  }
}
