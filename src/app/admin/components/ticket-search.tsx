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
  if (!value) return "—";
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

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="Enter 6-char code e.g. BFC4X9"
          maxLength={6}
          className="flex-1 max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 font-mono text-sm uppercase"
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="px-4 py-2 bg-white text-gray-900 font-semibold rounded text-sm hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result !== null && !result.found && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">No ticket found for code <span className="font-mono text-white">{code}</span>.</p>
        </div>
      )}

      {result?.found && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Ticket Code</p>
              <p className="font-mono text-2xl font-bold text-white tracking-widest">{result.ticket.code}</p>
            </div>
            <div className="text-right">
              {isPaid ? (
                <span className="inline-block px-3 py-1.5 rounded bg-green-900/60 text-green-300 font-bold text-sm tracking-wide">
                  ✅ PAID
                </span>
              ) : (
                <span className="inline-block px-3 py-1.5 rounded bg-red-900/60 text-red-300 font-bold text-sm tracking-wide">
                  ❌ UNPAID
                </span>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-white font-medium">{result.ticket.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Attendee</p>
              <p className="text-white font-medium">{result.ticket.attendeeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-300">{result.ticket.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-gray-300">{result.ticket.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-white font-medium">{formatRupees(result.ticket.amountPaise)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booking ID</p>
              <p className="font-mono text-gray-300 text-xs">{result.ticket.bookingId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booked At</p>
              <p className="text-gray-300 text-xs">{formatDate(result.ticket.bookingCreatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Confirmed At</p>
              <p className="text-gray-300 text-xs">{formatDate(result.ticket.confirmedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
