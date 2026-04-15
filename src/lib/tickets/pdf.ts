import type { BookingRecord } from "@/lib/bookings/repository";
import { buildTicketPresentation } from "@/lib/tickets/presentation";
import { renderTicketHtml } from "@/lib/tickets/template";

export async function generateTicketPdf(booking: BookingRecord) {
  const ticket = await buildTicketPresentation(booking);
  const html = renderTicketHtml(ticket);

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });

      await page.setContent(html, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "screen" });

      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: {
          top: "0.3in",
          right: "0.3in",
          bottom: "0.3in",
          left: "0.3in",
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `PDF generation failed. Run "npx playwright install chromium" after npm install. ${error.message}`
        : 'PDF generation failed. Run "npx playwright install chromium" after npm install.',
    );
  }
}
