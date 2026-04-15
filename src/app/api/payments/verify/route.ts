import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  confirmBookingPayment,
  getBookingByOrderId,
  markEmailSent,
  markWhatsappSent,
} from "@/lib/bookings/repository";
import { sendBookingConfirmationEmail } from "@/lib/email/resend";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { generateTicketPdf } from "@/lib/tickets/pdf";
import { buildTicketPresentation } from "@/lib/tickets/presentation";
import { paymentVerificationSchema } from "@/lib/validation/booking";
import { sendWhatsappConfirmation } from "@/lib/whatsapp/service";

type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

export async function POST(request: Request) {
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

    const ticket = await buildTicketPresentation(confirmedBooking);

    let pdfBuffer: Buffer | null = null;

    try {
      pdfBuffer = await generateTicketPdf(confirmedBooking);
    } catch (error) {
      console.error("PDF generation warning:", error);
    }

    let emailResult: DeliveryResult = confirmedBooking.emailSentAt
      ? { sent: true, skipped: true, reason: "Email already sent." }
      : { sent: false };

    if (!confirmedBooking.emailSentAt) {
      try {
        emailResult = await sendBookingConfirmationEmail({
          booking: confirmedBooking,
          pdfBuffer,
        });
      } catch (error) {
        emailResult = {
          sent: false,
          reason: error instanceof Error ? error.message : "Email delivery failed after payment verification.",
        };
      }
    }

    if (emailResult.sent && !confirmedBooking.emailSentAt) {
      await markEmailSent(confirmedBooking.id);
    }

    let whatsappResult: DeliveryResult = confirmedBooking.whatsappSentAt
      ? { sent: true, skipped: true, reason: "WhatsApp already sent." }
      : { sent: false };

    if (!confirmedBooking.whatsappSentAt) {
      try {
        whatsappResult = await sendWhatsappConfirmation({
          booking: confirmedBooking,
        });
      } catch (error) {
        whatsappResult = {
          sent: false,
          reason: error instanceof Error ? error.message : "WhatsApp delivery failed after payment verification.",
        };
      }
    }

    if (whatsappResult.sent && !confirmedBooking.whatsappSentAt) {
      await markWhatsappSent(confirmedBooking.id);
    }

    return NextResponse.json({
      success: true,
      bookingId: confirmedBooking.bookingId,
      ticketPageUrl: ticket.pageUrl,
      ticketDownloadUrl: ticket.downloadUrl,
      notifications: {
        email: emailResult,
        whatsapp: whatsappResult,
        pdfReady: Boolean(pdfBuffer),
      },
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
