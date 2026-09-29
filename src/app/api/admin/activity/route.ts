import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";
import { listAllSessions, deviceLabel } from "@/lib/server/sessions";

/**
 * Cross-account "who logged in, when" feed for the desktop app's Site
 * statistics panel. Same admin-email gate as /api/admin/stats — keep the
 * list in sync with ADMIN_EMAILS in ai hub/desktop-app/src/main.js.
 */
const ADMIN_EMAILS = new Set(["destrepalorg2@gmail.com", "ipostypalskiy@gmail.com"]);

export async function GET(req: Request): Promise<Response> {
  const userId = userIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  await ensureSchema();

  const callerResult = await sql`SELECT email FROM users WHERE id = ${userId}`;
  const caller = callerResult.rows[0] as { email: string } | undefined;
  if (!caller || !ADMIN_EMAILS.has(caller.email.toLowerCase())) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const rows = await listAllSessions(50);
  const events = rows.map((r) => ({
    id: r.id,
    email: r.email,
    nickname: r.nickname,
    device: deviceLabel(r.userAgent),
    ip: r.ip,
    createdAt: r.createdAt,
    lastSeenAt: r.lastSeenAt,
    revoked: r.revoked,
  }));

  return NextResponse.json({ events });
}
