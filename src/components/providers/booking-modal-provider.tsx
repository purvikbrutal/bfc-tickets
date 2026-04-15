"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { BookingForm } from "@/components/sections/booking-form";
import { CloseIcon } from "@/components/shared/icons";
import { EVENT } from "@/lib/event";

type BookingModalContextValue = {
  isOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      openBooking: () => setIsOpen(true),
      closeBooking: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <BookingModalContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/72 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <div className="fixed inset-0 z-[71] overflow-y-auto px-3 pb-6 pt-22 sm:px-6 sm:pt-28">
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 22, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-layer-title"
                className="glass-panel relative mx-auto w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)),rgba(11,11,14,0.96)] p-6 sm:p-8 lg:p-10"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(180,31,50,0.18),_transparent_38%)]" />

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-5 top-5 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/76 hover:border-white/16 hover:bg-white/10 hover:text-white"
                  aria-label="Close booking layer"
                >
                  <CloseIcon className="size-4" />
                </button>

                <div className="relative z-10">
                  <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-xl">
                      <span className="eyebrow">Booking</span>
                      <h2
                        id="booking-layer-title"
                        className="mt-4 font-display text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl"
                      >
                        Book now. Save {EVENT.discountLabel}.
                      </h2>
                      <p className="mt-4 max-w-lg text-base leading-7 text-white/62 sm:text-lg">
                        Secure your seat for {EVENT.name} at {EVENT.priceLabel}. Checkout, ticket delivery, and confirmations
                        plug in next.
                      </p>
                    </div>

                    <div className="rounded-[26px] border border-rose-300/16 bg-rose-400/10 px-5 py-4 text-left sm:min-w-[12rem] sm:text-right">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-rose-100/70">{EVENT.discountLabel}</p>
                      <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.06em] text-white">
                        {EVENT.priceLabel}
                      </p>
                    </div>
                  </div>

                  <BookingForm onClose={() => setIsOpen(false)} />
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);

  if (!context) {
    throw new Error("useBookingModal must be used inside BookingModalProvider.");
  }

  return context;
}
