import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";

/**
 * Real site-user statistics for the desktop app's hidden admin panel.
 * Gated the same way the app itself gates the admin role — by email, not by
 * a separate secret — so "who can see this" stays in exactly one place
 * (this list) instead of drifting between the app and the site. Keep this
 * in sync with ADMIN_EMAILS in ai hub/desktop-app/src/main.js.
 *
 * Auth is the caller's own account JWT (same one /api/profile and
 * /api/payment/intent use), never a client-supplied email — only a signed-in
 * admin account can ever see this.
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

  const usersResult = await sql`
    SELECT id, email, nickname, plan, email_verified, created_at,
           telegram_id IS NOT NULL AS via_telegram,
           google_id IS NOT NULL AS via_google
    FROM users
    ORDER BY created_at DESC
  `;

  const users = usersResult.rows.map((u) => ({
    id: u.id as string,
    email: u.email as string,
    nickname: u.nickname as string,
    plan: u.plan as string,
    emailVerified: u.email_verified as boolean,
    createdAt: u.created_at as string,
    viaTelegram: u.via_telegram as boolean,
    viaGoogle: u.via_google as boolean,
    role: ADMIN_EMAILS.has((u.email as string).toLowerCase()) ? "admin" : "user",
  }));

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  const totals = {
    users: users.length,
    verified: users.filter((u) => u.emailVerified).length,
    unverified: users.filter((u) => !u.emailVerified).length,
    newLast7d: users.filter((u) => now - new Date(u.createdAt).getTime() < weekMs).length,
    newLast24h: users.filter((u) => now - new Date(u.createdAt).getTime() < dayMs).length,
    newLast30d: users.filter((u) => now - new Date(u.createdAt).getTime() < monthMs).length,
    newLastYear: users.filter((u) => now - new Date(u.createdAt).getTime() < yearMs).length,
    byPlan: users.reduce<Record<string, number>>((acc, u) => {
      acc[u.plan] = (acc[u.plan] || 0) + 1;
      return acc;
    }, {}),
  };

  return NextResponse.json({ totals, users });
}
