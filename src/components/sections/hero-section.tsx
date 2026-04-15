"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useBookingModal } from "@/components/providers/booking-modal-provider";
import { ArrowRightIcon } from "@/components/shared/icons";
import { EVENT } from "@/lib/event";

const heroMeta = [
  { label: "Date & Time", value: `${EVENT.dateLabel} / ${EVENT.timeLabel}` },
] as const;

export function HeroSection() {
  const { openBooking } = useBookingModal();

  return (
    <section
      id="home"
      className="noise-overlay relative overflow-hidden pb-28 pt-34 sm:pb-36 sm:pt-42 lg:pb-44 lg:pt-52"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,_#060608_0%,_#070709_38%,_#09080a_64%,_#050507_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_24%,_rgba(180,31,50,0.24),_transparent_28%),radial-gradient(circle_at_50%_44%,_rgba(180,31,50,0.12),_transparent_38%)]" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(180,31,50,0.26),_transparent_66%)] blur-3xl"
        animate={{ opacity: [0.5, 0.72, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[18%] top-[18%] -z-10 h-32 rounded-full bg-[linear-gradient(90deg,_transparent,_rgba(255,255,255,0.08),_transparent)] blur-3xl"
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="section-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <div className="space-y-6 sm:space-y-7">
            <h1 className="font-display text-balance text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl lg:text-[5.5rem] lg:leading-[0.92]">
              <span className="block text-[0.6em] font-medium tracking-[-0.06em] text-white/78 sm:text-[0.56em]">
                Brutal Fight Club presents
              </span>
              <span className="mt-3 block">
                Fight Night
              </span>
            </h1>

            <div className="mx-auto max-w-3xl space-y-3">
              <p className="text-balance text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                in collaboration with {EVENT.collaboration}
              </p>
              <div className="inline-flex items-center justify-center rounded-full border border-rose-300/16 bg-rose-400/10 px-4 py-2 text-sm font-medium tracking-[0.02em] text-rose-100/88 shadow-[0_12px_40px_rgba(120,20,34,0.18)]">
                <span className="text-white/68">brought to you by</span>
                <span className="mx-2 h-3.5 w-px bg-white/12" aria-hidden="true" />
                <span className="font-semibold text-white">{EVENT.presentedBy}</span>
              </div>
            </div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row"
          >
            <button
              type="button"
              onClick={openBooking}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:bg-white/92"
            >
              Book Tickets
              <ArrowRightIcon className="size-4" />
            </button>
            <Link
              href="#venue"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/84 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/8"
            >
              View Details
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 sm:mt-14"
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
                {heroMeta.map((item, index) => (
                  <div key={item.label} className="flex items-center sm:contents">
                    <div className="px-3 sm:px-6">
                      <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/32">
                        {item.label}
                      </p>
                      <p className="mt-2 font-display text-sm font-medium tracking-[0.26em] text-white/74 sm:text-[0.95rem]">
                        {item.value}
                      </p>
                    </div>
                    {index < heroMeta.length - 1 ? (
                      <span
                        className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/14 to-transparent sm:block"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
