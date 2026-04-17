import type { BookingRecord } from "@/lib/bookings/repository";
import { EVENT } from "@/lib/event";
import { formatRupees } from "@/lib/utils";

function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function renderWithPlaywright(
  html: string,
  format: string,
  landscape: boolean,
): Promise<Buffer | null> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "screen" });
      const pdf = await page.pdf({
        format,
        landscape,
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("PDF generation warning:", error);
    return null;
  }
}

function renderTicketHtml(booking: BookingRecord, ticketCode: string, attendeeName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A5 landscape; margin: 0; }

  html, body {
    width: 210mm;
    height: 148mm;
    overflow: hidden;
    background: #0a0a0a;
  }

  /* ── Outer frame ── */
  .ticket {
    position: relative;
    width: 100%;
    height: 100%;
    border: 2px solid #dc2626;
    overflow: hidden;
  }

  /* ── Black textured background ── */
  .bg {
    position: absolute;
    inset: 0;
    background: #0a0a0a;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0px,
      transparent 12px,
      rgba(255,255,255,0.016) 12px,
      rgba(255,255,255,0.016) 13px
    );
  }

  /* Subtle red glow bleeding from sidebar */
  .bg::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 42%;
    background: radial-gradient(ellipse at left center, rgba(220,38,38,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Red sidebar (pointed right edge via clip-path) ── */
  .sidebar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 36%;
    background: linear-gradient(160deg, #e02020 0%, #c41c1c 100%);
    clip-path: polygon(0 0, 83% 0, 100% 50%, 83% 100%, 0 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 20px 36px 20px 18px;
    z-index: 3;
  }

  /* Large translucent BFC watermark behind sidebar content */
  .sidebar-wm {
    position: absolute;
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 110px;
    color: rgba(0,0,0,0.18);
    top: 50%;
    left: 44%;
    transform: translate(-50%, -50%);
    letter-spacing: -0.04em;
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  /* "BRUTAL FIGHT CLUB" rotated vertically */
  .brand-vert {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 8.5px;
    letter-spacing: 0.5em;
    color: rgba(255,255,255,0.65);
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  /* FIGHT NIGHT stacked */
  .event-stack {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 38px;
    color: #ffffff;
    line-height: 0.9;
    text-align: center;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }

  /* Year tag at bottom of sidebar */
  .sidebar-year {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 7px;
    letter-spacing: 0.35em;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  /* ── Main content (right 65%) ── */
  .main {
    position: absolute;
    top: 0; right: 0; bottom: 0;
    left: 33%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 14px 20px 0 20px;
    z-index: 2;
  }

  /* Top bar */
  .top-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .admit-one {
    font-family: 'Bebas Neue', Impact, sans-serif;
    font-size: 11px;
    letter-spacing: 0.4em;
    color: #dc2626;
    text-transform: uppercase;
  }

  /* ── Ticket code — visual hero ── */
  .code-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .code-label {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 7px;
    letter-spacing: 0.45em;
    color: rgba(255,255,255,0.32);
    text-transform: uppercase;
  }

  /* Outer wrapper with border + 4 corner brackets */
  .code-box {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 30px;
    border: 1px solid rgba(220,38,38,0.45);
  }

  /* Corner brackets — top-left, top-right, bottom-left, bottom-right */
  .cb { position: absolute; width: 13px; height: 13px; border-color: #dc2626; border-style: solid; }
  .cb-tl { top: -4px; left: -4px; border-width: 2.5px 0 0 2.5px; }
  .cb-tr { top: -4px; right: -4px; border-width: 2.5px 2.5px 0 0; }
  .cb-bl { bottom: -4px; left: -4px; border-width: 0 0 2.5px 2.5px; }
  .cb-br { bottom: -4px; right: -4px; border-width: 0 2.5px 2.5px 0; }

  .code-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 54px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.18em;
    line-height: 1;
    text-shadow: 0 0 28px rgba(220,38,38,0.35);
  }

  /* ── Bottom details strip ── */
  .bottom-strip {
    border-top: 1px solid #dc2626;
    padding: 9px 0 11px;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .d-label {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 6.5px;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.32);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .d-value {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
</style>
</head>
<body>
<div class="ticket">
  <div class="bg"></div>

  <!-- Red sidebar -->
  <div class="sidebar">
    <span class="sidebar-wm">BFC</span>
    <p class="brand-vert">Brutal Fight Club</p>
    <p class="event-stack">FIGHT<br/>NIGHT</p>
    <p class="sidebar-year">2026</p>
  </div>

  <!-- Main content -->
  <div class="main">
    <div class="top-bar">
      <p class="admit-one">Admit One</p>
    </div>

    <div class="code-section">
      <p class="code-label">Ticket Code</p>
      <div class="code-box">
        <span class="cb cb-tl"></span>
        <span class="cb cb-tr"></span>
        <span class="cb cb-bl"></span>
        <span class="cb cb-br"></span>
        <span class="code-text">${esc(ticketCode)}</span>
      </div>
    </div>

    <div class="bottom-strip">
      <div class="details-grid">
        <div>
          <p class="d-label">Attendee</p>
          <p class="d-value">${esc(attendeeName)}</p>
        </div>
        <div>
          <p class="d-label">Date</p>
          <p class="d-value">${esc(EVENT.dateLabel)}</p>
        </div>
        <div>
          <p class="d-label">Time</p>
          <p class="d-value">${esc(EVENT.timeLabel)}</p>
        </div>
        <div>
          <p class="d-label">Venue</p>
          <p class="d-value">${esc(EVENT.venueName)}</p>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function renderInvoiceHtml(booking: BookingRecord): string {
  const amountRupees = booking.amountPaise / 100;
  const date = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; }
  @page { size: A4; margin: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    background: #fff;
    padding: 48px 56px;
    font-size: 13px;
    line-height: 1.5;
  }
  .header {
    display: flex; justify-content: space-between; align-items: flex-start;
    border-bottom: 2px solid #111;
    padding-bottom: 20px; margin-bottom: 28px;
  }
  .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.03em; }
  .brand-sub {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #666; margin-top: 3px;
  }
  .invoice-meta { text-align: right; }
  .invoice-title {
    font-size: 22px; font-weight: 900; letter-spacing: -0.03em;
    color: #dc2626;
  }
  .invoice-num { font-size: 11px; color: #555; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-label {
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #888; margin-bottom: 6px; font-weight: 700;
  }
  .bill-to { font-size: 14px; }
  .bill-name { font-weight: 700; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { border-bottom: 1px solid #ddd; }
  th {
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #888; padding: 8px 0; text-align: left; font-weight: 700;
  }
  th.right, td.right { text-align: right; }
  td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .total-row td {
    border-bottom: none; border-top: 2px solid #111;
    font-weight: 700; font-size: 15px; padding-top: 12px;
  }
  .paid-badge {
    display: inline-block;
    background: #16a34a; color: #fff;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    padding: 4px 10px; border-radius: 4px;
    text-transform: uppercase;
  }
  .footer {
    margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee;
    font-size: 10px; color: #999; text-align: center;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <p class="brand">${esc(EVENT.brand)}</p>
      <p class="brand-sub">Official Invoice</p>
    </div>
    <div class="invoice-meta">
      <p class="invoice-title">INVOICE</p>
      <p class="invoice-num">#${esc(booking.orderId)}</p>
      <p class="invoice-num">Date: ${esc(date)}</p>
    </div>
  </div>

  <div class="section">
    <p class="section-label">Billed To</p>
    <p class="bill-name">${esc(booking.fullName)}</p>
    <p class="bill-to">${esc(booking.email)}</p>
    <p class="bill-to">${esc(booking.phone)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${esc(EVENT.name)} — General Entry Ticket<br/>
          <span style="font-size:11px;color:#888;">${esc(EVENT.dateLabel)} · ${esc(EVENT.brand)}</span>
        </td>
        <td class="right">${esc(String(booking.quantity))}</td>
        <td class="right">${esc(formatRupees(amountRupees / booking.quantity))}</td>
        <td class="right">${esc(formatRupees(amountRupees))}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Total Paid</td>
        <td class="right">${esc(formatRupees(amountRupees))}</td>
      </tr>
    </tfoot>
  </table>

  <p>Payment Status: <span class="paid-badge">✓ PAID</span></p>
  ${booking.bookingId ? `<p style="margin-top:8px;color:#555;font-size:12px;">Booking ID: <strong>${esc(booking.bookingId)}</strong></p>` : ""}

  <p class="footer">
    ${esc(EVENT.brand)} &nbsp;·&nbsp; ${esc(EVENT.brand)} &nbsp;·&nbsp; brutalfightclub.com<br/>
    This is a system-generated invoice. No signature required.
  </p>
</body>
</html>`;
}

export async function generateTicketPdf(
  booking: BookingRecord,
  ticketCode: string,
  attendeeName?: string,
): Promise<Buffer | null> {
  const name = attendeeName ?? booking.fullName;
  const html = renderTicketHtml(booking, ticketCode, name);
  return renderWithPlaywright(html, "A5", true);
}

export async function generateInvoicePdf(booking: BookingRecord): Promise<Buffer | null> {
  const html = renderInvoiceHtml(booking);
  return renderWithPlaywright(html, "A4", false);
}
