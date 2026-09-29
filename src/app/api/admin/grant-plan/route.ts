import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";

/**
 * Admin-only: sets a real account's plan directly, for the desktop app's
 * "grant subscription" action (Users / Subscriptions panels). This writes
 * to the same `users.plan` column the Telegram-Stars payment flow writes
 * via /api/admin/redeem-payment — the difference is auth: redeem-payment is
 * gated on PAYMENT_ADMIN_TOKEN and driven by the payment bot with a
 * pre-minted intent token, this route is gated on the caller's own admin
 * account JWT (same pattern as /api/admin/stats and /api/admin/activity)
 * and driven by an admin typing an email + plan into the desktop app.
 *
 * Keep ADMIN_EMAILS in sync with /api/admin/stats, /api/admin/activity,
 * and roleForEmail() in ai hub/desktop-app/src/main.js.
 */
const ADMIN_EMAILS = new Set(["destrepalorg2@gmail.com", "ipostypalskiy@gmail.com"]);
const VALID_PLANS = new Set(["free", "pro", "ultra"]);

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

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const plan = String(body.plan || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "email обязателен." }, { status: 400 });
  }
  if (!VALID_PLANS.has(plan)) {
    return NextResponse.json({ error: "Неверный тариф (ожидается free/pro/ultra)." }, { status: 400 });
  }

  const targetResult = await sql`SELECT id, email, nickname FROM users WHERE lower(email) = ${email}`;
  const target = targetResult.rows[0] as { id: string; email: string; nickname: string | null } | undefined;
  if (!target) {
    return NextResponse.json({ error: "Пользователь с таким email не найден." }, { status: 404 });
  }

  await sql`UPDATE users SET plan = ${plan} WHERE id = ${target.id}`;

  return NextResponse.json({ ok: true, email: target.email, nickname: target.nickname, plan });
}
