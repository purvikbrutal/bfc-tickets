import type { Metadata } from "next";

const sections = [
  {
    title: "What We Collect",
    body:
      "We collect the buyer details you enter at checkout, ticket holder names when provided, payment references needed to confirm the order, and delivery metadata for email or messaging notifications.",
  },
  {
    title: "Why We Use It",
    body:
      "This information is used to create bookings, issue tickets, send confirmations, support entry validation, and maintain internal sales records such as mirrored Google Sheets exports.",
  },
  {
    title: "Third-Party Services",
    body:
      "Payment processing, email delivery, optional WhatsApp delivery, and spreadsheet mirroring may rely on third-party providers that process only the data required for those services.",
  },
  {
    title: "Retention",
    body:
      "Booking and ticket records may be retained for operations, support, reconciliation, and event security purposes until your final retention policy is published.",
  },
] as const;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#09090b,_#050507)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/64">
          This placeholder privacy page explains how booking data is handled until your final legal policy text is approved.
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[26px] border border-white/10 bg-white/4 p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-[0em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62 sm:text-base">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
