import Image from "next/image";

import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT } from "@/lib/event";

const galleryMarqueeItems = [...EVENT.galleryImages, ...EVENT.galleryImages];

export function PhotoGallerySection() {
  return (
    <section id="gallery" className="scroll-mt-28 overflow-hidden pb-24 sm:scroll-mt-32 sm:pb-28">
      <div className="section-shell space-y-6 sm:space-y-8">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title="Experience the aura of a real fight at BFC."
            description={EVENT.galleryQuote}
            descriptionClassName="mx-auto max-w-2xl italic text-white/54"
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        <Reveal className="relative sm:hidden overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-[linear-gradient(90deg,#050507,transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-[linear-gradient(270deg,#050507,transparent)]" />
          <div className="gallery-marquee relative z-10">
            <div className="gallery-track" style={{ '--gallery-gap': '1rem', display: 'flex', width: 'max-content', gap: '1rem', paddingLeft: '1rem', paddingRight: '1rem', animation: 'gallery-marquee-right 34s linear infinite' } as React.CSSProperties}>
              {[...EVENT.galleryImages, ...EVENT.galleryImages].map((src, index) => (
                <article
                  key={`${src}-${index}`}
                  className="group relative aspect-[0.84] flex-none w-[76vw] overflow-hidden rounded-[30px] border border-white/8 bg-black/30"
                  style={{ minWidth: 'calc(76vw + 1rem)' }}
                >
                  <Image
                    src={src}
                    alt={`BFC fight-night gallery image ${((index % EVENT.galleryImages.length) + 1).toString().padStart(2, "0")}`}
                    width={360}
                    height={430}
                    priority={index === 0}
                    sizes="(max-width: 639px) 76vw, 26rem"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="relative left-1/2 mt-8 hidden w-screen -translate-x-1/2 overflow-hidden py-4 sm:block sm:mt-12 sm:py-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-[linear-gradient(90deg,#050507,transparent)] sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-[linear-gradient(270deg,#050507,transparent)] sm:w-28" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(180,31,50,0.12),_transparent_42%)]" />

        <div className="gallery-marquee relative z-10">
          <div className="gallery-track">
            {galleryMarqueeItems.map((src, index) => (
              <article
                key={`${src}-${index}`}
                className="gallery-card group relative flex-none overflow-hidden rounded-[30px] border border-white/8 bg-black/30"
                aria-hidden={index >= EVENT.galleryImages.length}
              >
                <Image
                  src={src}
                  alt={`BFC fight-night gallery image ${((index % EVENT.galleryImages.length) + 1).toString().padStart(2, "0")}`}
                  width={520}
                  height={620}
                  priority={index === 0}
                  sizes="(max-width: 639px) 76vw, 26rem"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24))]" />
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
