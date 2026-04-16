"use client";

import { useBookingModal } from "@/components/providers/booking-modal-provider";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { EVENT } from "@/lib/event";

export function BookingSection() {
  const { openBooking } = useBookingModal();

  return (
    <section id="booking" className="scroll-mt-28 pb-24 sm:scroll-mt-32 sm:pb-28">
      <div className="section-shell">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <SectionHeading
            eyebrow="Booking"
            title={`Book now and get ${EVENT.discountLabel}.`}
            description={`Limited seats for ${EVENT.name} at ${EVENT.priceLabel}.`}
            align="center"
            className="max-w-3xl"
          />

          <div className="mt-8 sm:mt-10">
            <button
              type="button"
              onClick={openBooking}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:bg-white/92"
            >
              Book Now
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
