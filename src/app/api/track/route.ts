import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO page_views (path, referrer, user_agent)
      VALUES (${path}, ${referrer}, ${userAgent})
    `;
  } catch {
    // fire-and-forget: never surface errors to the client
  }

  return NextResponse.json({ ok: true });
}
