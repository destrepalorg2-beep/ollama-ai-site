import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

export async function POST(req: Request): Promise<Response> {
  // 10 attempts / 15 min per IP — throttles brute-forcing one account.
  if (isRateLimited(`login:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Попробуйте через 15 минут." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "email и пароль обязательны." }, { status: 400 });
  }

  try {
    await ensureSchema();

    const result = await sql`
      SELECT id, password_hash, nickname, plan FROM users WHERE email = ${email}
    `;
    const user = result.rows[0] as
      | { id: string; password_hash: string; nickname: string; plan: string }
      | undefined;

    // Distinguishing "no account" from "wrong password" is a deliberate,
    // user-requested product choice: it nudges new visitors to register
    // instead of guessing, at the cost of some account-enumeration exposure.
    // Acceptable trade-off for a small personal project; the rate limiter
    // above still throttles brute-force.
    if (!user) {
      return NextResponse.json(
        { error: "No account with this email yet.", code: "account_not_found" },
        { status: 404 },
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password.", code: "invalid_credentials" },
        { status: 401 },
      );
    }

    const token = signToken(user.id);
    return NextResponse.json({ token, email, nickname: user.nickname, plan: user.plan });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Не удалось войти." }, { status: 500 });
  }
}
