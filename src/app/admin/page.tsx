import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function handleLogin(formData: FormData) {
  "use server";
  const passcode = formData.get("passcode") as string;
  if (passcode && passcode === process.env.ADMIN_PASSCODE) {
    const store = await cookies();
    store.set("admin_session", "1", {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });
    redirect("/admin/dashboard");
  }
  redirect("/admin?error=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const store = await cookies();
  if (store.get("admin_session")?.value === "1") {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const hasError = !!params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-lg border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">Admin</h1>
        <p className="text-gray-400 text-sm mb-6">Brutal Fight Club — Internal Dashboard</p>
        <form action={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-300 mb-1">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              autoFocus
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              placeholder="Enter passcode"
            />
          </div>
          {hasError && (
            <p className="text-red-400 text-sm">Invalid passcode. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-white text-gray-900 font-semibold rounded hover:bg-gray-200 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
