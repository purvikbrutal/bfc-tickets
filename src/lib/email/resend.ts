import { Resend } from "resend";

import type { BookingWithTickets } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { renderTicketEmailHtml } from "@/lib/email/templates/ticket";

export type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

let resendClient: Resend | null | undefined;

function getResendClient() {
  if (resendClient !== undefined) return resendClient;
  if (!process.env.RESEND_API_KEY) {
    resendClient = null;
    return resendClient;
  }
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export type TicketEmailDelivery = {
  code: string;
  attendeeName: string;
  ticketPdf: Buffer | null;
};

export async function sendBookingConfirmationEmail(input: {
  booking: BookingWithTickets;
  tickets?: TicketEmailDelivery[];
  invoicePdf?: Buffer | null;
}): Promise<DeliveryResult> {
  const client = getResendClient();
  const fromEmail = process.env.EMAIL_FROM;

  if (!client || !fromEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "Resend not configured. Add RESEND_API_KEY and EMAIL_FROM to enable email delivery.",
    };
  }

  if (!input.booking.bookingId) {
    throw new Error("Booking email cannot be sent without a booking ID.");
  }

  const bookingId = input.booking.bookingId;

  // Build per-ticket deliveries, falling back to booking-level if no tickets recorded
  const deliveries: TicketEmailDelivery[] =
    input.tickets && input.tickets.length > 0
      ? input.tickets
      : [
          {
            code: bookingId,
            attendeeName: input.booking.fullName,
            ticketPdf: null,
          },
        ];

  const pdfAttached = deliveries.some((d) => d.ticketPdf !== null) || !!input.invoicePdf;

  await Promise.all(
    deliveries.map((delivery) => {
      const attachments: Array<{ filename: string; content: string }> = [];

      if (delivery.ticketPdf) {
        attachments.push({
          filename: `ticket-${delivery.code}.pdf`,
          content: delivery.ticketPdf.toString("base64"),
        });
      }

      if (input.invoicePdf) {
        attachments.push({
          filename: `invoice-${bookingId}.pdf`,
          content: input.invoicePdf.toString("base64"),
        });
      }

      return client.emails.send({
        from: fromEmail,
        to: [input.booking.email],
        subject: `Your ${EVENT.name} Ticket \u2014 ${delivery.code}`,
        html: renderTicketEmailHtml({
          attendeeName: delivery.attendeeName,
          ticketCode: delivery.code,
          bookingId,
          pdfAttached,
        }),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    }),
  );

  return { sent: true };
}
