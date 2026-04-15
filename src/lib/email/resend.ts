import { Resend } from "resend";

import type { BookingRecord } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { buildTicketPresentation } from "@/lib/tickets/presentation";

type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

let resendClient: Resend | null | undefined;

function getResendClient() {
  if (resendClient !== undefined) {
    return resendClient;
  }

  if (!process.env.RESEND_API_KEY) {
    resendClient = null;
    return resendClient;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function renderBookingEmailHtml(input: {
  attendeeName: string;
  bookingId: string;
  ticketPageUrl: string;
  downloadUrl: string;
  quantity: number;
}) {
  return `
    <div style="margin:0;background:#050507;padding:32px;font-family:'Avenir Next','Segoe UI',sans-serif;color:#F5F5F5;">
      <div style="max-width:640px;margin:0 auto;border-radius:28px;border:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),rgba(14,14,18,0.92);padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.54);">${EVENT.brand}</p>
        <h1 style="margin:0;font-size:36px;letter-spacing:-0.06em;line-height:1;">Your ${EVENT.name} ticket is confirmed.</h1>
        <p style="margin:16px 0 0;color:rgba(255,255,255,0.68);line-height:1.8;">
          Hi ${input.attendeeName}, your booking is locked in for ${EVENT.dateLabel} at ${EVENT.timeLabel}. Your booking ID is <strong>${input.bookingId}</strong>.
        </p>

        <div style="margin-top:24px;padding:20px;border-radius:22px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.48);">Booking summary</p>
          <p style="margin:0 0 8px;font-size:18px;">Quantity: ${input.quantity}</p>
          <p style="margin:0;font-size:18px;">Venue: ${EVENT.venueName}</p>
        </div>

        <div style="margin-top:24px;">
          <a href="${input.ticketPageUrl}" style="display:inline-block;border-radius:999px;background:#FFFFFF;color:#050507;padding:14px 22px;text-decoration:none;font-weight:700;">
            Open Digital Ticket
          </a>
        </div>

        <p style="margin-top:20px;color:rgba(255,255,255,0.58);line-height:1.8;">
          Download link: <a href="${input.downloadUrl}" style="color:#F5F5F5;">${input.downloadUrl}</a>
        </p>
        <p style="margin-top:20px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(252,165,165,0.86);">
          Show this ticket at entry
        </p>
      </div>
    </div>
  `;
}

export async function sendBookingConfirmationEmail(input: {
  booking: BookingRecord;
  pdfBuffer?: Buffer | null;
}): Promise<DeliveryResult> {
  const client = getResendClient();
  const fromEmail = process.env.EMAIL_FROM;

  if (!client || !fromEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "Resend is not configured. Add RESEND_API_KEY and EMAIL_FROM to enable email delivery.",
    };
  }

  if (!input.booking.bookingId) {
    throw new Error("Booking email cannot be sent without a booking ID.");
  }

  const ticket = await buildTicketPresentation(input.booking);

  await client.emails.send({
    from: fromEmail,
    to: [input.booking.email],
    subject: `${EVENT.name} Ticket - ${input.booking.bookingId}`,
    html: renderBookingEmailHtml({
      attendeeName: input.booking.fullName,
      bookingId: input.booking.bookingId,
      ticketPageUrl: ticket.pageUrl,
      downloadUrl: ticket.downloadUrl,
      quantity: input.booking.quantity,
    }),
    attachments: input.pdfBuffer
      ? [
          {
            filename: `${input.booking.bookingId}.pdf`,
            content: input.pdfBuffer.toString("base64"),
          },
        ]
      : undefined,
  });

  return { sent: true };
}
