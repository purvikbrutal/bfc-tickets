import crypto from "node:crypto";

import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";

import { confirmBooking, markEmailSent, markWhatsappSent, type BookingWithTickets } from "@/lib/bookings/repository";
import { sendBookingConfirmationEmail as sendTicketEmail } from "@/lib/email/resend";
import { syncConfirmedBookingToSheets } from "@/lib/sheets";
import { sendWhatsappConfirmation } from "@/lib/whatsapp/service";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

function queuePostConfirmationMirrors(input: {
  booking: BookingWithTickets;
  emailSentAt: Date | null;
}) {
  const mirroredBooking: BookingWithTickets = {
    ...input.booking,
    emailSentAt: input.emailSentAt ?? input.booking.emailSentAt,
  };

  setImmediate(() => {
    void syncConfirmedBookingToSheets({
      booking: mirroredBooking,
      emailSentAt: mirroredBooking.emailSentAt,
    }).catch((error) => {
      console.error("Google Sheets sync failed:", error);
    });

    if (!mirroredBooking.whatsappSentAt) {
      void sendWhatsappConfirmation({ booking: mirroredBooking })
        .then(async (result) => {
          if (result.sent) {
            await markWhatsappSent(mirroredBooking.id);
          }
        })
        .catch((error) => {
          console.error("WhatsApp confirmation failed:", error);
        });
    }
  });
}

function verifyWebhookSignature(rawBody: Buffer, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const signatureHeader = req.headers["x-razorpay-signature"];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

  if (!signature) {
    return res.status(400).json({ error: "Missing x-razorpay-signature header." });
  }

  let rawBody: Buffer;

  try {
    rawBody = await buffer(req);
  } catch {
    return res.status(400).json({ error: "Unable to read the Razorpay webhook body." });
  }

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ error: "Invalid Razorpay webhook signature." });
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to verify Razorpay webhook signature.",
    });
  }

  let event: RazorpayWebhookEvent;

  try {
    event = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhookEvent;
  } catch {
    return res.status(400).json({ error: "Invalid Razorpay webhook payload." });
  }

  if (event.event !== "payment.captured") {
    return res.status(200).json({
      ok: true,
      skipped: true,
      reason: `Ignored event ${event.event ?? "unknown"}.`,
    });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id ?? null;

  if (!orderId) {
    return res.status(400).json({ error: "Missing order_id in payment.captured payload." });
  }

  try {
    const booking = await confirmBooking({
      orderId,
      paymentId,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking order was not found." });
    }

    const emailWasAlreadySent = Boolean(booking.emailSentAt);
    const emailResult = emailWasAlreadySent
      ? { sent: true, skipped: true as const, reason: "Email already sent." }
      : await sendTicketEmail({
          booking,
        });

    const effectiveEmailSentAt = booking.emailSentAt ?? (emailResult.sent ? new Date() : null);

    if (emailResult.sent && !booking.emailSentAt) {
      await markEmailSent(booking.id);
    }

    if (emailWasAlreadySent || emailResult.sent) {
      queuePostConfirmationMirrors({
        booking,
        emailSentAt: effectiveEmailSentAt,
      });
    }

    return res.status(200).json({
      ok: true,
      status: emailWasAlreadySent ? "already_confirmed" : "confirmed",
      bookingId: booking.bookingId,
      email: emailResult,
      mirrors: {
        sheets: emailWasAlreadySent || emailResult.sent ? "queued" : "skipped",
        whatsapp: emailWasAlreadySent || emailResult.sent ? "queued" : "skipped",
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to process Razorpay webhook.",
    });
  }
}
