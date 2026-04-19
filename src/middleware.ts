import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/server/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const hasValidSession = await verifyAdminSessionToken(sessionToken);

  if (!hasValidSession) {
    if (pathname.startsWith("/api/admin/")) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
