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

const INITIAL_COUNTDOWN_STATE: CountdownState = {
  days: "--",
  hours: "--",
  minutes: "--",
  seconds: "--",
};

function hasEventEnded() {
  const target = new Date(EVENT.startsAtIso).getTime();
  return Date.now() >= target;
}

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
  const [timeLeft, setTimeLeft] = useState<CountdownState>(INITIAL_COUNTDOWN_STATE);
  const [isEventOver, setIsEventOver] = useState(false);

  const tick = useEffectEvent(() => {
    const ended = hasEventEnded();

    setIsEventOver(ended);

    if (!ended) {
      setTimeLeft(getCountdownState());
    }
  });

  useEffect(() => {
    tick();

    if (isEventOver) {
      return;
    }

    const timer = window.setInterval(() => tick(), 1000);

    return () => window.clearInterval(timer);
  }, [isEventOver]);

  return (
    <section id="event" className="scroll-mt-28 pb-20 sm:scroll-mt-32 sm:pb-28">
      <div className="section-shell">
        <Reveal className="relative isolate py-4">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden -translate-y-1/2 text-center sm:block">
            <p className="font-display text-[2.8rem] font-semibold tracking-[-0.03em] text-white/7 sm:text-[4.4rem] lg:text-[5.8rem]">
              {EVENT.dateLabel}
            </p>
            <p className="font-display text-[2.2rem] font-semibold tracking-[0.18em] text-white/6 sm:text-[3.6rem] lg:text-[4.6rem]">
              {EVENT.timeLabel.replace(" ", "  ")}
            </p>
          </div>

          {isEventOver ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="glass-panel relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center rounded-[28px] px-6 py-8 text-center sm:px-10 sm:py-10"
            >
              <p className="eyebrow">Event Complete</p>
              <p className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                Fight Night has ended. See you next season.
              </p>
            </motion.div>
          ) : (
            <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-4 gap-2 sm:gap-4">
              {countdownItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="flex min-h-[5.75rem] flex-col items-center justify-center rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(36,36,40,0.92),rgba(24,24,28,0.9))] px-2 py-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] sm:min-h-[8.4rem] sm:rounded-[28px] sm:px-5 sm:py-6"
                >
                  <p className="font-display text-[1.7rem] font-semibold leading-none tracking-[-0.02em] text-white sm:text-5xl">
                    {timeLeft[item.key]}
                  </p>
                  <p className="mt-2 text-[0.54rem] uppercase tracking-[0.16em] text-white/48 sm:mt-2 sm:text-xs sm:tracking-[0.28em]">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
