import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";

/**
 * Called only by the payment bot (bot/bot.mjs), never by the browser —
 * gated on PAYMENT_ADMIN_TOKEN, a separate secret from the user-facing JWT
 * so a leaked account token can never upgrade an account. The bot calls
 * this the moment Telegram confirms a Stars payment, with the token that
 * /api/payment/intent minted for that specific account + plan.
 *
 * The plan is looked up from the intent row, not trusted from the request
 * body — the token is the only thing that has to be right.
 */
export async function POST(req: Request): Promise<Response> {
  const adminToken = process.env.PAYMENT_ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ ok: false, error: "PAYMENT_ADMIN_TOKEN not configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  if (!token) {
    return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });
  }

  await ensureSchema();
  const result = await sql`
    SELECT email, plan, consumed_at FROM payment_intents WHERE token = ${token}
  `;
  const intent = result.rows[0] as { email: string; plan: string; consumed_at: string | null } | undefined;

  if (!intent) {
    return NextResponse.json({ ok: false, error: "unknown token" }, { status: 404 });
  }
  if (intent.consumed_at) {
    return NextResponse.json({ ok: false, error: "already redeemed" }, { status: 409 });
  }

  await sql`UPDATE users SET plan = ${intent.plan} WHERE email = ${intent.email}`;
  await sql`UPDATE payment_intents SET consumed_at = now() WHERE token = ${token}`;

  return NextResponse.json({ ok: true, email: intent.email, plan: intent.plan });
}
