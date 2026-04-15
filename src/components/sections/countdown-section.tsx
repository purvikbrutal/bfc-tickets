"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { motion } from "framer-motion";

import { Reveal } from "@/components/shared/reveal";
import { EVENT } from "@/lib/event";

type CountdownState = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function getCountdownState(): CountdownState {
  const target = new Date(EVENT.startsAtIso).getTime();
  const now = Date.now();
  const remaining = Math.max(target - now, 0);

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

const countdownItems = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

export function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<CountdownState>(getCountdownState);

  const tick = useEffectEvent(() => {
    setTimeLeft(getCountdownState());
  });

  useEffect(() => {
    tick();
    const timer = window.setInterval(() => tick(), 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="pb-24 sm:pb-28">
      <div className="section-shell">
        <Reveal className="relative isolate px-2 py-4 sm:px-0">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 text-center">
            <p className="font-display text-[2.8rem] font-semibold tracking-[-0.08em] text-white/7 sm:text-[4.4rem] lg:text-[5.8rem]">
              {EVENT.dateLabel}
            </p>
            <p className="font-display text-[2.2rem] font-semibold tracking-[0.18em] text-white/6 sm:text-[3.6rem] lg:text-[4.6rem]">
              {EVENT.timeLabel.replace(" ", "  ")}
            </p>
          </div>

          <div className="relative z-10 mx-auto grid max-w-5xl gap-4 sm:grid-cols-4">
            {countdownItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(36,36,40,0.92),rgba(24,24,28,0.9))] px-5 py-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <p className="font-display text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl">
                  {timeLeft[item.key]}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/48">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
