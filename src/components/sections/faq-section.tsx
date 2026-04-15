import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQS } from "@/lib/event";

export function FaqSection() {
  return (
    <section id="faq" className="pb-24 sm:pb-28">
      <div className="section-shell space-y-8">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="A few quick answers." align="center" />
        </Reveal>

        <div className="grid gap-3 sm:max-w-3xl sm:mx-auto">
          {FAQS.map((item, index) => (
            <Reveal key={item.question} delay={index * 0.04}>
              <details className="glass-panel group rounded-2xl px-6 py-5 sm:px-7 sm:py-6 backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
                <summary className="cursor-pointer list-none text-lg font-normal tracking-[-0.02em] text-white/85 marker:hidden hover:text-white transition-colors">
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-left">{item.question}</span>
                    <span className="flex-shrink-0 text-white/40 transition-all duration-300 group-open:rotate-45 group-open:text-white/70">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-5 text-base leading-7 text-white/55 font-light">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
