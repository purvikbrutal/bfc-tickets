"use client";

import { useState } from "react";

type LookupResult =
  | { found: false }
  | {
      found: true;
      ticket: {
        code: string;
        attendeeName: string;
        bookingId: string;
        fullName: string;
        email: string;
        phone: string;
        quantity: number;
        amountPaise: number;
        status: string;
        orderId: string;
        paymentId: string | null;
        confirmedAt: string | null;
        bookingCreatedAt: string;
      };
    };

function formatRupees(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketSearch() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = code.trim().toUpperCase();

    if (!query) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/lookup?code=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Lookup failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const isPaid = result?.found && result.ticket.status === "confirmed";

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Ticket Lookup
      </h2>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="Enter 6-char code e.g. BFC4X9"
          maxLength={6}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm uppercase text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {result !== null && !result.found && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">
            No ticket found for code <span className="font-mono text-white">{code}</span>.
          </p>
        </div>
      )}

      {result?.found && (
        <div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs text-gray-500">Ticket Code</p>
              <p className="font-mono text-xl font-bold tracking-[0.28em] text-white sm:text-2xl">
                {result.ticket.code}
              </p>
            </div>
            <div className="sm:text-right">
              {isPaid ? (
                <span className="inline-block rounded bg-green-900/60 px-3 py-1.5 text-sm font-bold tracking-wide text-green-300">
                  PAID
                </span>
              ) : (
                <span className="inline-block rounded bg-red-900/60 px-3 py-1.5 text-sm font-bold tracking-wide text-red-300">
                  UNPAID
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium text-white">{result.ticket.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Attendee</p>
              <p className="font-medium text-white">{result.ticket.attendeeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="break-words text-gray-300">{result.ticket.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-gray-300">{result.ticket.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="font-medium text-white">{formatRupees(result.ticket.amountPaise)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booking ID</p>
              <p className="break-all font-mono text-xs text-gray-300">{result.ticket.bookingId ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booked At</p>
              <p className="text-xs text-gray-300">{formatDate(result.ticket.bookingCreatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Confirmed At</p>
              <p className="text-xs text-gray-300">{formatDate(result.ticket.confirmedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
