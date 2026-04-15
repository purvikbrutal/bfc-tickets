import { TicketIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT } from "@/lib/event";

export function TicketPricingSection() {
  return (
    <section id="tickets" className="pb-24 sm:pb-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Tickets"
            title="One price. Limited seats."
            description="Minimal pricing. Fast booking."
          />
        </Reveal>

        <Reveal>
          <div className="glass-panel ambient-ring rounded-[38px] p-8 sm:p-10">
            <span className="eyebrow mb-6">
              <TicketIcon className="size-4 text-rose-200" />
              {EVENT.dealLabel}
            </span>
            <p className="font-display text-5xl font-semibold tracking-[-0.07em] text-white sm:text-6xl">
              {EVENT.priceLabel}
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.28em] text-rose-200/72">{EVENT.discountLabel}</p>
            <a
              href="#booking"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92"
            >
              Secure My Seat
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
