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

    const pdfBuffer = await generateTicketPdf(booking);

    return new NextResponse(pdfBuffer, {
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
