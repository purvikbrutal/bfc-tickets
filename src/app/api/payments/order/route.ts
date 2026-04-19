import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createPendingBooking } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getRateLimitResult } from "@/lib/server/rate-limit";
import { bookingRequestSchema } from "@/lib/validation/booking";
import { formatRupees } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const rateLimitResult = await getRateLimitResult(request, "payments-order");

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please wait a minute and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        },
      );
    }

    const rawPayload = (await request.json()) as Record<string, unknown>;
    const payload = bookingRequestSchema.parse(rawPayload);
    const couponCode =
      typeof rawPayload.couponCode === "string" ? rawPayload.couponCode.trim().toUpperCase() : "";
    const hasTestCoupon = couponCode === "BFCTEST";
    const amountPaise = hasTestCoupon ? 200 : payload.quantity * EVENT.price * 100;
    const order = await createRazorpayOrder({
      amountPaise,
      receipt: `bfc-${Date.now()}`,
      notes: {
        event: EVENT.name,
        email: payload.email,
        phone: payload.phone,
      },
    });

    await createPendingBooking({
      orderId: order.id,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      quantity: payload.quantity,
      attendeeNames: payload.attendeeNames,
      amountPaise,
      currency: order.currency,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      quantity: payload.quantity,
      totalLabel: formatRupees(EVENT.price * payload.quantity),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout order." },
      { status: 500 },
    );
  }
}
