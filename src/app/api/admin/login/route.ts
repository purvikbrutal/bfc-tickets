import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/server/admin-session";
import { getRateLimitResult } from "@/lib/server/rate-limit";

function redirectToAdmin(request: Request, searchParams?: Record<string, string>) {
  const url = new URL("/admin", request.url);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function passcodesMatch(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const rateLimitResult = await getRateLimitResult(request, "admin-login", {
    requests: 5,
    window: "15 m",
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.redirect(
      redirectToAdmin(request, {
        error: "rate-limit",
        retryAfter: String(rateLimitResult.retryAfterSeconds),
      }),
      {
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
        status: 303,
      },
    );
  }

  const expectedPasscode = process.env.ADMIN_PASSCODE?.trim();

  if (!expectedPasscode) {
    throw new Error("ADMIN_PASSCODE is not set.");
  }

  const formData = await request.formData();
  const passcodeValue = formData.get("passcode");
  const passcode = typeof passcodeValue === "string" ? passcodeValue : "";

  if (!passcodesMatch(passcode, expectedPasscode)) {
    return NextResponse.redirect(redirectToAdmin(request, { error: "invalid-passcode" }), {
      status: 303,
    });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url), { status: 303 });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, adminSessionCookieOptions);

  return response;
}
