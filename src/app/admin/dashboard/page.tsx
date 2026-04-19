import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { TicketSearch } from "@/app/admin/components/ticket-search";
import { getDb } from "@/lib/db";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/server/admin-session";

type BookingStatsRow = {
  total_bookings: string;
  confirmed_bookings: string;
  pending_bookings: string;
  total_revenue_paise: string;
};

type TicketStatsRow = {
  ticket_count: string;
};

type ViewStatsRow = {
  total_views: string;
  unique_paths: string;
  today_views: string;
  yesterday_views: string;
};

type RecentBookingRow = {
  booking_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  quantity: number;
  amount_paise: number;
  status: string;
  created_at: Date;
};

function formatRupees(paise: number | string) {
  const amount = Number(paise) / 100;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const store = await cookies();
  const hasValidSession = await verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE_NAME)?.value);

  if (!hasValidSession) {
    redirect("/admin");
  }

  const sql = getDb();

  // Keep admin stats queries sequential because the shared postgres client is configured
  // with a single connection in this app. Concurrent dashboard queries can stall/crash.
  const bookingsResult = await sql<BookingStatsRow[]>`
    SELECT
      count(*)::text AS total_bookings,
      count(*) FILTER (WHERE status = 'confirmed')::text AS confirmed_bookings,
      count(*) FILTER (WHERE status != 'confirmed')::text AS pending_bookings,
      coalesce(sum(amount_paise) FILTER (WHERE status = 'confirmed'), 0)::text AS total_revenue_paise
    FROM bookings
  `;

  const ticketsResult = await sql<TicketStatsRow[]>`
    SELECT count(*)::text AS ticket_count FROM tickets
  `;

  const viewsResult = await sql<ViewStatsRow[]>`
    SELECT
      count(*)::text AS total_views,
      count(DISTINCT path)::text AS unique_paths,
      count(*) FILTER (WHERE created_at >= current_date)::text AS today_views,
      count(*) FILTER (
        WHERE created_at >= current_date - interval '1 day'
          AND created_at < current_date
      )::text AS yesterday_views
    FROM page_views
  `;

  const recentBookings = await sql<RecentBookingRow[]>`
    SELECT booking_id, full_name, email, phone, quantity, amount_paise, status, created_at
    FROM bookings
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const bStats = bookingsResult[0] ?? {
    total_bookings: "0",
    confirmed_bookings: "0",
    pending_bookings: "0",
    total_revenue_paise: "0",
  };
  const tStats = ticketsResult[0] ?? { ticket_count: "0" };
  const vStats = viewsResult[0] ?? {
    total_views: "0",
    unique_paths: "0",
    today_views: "0",
    yesterday_views: "0",
  };

  const logoutAction = async () => {
    "use server";
    const store = await cookies();
    store.delete(ADMIN_SESSION_COOKIE_NAME);
    redirect("/admin");
  };

  return (
    <div className="min-h-dvh bg-gray-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">BFC Admin</h1>
            <p className="mt-1 text-sm text-gray-400">Fight Night - Live Stats</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
            >
              Logout
            </button>
          </form>
        </div>

        <TicketSearch />

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Tickets
          </h2>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Bookings" value={bStats.total_bookings} />
            <StatCard label="Paid / Confirmed" value={bStats.confirmed_bookings} highlight />
            <StatCard label="Pending / Failed" value={bStats.pending_bookings} />
            <StatCard label="Total Revenue" value={formatRupees(bStats.total_revenue_paise)} highlight />
            <StatCard label="Tickets Generated" value={tStats.ticket_count} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Visitors
          </h2>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Page Views" value={vStats.total_views} />
            <StatCard label="Unique Paths" value={vStats.unique_paths} />
            <StatCard label="Today" value={vStats.today_views} highlight />
            <StatCard label="Yesterday" value={vStats.yesterday_views} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recent Bookings
          </h2>
          <div className="space-y-3 md:hidden">
            {recentBookings.length === 0 && (
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-8 text-center text-gray-500">
                No bookings yet
              </div>
            )}
            {recentBookings.map((booking, i) => (
              <article key={i} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Booking ID</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-300">
                      {booking.booking_id ?? "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-900/60 text-green-300"
                        : "bg-yellow-900/60 text-yellow-300"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-white">{booking.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="break-words text-gray-300">{booking.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-300">{booking.phone}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Qty</p>
                      <p className="text-white">{booking.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-white">{formatRupees(booking.amount_paise)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-xs text-gray-400">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-800 md:block">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-left text-gray-400">
                  <th className="px-4 py-3 font-medium">Booking ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No bookings yet
                    </td>
                  </tr>
                )}
                {recentBookings.map((booking, i) => (
                  <tr key={i} className="transition-colors hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {booking.booking_id ?? "-"}
                    </td>
                    <td className="px-4 py-3">{booking.full_name}</td>
                    <td className="px-4 py-3 text-gray-300">{booking.email}</td>
                    <td className="px-4 py-3 text-gray-300">{booking.phone}</td>
                    <td className="px-4 py-3 text-right">{booking.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatRupees(booking.amount_paise)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-900/60 text-green-300"
                            : "bg-yellow-900/60 text-yellow-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                      {formatDate(booking.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold sm:text-2xl ${highlight ? "text-white" : "text-gray-200"}`}>
        {value}
      </p>
    </div>
  );
}
