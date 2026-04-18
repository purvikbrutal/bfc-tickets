import { ArrowRightIcon, MapPinIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT } from "@/lib/event";

export function VenueSection() {
  const hasMapEmbed = Boolean(EVENT.venueEmbedUrl);
  const hasDirections = Boolean(EVENT.venueDirectionsUrl);

  return (
    <section id="venue" className="scroll-mt-28 pb-24 sm:scroll-mt-32 sm:pb-28">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-10">
        <Reveal className="space-y-6 sm:space-y-7">
          <SectionHeading eyebrow="Venue" title="Venue" description="Find us at Sri Sai Shivani Complex in Hyderabad." />

          <div className="glass-panel rounded-[34px] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-2.5 text-rose-200 sm:rounded-[22px] sm:p-3">
                <MapPinIcon />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[1.55rem] font-semibold leading-[0.96] tracking-[-0.01em] text-white sm:text-2xl">
                  {EVENT.venueName}
                </p>
                <p className="mt-3 max-w-lg break-words text-sm leading-7 text-white/58 sm:text-base">{EVENT.venueAddress}</p>
              </div>
            </div>

            {hasDirections ? (
              <a
                href={EVENT.venueDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/84 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/7 sm:w-auto"
              >
                Get Directions
                <ArrowRightIcon className="size-4" />
              </a>
            ) : (
              <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-white/40 sm:w-auto">
                Get Directions
                <ArrowRightIcon className="size-4" />
              </span>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel overflow-hidden rounded-[34px] p-3 sm:rounded-[38px] sm:p-5">
            {hasMapEmbed ? (
              <iframe
                title="Venue map"
                src={EVENT.venueEmbedUrl}
                loading="lazy"
                className="h-[280px] w-full rounded-[24px] border border-white/10 sm:h-[420px] sm:rounded-[30px]"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="relative flex h-[280px] items-end overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_28%_24%,_rgba(180,31,50,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02)),_#0a0a0d] p-5 sm:h-[420px] sm:rounded-[30px] sm:p-6">
                <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="relative z-10 max-w-sm space-y-3">
                  <span className="eyebrow">Map Placeholder</span>
                  <h3 className="font-display text-[2rem] font-semibold tracking-[-0.01em] text-white sm:text-3xl">
                    Google Maps block
                  </h3>
                  <p className="text-sm leading-7 text-white/58 sm:text-base">{EVENT.venuePlaceholderNote}</p>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
