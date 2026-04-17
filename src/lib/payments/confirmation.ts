import {
  markEmailSent,
  markWhatsappSent,
  type BookingWithTickets,
} from "@/lib/bookings/repository";
import { sendBookingConfirmationEmail } from "@/lib/email/resend";
import { syncConfirmedBookingToSheets } from "@/lib/sheets";
import { generateTicketPdf, generateInvoicePdf } from "@/lib/tickets/pdf";
import { buildTicketPresentation } from "@/lib/tickets/presentation";
import { sendWhatsappConfirmation } from "@/lib/whatsapp/service";

export type DeliveryResult = {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
};

export type BookingConfirmationResult = {
  ticketPageUrl: string;
  ticketDownloadUrl: string;
  notifications: {
    email: DeliveryResult;
    whatsapp: DeliveryResult;
    sheets: DeliveryResult;
    pdfReady: boolean;
  };
};

export async function finalizeConfirmedBooking(input: {
  booking: BookingWithTickets;
  source: "verify" | "webhook";
}): Promise<BookingConfirmationResult> {
  const { booking } = input;

  const ticket = await buildTicketPresentation(booking);

  // Generate per-ticket PDFs and a single invoice in parallel
  const [ticketDeliveries, invoicePdf] = await Promise.all([
    Promise.all(
      booking.tickets.length > 0
        ? booking.tickets.map(async (t) => ({
            code: t.ticketCode,
            attendeeName: t.attendeeName ?? booking.fullName,
            ticketPdf: await generateTicketPdf(booking, t.ticketCode, t.attendeeName ?? booking.fullName),
          }))
        : [],
    ),
    generateInvoicePdf(booking),
  ]);

  const anyPdfReady = ticketDeliveries.some((d) => d.ticketPdf !== null) || invoicePdf !== null;

  let emailSentAt = booking.emailSentAt;
  let emailResult: DeliveryResult = booking.emailSentAt
    ? { sent: true, skipped: true, reason: "Email already sent." }
    : { sent: false };

  if (!booking.emailSentAt) {
    try {
      emailResult = await sendBookingConfirmationEmail({
        booking,
        tickets: ticketDeliveries.length > 0 ? ticketDeliveries : undefined,
        invoicePdf,
      });

      if (emailResult.sent) {
        emailSentAt = new Date();
        await markEmailSent(booking.id);
      }
    } catch (error) {
      console.error(`[${input.source}] Email delivery failed:`, error);
      emailResult = {
        sent: false,
        reason: error instanceof Error ? error.message : "Email delivery failed after payment confirmation.",
      };
    }
  }

  let whatsappResult: DeliveryResult = booking.whatsappSentAt
    ? { sent: true, skipped: true, reason: "WhatsApp already sent." }
    : { sent: false };

  if (!booking.whatsappSentAt) {
    try {
      whatsappResult = await sendWhatsappConfirmation({ booking });
      if (whatsappResult.sent) {
        await markWhatsappSent(booking.id);
      }
    } catch (error) {
      console.error(`[${input.source}] WhatsApp delivery failed:`, error);
      whatsappResult = {
        sent: false,
        reason: error instanceof Error ? error.message : "WhatsApp delivery failed after payment confirmation.",
      };
    }
  }

  let sheetsResult: DeliveryResult = { sent: false };

  try {
    sheetsResult = await syncConfirmedBookingToSheets({
      booking: { ...booking, emailSentAt },
      emailSentAt,
    });
  } catch (error) {
    console.error(`[${input.source}] Google Sheets sync failed:`, error);
    sheetsResult = {
      sent: false,
      reason: error instanceof Error ? error.message : "Google Sheets sync failed after payment confirmation.",
    };
  }

  return {
    ticketPageUrl: ticket.pageUrl,
    ticketDownloadUrl: ticket.downloadUrl,
    notifications: {
      email: emailResult,
      whatsapp: whatsappResult,
      sheets: sheetsResult,
      pdfReady: anyPdfReady,
    },
  };
}
