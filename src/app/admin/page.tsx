import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/server/admin-session";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; retryAfter?: string }>;
}) {
  const store = await cookies();
  const hasValidSession = await verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE_NAME)?.value);

  if (hasValidSession) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const retryAfterSeconds = Number(params.retryAfter ?? 0);
  const retryAfterMinutes =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? Math.ceil(retryAfterSeconds / 60) : null;
  const errorMessage =
    params.error === "rate-limit"
      ? `Too many login attempts. Try again in ${retryAfterMinutes ?? 15} minute${retryAfterMinutes === 1 ? "" : "s"}.`
      : params.error === "invalid-passcode"
        ? "Invalid passcode. Try again."
        : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-950 px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-gray-800 bg-gray-900 p-6 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-white">Admin</h1>
        <p className="mb-6 text-sm text-gray-400">Brutal Fight Club - Internal Dashboard</p>
        <form action="/api/admin/login" method="post" className="space-y-4">
          <div>
            <label htmlFor="passcode" className="mb-1 block text-sm font-medium text-gray-300">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              autoFocus
              required
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
              placeholder="Enter passcode"
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full rounded bg-white px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-200"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
