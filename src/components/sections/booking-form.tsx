"use client";

import { useDeferredValue, useState } from "react";

import { CheckCircleIcon } from "@/components/shared/icons";
import { EVENT } from "@/lib/event";
import { formatRupees } from "@/lib/utils";

type BookingFormProps = {
  onClose?: () => void;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  quantity: number;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  quantity: 1,
};

export function BookingForm({ onClose }: BookingFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const deferredQuantity = useDeferredValue(formState.quantity);
  const totalLabel = formatRupees(EVENT.price * deferredQuantity);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function reopenForm() {
    setIsComplete(false);
    setIsSubmitting(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
    }, 650);
  }

  if (isComplete) {
    return (
      <div className="rounded-[30px] border border-emerald-300/14 bg-emerald-400/[0.06] p-6 sm:p-7">
        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/14 bg-emerald-300/[0.08] px-4 py-2 text-sm font-medium text-emerald-100/88">
          <CheckCircleIcon className="size-4" />
          Details captured
        </div>

        <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.2rem]">
          Your booking flow is ready.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
          We have the UI in place for {formState.fullName || "your"} seat request. Payment, booking ID, and ticket
          delivery will plug into this next.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/34">Email</p>
            <p className="mt-2 text-sm text-white/80 sm:text-base">{formState.email}</p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/34">Tickets</p>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              {formState.quantity} seat{formState.quantity > 1 ? "s" : ""} / {totalLabel}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reopenForm}
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white/86 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/10"
          >
            Edit Details
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2.5">
          <span className="text-sm font-medium text-white/74">Full Name</span>
          <input
            required
            value={formState.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
            placeholder="Enter your full name"
          />
        </label>

        <label className="space-y-2.5">
          <span className="text-sm font-medium text-white/74">Email</span>
          <input
            required
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2.5">
          <span className="text-sm font-medium text-white/74">Phone Number</span>
          <input
            required
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="space-y-2.5">
          <span className="text-sm font-medium text-white/74">Ticket Quantity</span>
          <select
            value={String(formState.quantity)}
            onChange={(event) => updateField("quantity", Number(event.target.value))}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none focus:border-rose-200/34 focus:bg-white/[0.07]"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value} className="bg-[#0b0b0f]">
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-4 rounded-[26px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/34">Offer live</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
            {EVENT.priceLabel}
            <span className="ml-3 align-middle text-sm font-medium uppercase tracking-[0.24em] text-rose-100/68">
              {EVENT.discountLabel}
            </span>
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/34">Estimated total</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em] text-white">{totalLabel}</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-72"
      >
        {isSubmitting ? "Saving details..." : "Reserve My Seat"}
      </button>

      <p className="text-center text-xs uppercase tracking-[0.22em] text-white/28">
        Payment, booking ID, PDF ticket, email, and WhatsApp connect next.
      </p>
    </form>
  );
}
