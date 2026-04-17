import { NextResponse } from "next/server";

import { getBookingByBookingId } from "@/lib/bookings/repository";
import { generateTicketPdf } from "@/lib/tickets/pdf";

type TicketRouteProps = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(request: Request, { params }: TicketRouteProps) {
  try {
    const { bookingId } = await params;
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Ticket token is required." }, { status: 400 });
    }

    const booking = await getBookingByBookingId(bookingId);

    if (!booking || booking.ticketToken !== token) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const firstTicket = booking.tickets[0];
    const ticketCode = firstTicket?.ticketCode ?? booking.bookingId ?? bookingId;
    const attendeeName = firstTicket?.attendeeName ?? booking.fullName;
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
        "Content-Disposition": `inline; filename="${booking.bookingId ?? bookingId}.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate ticket PDF." },
      { status: 500 },
    );
  }
}
