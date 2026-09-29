import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";
import { listAuditLog } from "@/lib/server/audit";

/**
 * Admin-only, read-only feed of admin actions (grant plan, delete-unverified,
 * ...) — the "console with a site-action report" in the desktop app's Site
 * statistics panel. Same admin gate as /api/admin/stats and friends.
 *
 * Keep ADMIN_EMAILS in sync with /api/admin/stats, /api/admin/activity,
 * /api/admin/grant-plan, /api/admin/delete-unverified, and roleForEmail()
 * in ai hub/desktop-app/src/main.js.
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

  const entries = await listAuditLog(100);
  return NextResponse.json({ ok: true, entries });
}
