import { EVENT } from "@/lib/event";

function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderTicketEmailHtml(input: {
  attendeeName: string;
  ticketCode: string;
  bookingId: string;
  pdfAttached: boolean;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#050507;padding:24px;font-family:'Segoe UI',Arial,sans-serif;color:#f5f5f5;">
  <div style="max-width:560px;margin:0 auto;">

    <!-- Header -->
    <div style="margin-bottom:28px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#dc2626;font-weight:700;">
        ${esc(EVENT.brand)}
      </p>
      <h1 style="margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:-0.04em;line-height:1.1;color:#fff;">
        You&rsquo;re in. 🥊
      </h1>
      <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">
        Hey ${esc(input.attendeeName)}, your ticket for <strong style="color:#fff;">${esc(EVENT.name)}</strong> is confirmed.
      </p>
    </div>

    <!-- Ticket Code Block -->
    <div style="background:#0f0f0f;border:2px solid #dc2626;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.4);">
        Your Ticket Code
      </p>
      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:44px;font-weight:700;letter-spacing:0.1em;color:#dc2626;line-height:1;">
        ${esc(input.ticketCode)}
      </p>
      <p style="margin:10px 0 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.35);">
        &mdash; Admit One &mdash;
      </p>
    </div>

    <!-- Event Details -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.4);">
        Event Details
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:12px;width:90px;">Date</td>
          <td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;">${esc(EVENT.dateLabel)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:12px;">Time</td>
          <td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;">${esc(EVENT.timeLabel)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:12px;">Venue</td>
          <td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;">${esc(EVENT.brand)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:12px;">Booking ID</td>
          <td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;font-family:'Courier New',monospace;">${esc(input.bookingId)}</td>
        </tr>
      </table>
    </div>

    <!-- PDF note -->
    ${
      input.pdfAttached
        ? `<p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
            Your <strong style="color:#fff;">ticket PDF</strong> and <strong style="color:#fff;">invoice</strong> are attached to this email. Present the ticket at entry.
          </p>`
        : `<p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">
            Your ticket code above is your entry pass. <strong style="color:#fff;">Show this email at the door</strong> — we have your booking on record.
          </p>`
    }

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
      <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(220,38,38,0.8);">
        Show your ticket code at entry
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
        ${esc(EVENT.brand)} &nbsp;&middot;&nbsp; brutalfightclub.com
      </p>
    </div>

  </div>
</body>
</html>`;
}
