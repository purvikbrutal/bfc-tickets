import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const store = await cookies();
  if (store.get("admin_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.toUpperCase().trim();

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Provide a 6-character ticket code." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql`
    SELECT
      t.ticket_code,
      t.attendee_name,
      t.created_at AS ticket_created_at,
      b.booking_id,
      b.full_name,
      b.email,
      b.phone,
      b.quantity,
      b.amount_paise,
      b.status,
      b.order_id,
      b.payment_id,
      b.confirmed_at,
      b.created_at AS booking_created_at
    FROM tickets t
    JOIN bookings b ON b.id = t.booking_id
    WHERE t.ticket_code = ${code}
    LIMIT 1
  `;

  if (!row) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    ticket: {
      code: row.ticket_code,
      attendeeName: row.attendee_name ?? row.full_name,
      bookingId: row.booking_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      quantity: row.quantity,
      amountPaise: row.amount_paise,
      status: row.status,
      orderId: row.order_id,
      paymentId: row.payment_id,
      confirmedAt: row.confirmed_at,
      bookingCreatedAt: row.booking_created_at,
    },
  });
}
