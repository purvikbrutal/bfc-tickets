# Brutal Fight Club Fight Night Site

Premium single-event ticket booking website for **Brutal Fight Club (BFC)** and the upcoming **Fight Night** on **April 26, 2026**.

This project is built as a focused event funnel rather than a marketplace. It combines a cinematic, luxury fight-night landing page with a backend booking flow that creates Razorpay orders, verifies payments, stores bookings in PostgreSQL, generates QR-backed tickets, renders a branded HTML/CSS ticket into PDF, sends email confirmations, and exposes a WhatsApp confirmation placeholder integration.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- Razorpay REST order creation + secure HMAC verification
- PostgreSQL (works with Supabase Postgres or any standard Postgres instance)
- Resend email delivery
- Twilio WhatsApp placeholder integration
- QR code generation with `qrcode`
- PDF generation from a custom HTML/CSS ticket template using Playwright

## What Is Included

- Premium single-page funnel with sections for hero, countdown, event details, gallery, pricing, booking, venue, FAQ, and footer
- Sticky glass navbar and restrained motion system
- Mobile-first responsive design
- Booking form with Razorpay checkout handoff
- Backend order creation route
- Backend payment verification route
- PostgreSQL booking schema and repository helpers
- Digital ticket page
- PDF ticket generation route
- Resend email service with optional PDF attachment
- Twilio WhatsApp abstraction placeholder that sends a hosted ticket link

## Project Structure

```text
db/schema.sql                         PostgreSQL schema
public/gallery/gallery-01.svg        Replace with final gallery images
src/app/page.tsx                     Landing page composition
src/app/api/payments/order/route.ts  Razorpay order creation
src/app/api/payments/verify/route.ts Payment verification + ticket flow
src/app/api/tickets/[bookingId]      PDF ticket download route
src/app/tickets/[bookingId]/page.tsx Digital ticket page
src/lib/event.ts                     Central event, pricing, venue, and content config
src/lib/bookings/repository.ts       Booking persistence helpers
src/lib/tickets/template.ts          Custom HTML/CSS ticket template
src/lib/email/resend.ts              Email confirmation service
src/lib/whatsapp/service.ts          WhatsApp placeholder service
```

## Setup

1. Install dependencies.

```bash
npm install
```

2. Install the Playwright Chromium binary used for PDF generation.

```bash
npx playwright install chromium
```

3. Copy the environment template and fill in the real values.

```bash
cp .env.example .env.local
```

4. Run the PostgreSQL schema.

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

5. Start the dev server.

```bash
npm run dev
```

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bfc_event

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx

RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=BFC Tickets <tickets@example.com>

NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=
NEXT_PUBLIC_VENUE_DIRECTIONS_URL=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Booking Flow

1. Customer fills the booking form.
2. `/api/payments/order` validates the payload and creates a Razorpay order.
3. The order is stored as a pending booking in PostgreSQL.
4. Razorpay checkout completes on the client.
5. `/api/payments/verify` verifies the signature on the backend.
6. The booking is marked confirmed and gets a unique BFC booking ID plus ticket token.
7. A QR-backed digital ticket is prepared.
8. A PDF is generated from the custom HTML/CSS template.
9. Email confirmation is sent through Resend.
10. WhatsApp confirmation is sent through the placeholder service if Twilio is configured.

## Ticket Template Notes

The PDF ticket is intentionally built from a **programmable HTML/CSS template** instead of Canva or a static image. The key file is:

- `src/lib/tickets/template.ts`

That means you can later restyle the ticket to match a Canva-designed look while keeping the same data flow, QR generation, booking IDs, and PDF export pipeline.

## Replace Later

These are the primary placeholder areas designed for later handoff:

- `public/gallery/gallery-01.svg` to `public/gallery/gallery-06.svg`
  Replace these placeholder files with your final photo gallery images.
- `src/lib/event.ts`
  Update venue name, venue address, directions link, embed URL, and any finalized event copy.
- `src/components/sections/footer-section.tsx`
  Replace social placeholders, contact placeholders, terms link, and privacy link.

## Notes

- The site is intentionally focused on one event only: **Fight Night**
- Price is fixed at **Rs 199**
- Deal copy remains **Rs 899 OFF**
- Countdown targets **April 26, 2026 at 5:00 PM**
- Email delivery is fully implemented, but it requires valid Resend credentials
- WhatsApp is implemented as a provider abstraction with Twilio placeholders so it can be swapped or completed later

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```
