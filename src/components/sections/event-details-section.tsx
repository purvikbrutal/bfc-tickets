import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT_DETAILS } from "@/lib/event";

export function EventDetailsSection() {
  return (
    <section id="event" className="pb-24 sm:pb-28">
      <div className="section-shell space-y-8">
        <Reveal>
          <SectionHeading eyebrow="Event" title="Everything essential, kept compact." align="center" />
        </Reveal>

        <Reveal>
          <div className="glass-panel rounded-[34px] px-6 py-6 sm:px-8 sm:py-7">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {EVENT_DETAILS.map((detail) => (
                <div key={detail.label} className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-white/38">{detail.label}</p>
                  <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-white">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
