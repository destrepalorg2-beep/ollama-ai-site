import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";
import { logAdminAction } from "@/lib/server/audit";

/**
 * Admin-only, irreversible: permanently deletes every account whose email
 * is not verified. Driven by a confirm-gated button in the desktop app's
 * Users panel. Every admin (Google/Microsoft/Telegram sign-ins can have a
 * null password_hash but still carry email_verified) is exempt from this —
 * only ADMIN_EMAILS accounts are protected, so an admin who somehow has an
 * unverified email never nukes their own access.
 *
 * Keep ADMIN_EMAILS in sync with /api/admin/stats, /api/admin/activity,
 * /api/admin/grant-plan, /api/admin/audit-log, and roleForEmail() in
 * ai hub/desktop-app/src/main.js.
 */
const ADMIN_EMAILS = new Set(["destrepalorg2@gmail.com", "ipostypalskiy@gmail.com"]);

export async function POST(req: Request): Promise<Response> {
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

  const targets = await sql`SELECT id, email FROM users WHERE email_verified = false`;
  // Belt-and-suspenders: even though no admin account should ever be
  // unverified, never let this route touch an ADMIN_EMAILS row.
  const rows = (targets.rows as { id: string; email: string }[]).filter(
    (r) => !ADMIN_EMAILS.has((r.email || "").toLowerCase())
  );

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, deletedCount: 0, deletedEmails: [] });
  }

  // Individual parameterized statements rather than a bound array — keeps
  // this on the exact query pattern already used everywhere else here,
  // and the batch is always small (unverified signups only).
  for (const row of rows) {
    await sql`DELETE FROM sessions WHERE user_id = ${row.id}`;
    await sql`DELETE FROM trusted_devices WHERE user_id = ${row.id}`;
    await sql`DELETE FROM users WHERE id = ${row.id}`;
  }

  const emails = rows.map((r) => r.email);
  await logAdminAction(
    caller.email,
    "delete_unverified_users",
    `Удалено ${rows.length}: ${emails.join(", ")}`
  );

  return NextResponse.json({ ok: true, deletedCount: rows.length, deletedEmails: emails });
}
