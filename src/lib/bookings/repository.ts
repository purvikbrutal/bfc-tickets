import crypto from "node:crypto";

import { getDb } from "@/lib/db";
import { generateUniqueTicketCode } from "@/lib/tickets/generate";

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

type DbTicketRecord = {
  ticket_id: string;
  booking_id: string;
  ticket_code: string;
  attendee_name: string | null;
  created_at: string | Date;
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

export type TicketRecord = {
  ticketId: string;
  bookingId: string;
  ticketCode: string;
  attendeeName: string | null;
  createdAt: Date;
};

export type BookingWithTickets = BookingRecord & {
  tickets: TicketRecord[];
};

type PendingBookingInput = {
  orderId: string;
  fullName: string;
  email: string;
  phone: string;
  quantity: number;
  attendeeNames?: string[];
  notes?: string;
  amountPaise: number;
  currency: string;
};

type ConfirmBookingInput = {
  orderId: string;
  paymentId?: string | null;
  signature?: string | null;
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

function mapTicketRecord(record: DbTicketRecord): TicketRecord {
  return {
    ticketId: record.ticket_id,
    bookingId: record.booking_id,
    ticketCode: record.ticket_code,
    attendeeName: record.attendee_name,
    createdAt: new Date(record.created_at),
  };
}

function generateBookingId() {
  const dateSegment = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BFC-${dateSegment}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function generateTicketToken() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeAttendeeName(attendeeName?: string | null) {
  return attendeeName?.trim() ? attendeeName.trim() : null;
}

function normalizeAttendeeNames(attendeeNames: string[] | undefined, quantity: number) {
  return Array.from({ length: quantity }, (_, index) => normalizeAttendeeName(attendeeNames?.[index]));
}

async function getTicketRecordsByBookingId(bookingId: string) {
  const sql = getDb();
  const records = await sql<DbTicketRecord[]>`
    select *
    from tickets
    where booking_id = ${bookingId}
    order by created_at asc, ticket_id asc
  `;

  return records.map(mapTicketRecord);
}

async function insertTicketRecord(bookingId: string, attendeeName?: string | null) {
  const sql = getDb();
  const ticketCode = await generateUniqueTicketCode();
  const [record] = await sql<DbTicketRecord[]>`
    insert into tickets (
      booking_id,
      ticket_code,
      attendee_name
    )
    values (
      ${bookingId},
      ${ticketCode},
      ${normalizeAttendeeName(attendeeName)}
    )
    returning *
  `;

  return record ? mapTicketRecord(record) : null;
}

async function ensureBookingTickets(booking: BookingRecord) {
  let tickets = await getTicketRecordsByBookingId(booking.id);

  for (let index = tickets.length; index < booking.quantity; index += 1) {
    await insertTicketRecord(booking.id);
  }

  if (tickets.length !== booking.quantity) {
    tickets = await getTicketRecordsByBookingId(booking.id);
  }

  return tickets;
}

async function enrichBookingWithTickets(booking: BookingRecord): Promise<BookingWithTickets> {
  return {
    ...booking,
    tickets: await ensureBookingTickets(booking),
  };
}

async function getBookingRecordByOrderId(orderId: string) {
  const sql = getDb();
  const [record] = await sql<DbBookingRecord[]>`
    select *
    from bookings
    where order_id = ${orderId}
    limit 1
  `;

  return record ? mapBookingRecord(record) : null;
}

async function getBookingRecordByBookingId(bookingId: string) {
  const sql = getDb();
  const [record] = await sql<DbBookingRecord[]>`
    select *
    from bookings
    where booking_id = ${bookingId}
    limit 1
  `;

  return record ? mapBookingRecord(record) : null;
}

export async function getBookingByOrderId(orderId: string) {
  const booking = await getBookingRecordByOrderId(orderId);

  return booking ? enrichBookingWithTickets(booking) : null;
}

export async function getBookingByBookingId(bookingId: string) {
  const booking = await getBookingRecordByBookingId(bookingId);

  return booking ? enrichBookingWithTickets(booking) : null;
}

export async function createPendingBooking(input: PendingBookingInput) {
  // Pre-generate unique codes outside the transaction to avoid cross-connection conflicts
  const ticketCodes = await Promise.all(
    Array.from({ length: input.quantity }, () => generateUniqueTicketCode()),
  );

  const sql = getDb();
  const booking = await sql.begin(async (transaction) => {
    const [record] = await transaction<DbBookingRecord[]>`
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

    if (!record) {
      return null;
    }

    const attendeeNames = normalizeAttendeeNames(input.attendeeNames, input.quantity);

    for (let i = 0; i < attendeeNames.length; i++) {
      await transaction<DbTicketRecord[]>`
        insert into tickets (
          booking_id,
          ticket_code,
          attendee_name
        )
        values (
          ${record.id},
          ${ticketCodes[i]!},
          ${attendeeNames[i]}
        )
      `;
    }

    return mapBookingRecord(record);
  });

  return booking ? enrichBookingWithTickets(booking) : null;
}

export async function confirmBooking(input: ConfirmBookingInput | string) {
  const payload =
    typeof input === "string"
      ? {
          orderId: input,
          paymentId: null,
          signature: null,
        }
      : {
          orderId: input.orderId,
          paymentId: input.paymentId ?? null,
          signature: input.signature ?? null,
        };

  const existing = await getBookingRecordByOrderId(payload.orderId);

  if (!existing) {
    return null;
  }

  if (existing.status === "confirmed" && existing.bookingId && existing.ticketToken) {
    return enrichBookingWithTickets(existing);
  }

  const sql = getDb();
  const bookingId = existing.bookingId ?? generateBookingId();
  const ticketToken = existing.ticketToken ?? generateTicketToken();

  const [record] = await sql<DbBookingRecord[]>`
    update bookings
    set
      status = 'confirmed',
      payment_id = coalesce(${payload.paymentId}, payment_id),
      payment_signature = coalesce(${payload.signature}, payment_signature),
      booking_id = ${bookingId},
      ticket_token = ${ticketToken},
      confirmed_at = coalesce(confirmed_at, now())
    where order_id = ${payload.orderId}
    returning *
  `;

  return record ? enrichBookingWithTickets(mapBookingRecord(record)) : null;
}

export async function confirmBookingPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  return confirmBooking(input);
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
