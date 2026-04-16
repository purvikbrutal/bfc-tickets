import { google } from "googleapis";

import type { BookingWithTickets } from "@/lib/bookings/repository";

type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

type SheetsConfig = {
  spreadsheetId: string;
  sheetName: string;
  clientEmail: string;
  privateKey: string;
};

let sheetsClient:
  | ReturnType<typeof google.sheets>
  | null
  | undefined;

function getSheetsConfig(): SheetsConfig | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!spreadsheetId || !sheetName || !clientEmail || !privateKey) {
    return null;
  }

  return {
    spreadsheetId,
    sheetName,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

async function getSheetsClient() {
  if (sheetsClient !== undefined) {
    return sheetsClient;
  }

  const config = getSheetsConfig();

  if (!config) {
    sheetsClient = null;
    return sheetsClient;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({
    version: "v4",
    auth,
  });

  return sheetsClient;
}

function getSheetRange(sheetName: string, range: string) {
  const escapedSheetName = sheetName.replaceAll("'", "''");
  return `'${escapedSheetName}'!${range}`;
}

function formatTimestamp(value: Date | null | undefined) {
  return value ? value.toISOString() : "";
}

export async function syncConfirmedBookingToSheets(input: {
  booking: BookingWithTickets;
  emailSentAt?: Date | null;
}): Promise<DeliveryResult> {
  const config = getSheetsConfig();
  const client = await getSheetsClient();

  if (!config || !client) {
    return {
      sent: false,
      skipped: true,
      reason: "Google Sheets is not configured. Add the service account and spreadsheet env vars to enable mirroring.",
    };
  }

  if (!input.booking.bookingId || input.booking.tickets.length === 0) {
    return {
      sent: false,
      skipped: true,
      reason: "Booking is missing the confirmed ticket data required for Google Sheets sync.",
    };
  }

  const existingValues = await client.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: getSheetRange(config.sheetName, "B:B"),
  });

  const existingCodes = new Set(
    (existingValues.data.values ?? [])
      .map((row) => String(row[0] ?? "").trim())
      .filter(Boolean),
  );

  const emailSentAt = input.emailSentAt ?? input.booking.emailSentAt;
  const rows = input.booking.tickets
    .filter((ticket) => !existingCodes.has(ticket.ticketCode))
    .map((ticket) => [
      input.booking.bookingId ?? "",
      ticket.ticketCode,
      input.booking.fullName,
      input.booking.email,
      input.booking.phone,
      ticket.attendeeName ?? input.booking.fullName,
      String(input.booking.quantity),
      input.booking.paymentId ?? "",
      String(input.booking.amountPaise / 100),
      formatTimestamp(input.booking.confirmedAt),
      formatTimestamp(emailSentAt),
    ]);

  if (rows.length === 0) {
    return {
      sent: true,
      skipped: true,
      reason: "All ticket rows are already mirrored to Google Sheets.",
    };
  }

  await client.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: getSheetRange(config.sheetName, "A:K"),
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });

  return { sent: true };
}
