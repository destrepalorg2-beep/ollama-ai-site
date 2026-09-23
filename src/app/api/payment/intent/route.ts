import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { userIdFromRequest } from "@/lib/server/jwt";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

const PLAN_IDS = new Set(["pro", "ultra"]);

/**
 * Called from the site right before it hands the visitor off to the
 * Telegram Stars bot. Mints a short, single-use token tied to the caller's
 * own account (from their JWT — never from anything the client sends) and
 * the plan they're about to pay for. The bot embeds the token in the
 * invoice payload; when Telegram reports a successful payment, the bot
 * redeems it via /api/admin/redeem-payment to actually upgrade the plan.
 *
 * The email never travels through Telegram — only this opaque token does.
 */
export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`payment-intent:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const userId = userIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = String(body.plan || "");
  if (!PLAN_IDS.has(plan)) {
    return NextResponse.json({ error: "Неизвестный тариф." }, { status: 400 });
  }

  await ensureSchema();
  const result = await sql`SELECT email FROM users WHERE id = ${userId}`;
  const user = result.rows[0] as { email: string } | undefined;
  if (!user) {
    return NextResponse.json({ error: "Аккаунт не найден." }, { status: 404 });
  }

  const token = randomBytes(6).toString("base64url"); // 8 url-safe chars
  await sql`INSERT INTO payment_intents (token, email, plan) VALUES (${token}, ${user.email}, ${plan})`;

  return NextResponse.json({ token });
}
