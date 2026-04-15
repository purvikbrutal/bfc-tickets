import { ArrowRightIcon, MapPinIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT } from "@/lib/event";

export function VenueSection() {
  const hasMapEmbed = Boolean(EVENT.venueEmbedUrl);
  const hasDirections = Boolean(EVENT.venueDirectionsUrl);

  return (
    <section id="venue" className="pb-24 sm:pb-28">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <Reveal className="space-y-7">
          <SectionHeading eyebrow="Venue" title="Location details land here." description="Find us at Sri Sai Shivani Complex in Hyderabad." />

          <div className="glass-panel rounded-[34px] p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-3 text-rose-200">
                <MapPinIcon />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-white">{EVENT.venueName}</p>
                <p className="mt-3 max-w-lg text-base leading-7 text-white/58">{EVENT.venueAddress}</p>
              </div>
            </div>

            {hasDirections ? (
              <a
                href={EVENT.venueDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/84 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/7"
              >
                Get Directions
                <ArrowRightIcon className="size-4" />
              </a>
            ) : (
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-white/40">
                Get Directions
                <ArrowRightIcon className="size-4" />
              </span>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel overflow-hidden rounded-[38px] p-4 sm:p-5">
            {hasMapEmbed ? (
              <iframe
                title="Venue map"
                src={EVENT.venueEmbedUrl}
                loading="lazy"
                className="h-[420px] w-full rounded-[30px] border border-white/10"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="relative flex h-[420px] items-end overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_28%_24%,_rgba(180,31,50,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02)),_#0a0a0d] p-6">
                <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="relative z-10 max-w-sm space-y-3">
                  <span className="eyebrow">Map Placeholder</span>
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.05em] text-white">Google Maps block</h3>
                  <p className="text-base leading-7 text-white/58">{EVENT.venuePlaceholderNote}</p>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
