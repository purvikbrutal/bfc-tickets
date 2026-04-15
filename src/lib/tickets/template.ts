import type { TicketPresentation } from "@/lib/tickets/presentation";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderTicketHtml(ticket: TicketPresentation) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(ticket.eventName)} Ticket</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          background:
            radial-gradient(circle at 16% 16%, rgba(180, 31, 50, 0.18), transparent 18%),
            radial-gradient(circle at 84% 14%, rgba(180, 31, 50, 0.14), transparent 22%),
            linear-gradient(180deg, #09090B 0%, #050507 100%);
          color: #F5F5F5;
          font-family: "Avenir Next", "Segoe UI", sans-serif;
          padding: 32px;
        }
        .sheet {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          border-radius: 36px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at top right, rgba(180, 31, 50, 0.18), transparent 24%),
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            rgba(14, 14, 18, 0.92);
          padding: 36px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 40px 90px rgba(0, 0, 0, 0.32);
        }
        .sheet::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(transparent 50%, rgba(255,255,255,0.018) 50%),
            radial-gradient(rgba(255,255,255,0.04) 0.6px, transparent 0.7px);
          background-size: 100% 3px, 7px 7px;
          opacity: 0.15;
          pointer-events: none;
        }
        .grid {
          position: relative;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 28px;
        }
        .card {
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 26px;
          backdrop-filter: blur(24px);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 700;
          color: rgba(255,255,255,0.74);
        }
        .title {
          margin: 18px 0 8px;
          font-family: "SF Pro Display", "Avenir Next", sans-serif;
          font-size: 54px;
          line-height: 0.95;
          letter-spacing: -0.06em;
        }
        .subtitle {
          margin: 0;
          color: rgba(255,255,255,0.66);
          font-size: 17px;
          line-height: 1.7;
        }
        .meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 26px;
        }
        .meta-item {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          padding: 18px;
        }
        .meta-label {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
        }
        .meta-value {
          margin: 10px 0 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .right-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }
        .qr-box {
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.1);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
            rgba(0,0,0,0.36);
          padding: 20px;
          text-align: center;
        }
        .qr-box img {
          display: block;
          width: 100%;
          max-width: 250px;
          margin: 0 auto;
        }
        .qr-caption {
          margin-top: 16px;
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          line-height: 1.6;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .footer p {
          margin: 0;
        }
        .instruction {
          font-size: 13px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(252, 165, 165, 0.86);
        }
        .link {
          color: rgba(255,255,255,0.74);
          font-size: 12px;
          line-height: 1.7;
          word-break: break-all;
        }
        @media (max-width: 920px) {
          body { padding: 16px; }
          .sheet { padding: 24px; }
          .grid { grid-template-columns: 1fr; }
          .title { font-size: 42px; }
        }
      </style>
    </head>
    <body>
      <main class="sheet">
        <section class="grid">
          <div class="card">
            <span class="eyebrow">${escapeHtml(ticket.brand)}</span>
            <h1 class="title">${escapeHtml(ticket.eventName)}</h1>
            <p class="subtitle">Branded ticket generated from a custom HTML and CSS template.</p>

            <div class="meta">
              <div class="meta-item">
                <p class="meta-label">Date</p>
                <p class="meta-value">${escapeHtml(ticket.dateLabel)}</p>
              </div>
              <div class="meta-item">
                <p class="meta-label">Time</p>
                <p class="meta-value">${escapeHtml(ticket.timeLabel)}</p>
              </div>
              <div class="meta-item">
                <p class="meta-label">Attendee</p>
                <p class="meta-value">${escapeHtml(ticket.attendeeName)}</p>
              </div>
              <div class="meta-item">
                <p class="meta-label">Phone</p>
                <p class="meta-value">${escapeHtml(ticket.phone)}</p>
              </div>
              <div class="meta-item">
                <p class="meta-label">Quantity</p>
                <p class="meta-value">${escapeHtml(String(ticket.quantity))}</p>
              </div>
              <div class="meta-item">
                <p class="meta-label">Booking ID</p>
                <p class="meta-value">${escapeHtml(ticket.bookingId)}</p>
              </div>
            </div>
          </div>

          <div class="right-card">
            <div class="card">
              <p class="meta-label">Venue</p>
              <p class="meta-value">${escapeHtml(ticket.venueName)}</p>
              <p class="meta-label" style="margin-top: 22px;">Order Value</p>
              <p class="meta-value">${escapeHtml(ticket.amountLabel)}</p>
            </div>
            <div class="qr-box">
              <img src="${ticket.qrCodeDataUrl}" alt="QR code for event entry" />
              <p class="qr-caption">QR points to the hosted digital ticket for quick entry verification.</p>
            </div>
          </div>
        </section>

        <div class="footer">
          <div>
            <p class="instruction">${escapeHtml(ticket.instructions)}</p>
            <p class="link">${escapeHtml(ticket.downloadUrl)}</p>
          </div>
          <p class="link">${escapeHtml(ticket.pageUrl)}</p>
        </div>
      </main>
    </body>
  </html>`;
}
