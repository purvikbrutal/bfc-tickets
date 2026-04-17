"use client";

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";

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
  attendeeNames: string[];
};

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  quantity: 1,
  attendeeNames: [""],
};

type SubmissionPhase = "idle" | "creating-order" | "opening-checkout" | "verifying";

type OrderResponse = {
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
};

type VerifyResponse = {
  success?: boolean;
  ticketPageUrl?: string;
  error?: string;
};

const TEST_COUPON_CODE = "BFCTEST";

// Razorpay checkout.js must be loaded globally, ideally in src/app/layout.tsx:
// <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
export function BookingForm({ onClose }: BookingFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "applied" | "error">("idle");

  const deferredQuantity = useDeferredValue(formState.quantity);
  const totalLabel = formatRupees(appliedCouponCode === TEST_COUPON_CODE ? 2 : EVENT.price * deferredQuantity);
  const isBusy = submissionPhase !== "idle";
  const statusMessage =
    submissionPhase === "creating-order"
      ? "Creating your Razorpay order..."
      : submissionPhase === "opening-checkout"
        ? "Opening secure checkout..."
        : submissionPhase === "verifying"
          ? "Verifying payment and preparing your ticket..."
          : null;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function resizeAttendeeNames(attendeeNames: string[], quantity: number) {
    return Array.from({ length: quantity }, (_, index) => attendeeNames[index] ?? "");
  }

  function updateQuantity(quantity: number) {
    setFormState((current) => ({
      ...current,
      quantity,
      attendeeNames: resizeAttendeeNames(current.attendeeNames, quantity),
    }));
  }

  function updateAttendeeName(index: number, value: string) {
    setFormState((current) => {
      const attendeeNames = resizeAttendeeNames(current.attendeeNames, current.quantity);
      attendeeNames[index] = value;

      return {
        ...current,
        attendeeNames,
      };
    });
  }

  function handleApplyCoupon() {
    const normalizedCouponCode = couponInput.trim().toUpperCase();

    if (normalizedCouponCode === TEST_COUPON_CODE) {
      setCouponInput(normalizedCouponCode);
      setAppliedCouponCode(TEST_COUPON_CODE);
      setCouponStatus("applied");
      setCouponMessage("✅ Test discount applied");
      return;
    }

    setAppliedCouponCode(null);
    setCouponStatus("error");
    setCouponMessage("Invalid code");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      setErrorMessage(
        "Razorpay checkout.js is not loaded. Add the script tag to src/app/layout.tsx before using this form.",
      );
      return;
    }

    setSubmissionPhase("creating-order");

    try {
      const orderResponse = await fetch("/api/payments/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          couponCode: appliedCouponCode,
        }),
      });

      const orderData = (await orderResponse.json().catch(() => null)) as OrderResponse | null;

      if (!orderResponse.ok || !orderData?.orderId || !orderData.currency) {
        throw new Error(orderData?.error ?? "Unable to create Razorpay order.");
      }

      setSubmissionPhase("opening-checkout");

      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: orderData.amount ?? EVENT.price * formState.quantity * 100,
        currency: orderData.currency,
        name: EVENT.brand,
        description: `${EVENT.name} ticket booking`,
        order_id: orderData.orderId,
        prefill: {
          name: formState.fullName,
          email: formState.email,
          contact: formState.phone,
        },
        notes: {
          event: EVENT.name,
          email: formState.email,
          phone: formState.phone,
          quantity: String(formState.quantity),
        },
        theme: {
          color: "#b41f32",
        },
        modal: {
          ondismiss: () => {
            setSubmissionPhase("idle");
            setErrorMessage(null);
          },
        },
        handler: async (response) => {
          setSubmissionPhase("verifying");
          setErrorMessage(null);

          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = (await verifyResponse.json().catch(() => null)) as VerifyResponse | null;

            if (!verifyResponse.ok || !verifyData?.success || !verifyData.ticketPageUrl) {
              throw new Error(verifyData?.error ?? "Payment succeeded, but ticket verification failed.");
            }

            const ticketUrl = new URL(verifyData.ticketPageUrl, window.location.href);
            router.replace(`${ticketUrl.pathname}${ticketUrl.search}${ticketUrl.hash}`);
          } catch (verifyError) {
            setSubmissionPhase("idle");
            setErrorMessage(verifyError instanceof Error ? verifyError.message : "Unable to verify payment.");
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setSubmissionPhase("idle");
        setErrorMessage(
          response.error?.description ??
            response.error?.reason ??
            "Payment failed. Please try again.",
        );
      });

      checkout.open();
    } catch (submitError) {
      setSubmissionPhase("idle");
      setErrorMessage(submitError instanceof Error ? submitError.message : "Unable to start checkout.");
    }
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
            disabled={isBusy}
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
            disabled={isBusy}
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
            disabled={isBusy}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="space-y-2.5">
          <span className="text-sm font-medium text-white/74">Ticket Quantity</span>
          <select
            value={String(formState.quantity)}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            disabled={isBusy}
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

      <div className="space-y-2.5">
        <span className="text-sm font-medium text-white/74">Coupon Code</span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={couponInput}
            onChange={(event) => {
              setCouponInput(event.target.value.toUpperCase());
              setAppliedCouponCode(null);
              if (couponStatus !== "idle") {
                setCouponStatus("idle");
                setCouponMessage(null);
              }
            }}
            disabled={isBusy}
            className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
            placeholder="Enter coupon code"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white/86 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply
          </button>
        </div>

        {couponMessage ? (
          <p
            className={
              couponStatus === "applied"
                ? "text-xs leading-6 text-emerald-200/88"
                : "text-xs leading-6 text-rose-100/88"
            }
          >
            {couponMessage}
          </p>
        ) : null}
      </div>

      <div className="rounded-[26px] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/74">Attendee Names</p>
            <p className="mt-1 text-xs leading-6 text-white/42">
              Optional. Add the name for each seat now, or leave blank and we&apos;ll use the buyer name as the default.
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
            {formState.quantity} ticket{formState.quantity > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {formState.attendeeNames.map((attendeeName, index) => (
            <label key={index} className="space-y-2.5">
              <span className="text-sm font-medium text-white/74">
                {formState.quantity > 1 ? `Ticket ${index + 1} Attendee` : "Attendee Name"}
              </span>
              <input
                value={attendeeName}
                onChange={(event) => updateAttendeeName(index, event.target.value)}
                disabled={isBusy}
                className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-white/22 focus:border-rose-200/34 focus:bg-white/[0.07]"
                placeholder={index === 0 ? "Optional attendee name" : `Optional attendee ${index + 1} name`}
              />
            </label>
          ))}
        </div>
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
        disabled={isBusy}
        className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-black hover:-translate-y-0.5 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-72"
      >
        {submissionPhase === "creating-order"
          ? "Creating Razorpay order..."
          : submissionPhase === "opening-checkout"
            ? "Open checkout to pay"
            : submissionPhase === "verifying"
              ? "Verifying payment..."
              : "Reserve My Seat"}
      </button>

      <div aria-live="polite" className="space-y-2 text-center">
        {errorMessage ? (
          <p className="rounded-full border border-rose-300/16 bg-rose-400/[0.08] px-4 py-3 text-xs leading-6 text-rose-100/88">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-xs uppercase tracking-[0.22em] text-white/28">
          Secure payment opens in Razorpay, then your ticket page is delivered after successful verification.
        </p>

        {statusMessage ? <p className="text-xs text-white/54">{statusMessage}</p> : null}

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white/86 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        ) : null}
      </div>
    </form>
  );
}
