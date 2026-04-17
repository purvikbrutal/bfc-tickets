import crypto from "node:crypto";

import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";

import { confirmBooking } from "@/lib/bookings/repository";
import { finalizeConfirmedBooking } from "@/lib/payments/confirmation";

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

    if (booking.paymentSignature && (booking.emailSentAt || booking.whatsappSentAt)) {
      return res.status(200).json({
        ok: true,
        status: "verified_by_client",
        bookingId: booking.bookingId,
        fallback: false,
      });
    }

    const confirmation = await finalizeConfirmedBooking({
      booking,
      source: "webhook",
    });

    return res.status(200).json({
      ok: true,
      status: booking.emailSentAt || booking.whatsappSentAt ? "already_confirmed" : "confirmed",
      bookingId: booking.bookingId,
      fallback: true,
      notifications: confirmation.notifications,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to process Razorpay webhook.",
    });
  }
}
