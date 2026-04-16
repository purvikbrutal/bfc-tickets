import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQS } from "@/lib/event";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-28 pb-24 sm:scroll-mt-32 sm:pb-28">
      <div className="section-shell space-y-7 sm:space-y-8">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="A few quick answers." align="center" />
        </Reveal>

        <div className="grid gap-3 sm:mx-auto sm:max-w-3xl">
          {FAQS.map((item, index) => (
            <Reveal key={item.question} delay={index * 0.04}>
              <details className="glass-panel group rounded-2xl px-5 py-4 sm:px-7 sm:py-6 backdrop-blur-sm transition-colors hover:bg-white/[0.03]">
                <summary className="cursor-pointer list-none text-base font-normal tracking-[-0.02em] text-white/85 transition-colors marker:hidden hover:text-white sm:text-lg">
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-left">{item.question}</span>
                    <span className="flex-shrink-0 text-white/40 transition-all duration-300 group-open:rotate-45 group-open:text-white/70">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm font-light leading-7 text-white/55 sm:mt-5 sm:text-base">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
