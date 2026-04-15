import crypto from "node:crypto";

import { getDb } from "@/lib/db";

type DbBookingRecord = {
  id: string;
  booking_id: string | null;
  order_id: string;
  payment_id: string | null;
  payment_signature: string | null;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  quantity: number;
  notes: string | null;
  amount_paise: number;
  currency: string;
  ticket_token: string | null;
  confirmed_at: string | Date | null;
  email_sent_at: string | Date | null;
  whatsapp_sent_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

export type BookingRecord = {
  id: string;
  bookingId: string | null;
  orderId: string;
  paymentId: string | null;
  paymentSignature: string | null;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  quantity: number;
  notes: string | null;
  amountPaise: number;
  currency: string;
  ticketToken: string | null;
  confirmedAt: Date | null;
  emailSentAt: Date | null;
  whatsappSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PendingBookingInput = {
  orderId: string;
  fullName: string;
  email: string;
  phone: string;
  quantity: number;
  notes?: string;
  amountPaise: number;
  currency: string;
};

function toDate(value: string | Date | null) {
  return value ? new Date(value) : null;
}

function mapBookingRecord(record: DbBookingRecord): BookingRecord {
  return {
    id: record.id,
    bookingId: record.booking_id,
    orderId: record.order_id,
    paymentId: record.payment_id,
    paymentSignature: record.payment_signature,
    status: record.status,
    fullName: record.full_name,
    email: record.email,
    phone: record.phone,
    quantity: record.quantity,
    notes: record.notes,
    amountPaise: record.amount_paise,
    currency: record.currency,
    ticketToken: record.ticket_token,
    confirmedAt: toDate(record.confirmed_at),
    emailSentAt: toDate(record.email_sent_at),
    whatsappSentAt: toDate(record.whatsapp_sent_at),
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  };
}

function generateBookingId() {
  const dateSegment = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BFC-${dateSegment}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function generateTicketToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function createPendingBooking(input: PendingBookingInput) {
  const sql = getDb();
  const [record] = await sql<DbBookingRecord[]>`
    insert into bookings (
      order_id,
      full_name,
      email,
      phone,
      quantity,
      notes,
      amount_paise,
      currency
    )
    values (
      ${input.orderId},
      ${input.fullName},
      ${input.email},
      ${input.phone},
      ${input.quantity},
      ${input.notes?.trim() ? input.notes.trim() : null},
      ${input.amountPaise},
      ${input.currency}
    )
    returning *
  `;

  return record ? mapBookingRecord(record) : null;
}

export async function getBookingByOrderId(orderId: string) {
  const sql = getDb();
  const [record] = await sql<DbBookingRecord[]>`
    select *
    from bookings
    where order_id = ${orderId}
    limit 1
  `;

  return record ? mapBookingRecord(record) : null;
}

export async function getBookingByBookingId(bookingId: string) {
  const sql = getDb();
  const [record] = await sql<DbBookingRecord[]>`
    select *
    from bookings
    where booking_id = ${bookingId}
    limit 1
  `;

  return record ? mapBookingRecord(record) : null;
}

export async function confirmBookingPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const existing = await getBookingByOrderId(input.orderId);

  if (!existing) {
    return null;
  }

  if (existing.status === "confirmed" && existing.bookingId && existing.ticketToken) {
    return existing;
  }

  const sql = getDb();
  const bookingId = existing.bookingId ?? generateBookingId();
  const ticketToken = existing.ticketToken ?? generateTicketToken();

  const [record] = await sql<DbBookingRecord[]>`
    update bookings
    set
      status = 'confirmed',
      payment_id = ${input.paymentId},
      payment_signature = ${input.signature},
      booking_id = ${bookingId},
      ticket_token = ${ticketToken},
      confirmed_at = coalesce(confirmed_at, now())
    where order_id = ${input.orderId}
    returning *
  `;

  return record ? mapBookingRecord(record) : null;
}

export async function markEmailSent(bookingId: string) {
  const sql = getDb();
  await sql`
    update bookings
    set email_sent_at = now()
    where id = ${bookingId}
  `;
}

export async function markWhatsappSent(bookingId: string) {
  const sql = getDb();
  await sql`
    update bookings
    set whatsapp_sent_at = now()
    where id = ${bookingId}
  `;
}
