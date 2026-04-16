const sections = [
  {
    title: "Ticket Use",
    body:
      "Each ticket is issued for entry to the listed event only. Entry is subject to venue rules, security checks, and event capacity controls.",
  },
  {
    title: "Payments",
    body:
      "Payments are processed by the configured gateway. Orders are treated as confirmed only after payment verification succeeds on our side.",
  },
  {
    title: "Refunds",
    body:
      "Tickets are treated as non-refundable unless the organizer explicitly announces a cancellation, reschedule, or exception for a specific event.",
  },
  {
    title: "Entry Verification",
    body:
      "Every issued ticket may contain a unique code or QR reference. Duplicate, altered, or invalidated tickets can be refused at entry.",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#09090b,_#050507)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
        <p className="eyebrow">Terms</p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
          Terms and Conditions
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/64">
          This placeholder terms page covers the main rules for ticket purchases until your final legal copy is ready.
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[26px] border border-white/10 bg-white/4 p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62 sm:text-base">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
