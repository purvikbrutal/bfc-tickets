"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

import { useBookingModal } from "@/components/providers/booking-modal-provider";
import { CloseIcon, MenuIcon } from "@/components/shared/icons";
import { Logo } from "@/components/shared/logo";
import { NAV_LINKS } from "@/lib/event";
import { cn } from "@/lib/utils";

export function StickyNavbar() {
  const { scrollY } = useScroll();
  const { openBooking } = useBookingModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsScrolled(value > 24);
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3">
      <div
        className={cn(
          "section-shell glass-panel rounded-[28px] px-4 py-3 sm:px-6",
          isScrolled ? "border-white/14 bg-black/70" : "border-white/8 bg-black/24",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="#home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="premium-link text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openBooking}
              className="hidden rounded-full border border-white/12 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-white/90 sm:inline-flex"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden lg:hidden"
            >
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-white/78 hover:bg-white/6 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="mt-2 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
                  onClick={() => {
                    setIsOpen(false);
                    openBooking();
                  }}
                >
                  Book Now
                </button>
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
