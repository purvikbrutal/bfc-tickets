import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60;

const ADMIN_SESSION_ALGORITHM = "HS256";

function getAdminSessionSecret() {
  const passcode = process.env.ADMIN_PASSCODE?.trim();

  if (!passcode) {
    throw new Error("ADMIN_PASSCODE is not set.");
  }

  return new TextEncoder().encode(passcode);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function createAdminSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ADMIN_SESSION_ALGORITHM, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getAdminSessionSecret());
}

export async function verifyAdminSessionToken(token: string | null | undefined) {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminSessionSecret(), {
      algorithms: [ADMIN_SESSION_ALGORITHM],
    });

    return payload.role === "admin";
  } catch {
    return false;
  }
}
