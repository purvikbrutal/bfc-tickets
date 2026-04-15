import type { BookingRecord } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { buildTicketPresentation } from "@/lib/tickets/presentation";
import { normalizePhone } from "@/lib/utils";

type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

function getWhatsappConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

export async function sendWhatsappConfirmation(input: { booking: BookingRecord }): Promise<DeliveryResult> {
  const config = getWhatsappConfig();

  if (!config) {
    return {
      sent: false,
      skipped: true,
      reason: "Twilio WhatsApp placeholder is not configured. Add the Twilio WhatsApp env vars to enable delivery.",
    };
  }

  if (!input.booking.bookingId) {
    throw new Error("WhatsApp confirmation requires a confirmed booking ID.");
  }

  const ticket = await buildTicketPresentation(input.booking);
  const to = input.booking.phone.startsWith("whatsapp:")
    ? input.booking.phone
    : `whatsapp:${normalizePhone(input.booking.phone)}`;

  const body = new URLSearchParams({
    To: to,
    From: config.fromNumber,
    Body: [
      `${EVENT.brand} confirmation`,
      `Booking ID: ${input.booking.bookingId}`,
      `Tickets: ${input.booking.quantity}`,
      `Date: ${EVENT.dateLabel} • ${EVENT.timeLabel}`,
      `Ticket link: ${ticket.pageUrl}`,
    ].join("\n"),
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const details = (await response.text().catch(() => "")) || "Unable to send WhatsApp confirmation.";
    throw new Error(details);
  }

  return { sent: true };
}
