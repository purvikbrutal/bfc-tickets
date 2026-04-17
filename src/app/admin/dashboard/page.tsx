import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { TicketSearch } from "@/app/admin/components/ticket-search";

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
  if (store.get("admin_session")?.value !== "1") {
    redirect("/admin");
  }

  const sql = getDb();

  const [bookingsResult, ticketsResult, viewsResult, recentBookings] = await Promise.all([
    sql<BookingStatsRow[]>`
      SELECT
        count(*)::text AS total_bookings,
        count(*) FILTER (WHERE status = 'confirmed')::text AS confirmed_bookings,
        count(*) FILTER (WHERE status != 'confirmed')::text AS pending_bookings,
        coalesce(sum(amount_paise) FILTER (WHERE status = 'confirmed'), 0)::text AS total_revenue_paise
      FROM bookings
    `,
    sql<TicketStatsRow[]>`
      SELECT count(*)::text AS ticket_count FROM tickets
    `,
    sql<ViewStatsRow[]>`
      SELECT
        count(*)::text AS total_views,
        count(DISTINCT path)::text AS unique_paths,
        count(*) FILTER (WHERE created_at >= current_date)::text AS today_views,
        count(*) FILTER (
          WHERE created_at >= current_date - interval '1 day'
            AND created_at < current_date
        )::text AS yesterday_views
      FROM page_views
    `,
    sql<RecentBookingRow[]>`
      SELECT booking_id, full_name, email, phone, quantity, amount_paise, status, created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ]);

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
    store.set("admin_session", "", { maxAge: 0, path: "/" });
    redirect("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">BFC Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Fight Night — Live Stats</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Ticket Lookup */}
        <TicketSearch />

        {/* Tickets Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Tickets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={bStats.total_bookings} />
            <StatCard label="Paid / Confirmed" value={bStats.confirmed_bookings} highlight />
            <StatCard label="Pending / Failed" value={bStats.pending_bookings} />
            <StatCard label="Total Revenue" value={formatRupees(bStats.total_revenue_paise)} highlight />
            <StatCard label="Tickets Generated" value={tStats.ticket_count} />
          </div>
        </section>

        {/* Visitors Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Visitors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Page Views" value={vStats.total_views} />
            <StatCard label="Unique Paths" value={vStats.unique_paths} />
            <StatCard label="Today" value={vStats.today_views} highlight />
            <StatCard label="Yesterday" value={vStats.yesterday_views} />
          </div>
        </section>

        {/* Recent Bookings */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Recent Bookings
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Booking ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
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
                  <tr key={i} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {booking.booking_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">{booking.full_name}</td>
                    <td className="px-4 py-3 text-gray-300">{booking.email}</td>
                    <td className="px-4 py-3 text-gray-300">{booking.phone}</td>
                    <td className="px-4 py-3 text-right">{booking.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatRupees(booking.amount_paise)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-900/60 text-green-300"
                            : "bg-yellow-900/60 text-yellow-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : "text-gray-200"}`}>
        {value}
      </p>
    </div>
  );
}
