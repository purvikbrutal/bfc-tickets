import { getDb } from "@/lib/db";

// Omits 0/O and 1/I to avoid visual confusion at entry
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function rawTicketCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function generateUniqueTicketCode(): Promise<string> {
  const sql = getDb();
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = rawTicketCode();
    const [existing] = await sql`
      SELECT 1 FROM tickets WHERE ticket_code = ${code} LIMIT 1
    `;
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique ticket code after 10 attempts.");
}
