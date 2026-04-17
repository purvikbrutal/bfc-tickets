import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { confirmBookingPayment, getBookingByOrderId } from "@/lib/bookings/repository";
import { finalizeConfirmedBooking } from "@/lib/payments/confirmation";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { getRateLimitResult } from "@/lib/server/rate-limit";
import { paymentVerificationSchema } from "@/lib/validation/booking";

export async function POST(request: Request) {
  const rateLimitResult = getRateLimitResult(request, "payments-verify");

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many payment verification attempts. Please wait a minute and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const payload = paymentVerificationSchema.parse(await request.json());
    const booking = await getBookingByOrderId(payload.orderId);

    if (!booking) {
      return NextResponse.json({ error: "Booking order was not found." }, { status: 404 });
    }

    if (booking.status === "confirmed" && booking.paymentId && booking.paymentId !== payload.paymentId) {
      return NextResponse.json({ error: "This booking has already been confirmed with a different payment." }, { status: 409 });
    }

    if (!verifyRazorpaySignature(payload)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const confirmedBooking = await confirmBookingPayment({
      orderId: payload.orderId,
      paymentId: payload.paymentId,
      signature: payload.signature,
    });

    if (!confirmedBooking) {
      return NextResponse.json({ error: "Unable to confirm booking." }, { status: 500 });
    }

    const confirmation = await finalizeConfirmedBooking({
      booking: confirmedBooking,
      source: "verify",
    });

    return NextResponse.json({
      success: true,
      bookingId: confirmedBooking.bookingId,
      ticketPageUrl: confirmation.ticketPageUrl,
      ticketDownloadUrl: confirmation.ticketDownloadUrl,
      notifications: confirmation.notifications,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid verification request." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 500 },
    );
  }
}
