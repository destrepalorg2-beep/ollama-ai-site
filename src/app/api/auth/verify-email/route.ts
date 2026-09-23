import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`verify:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const code = String(body.code || "").trim();

  if (!email || !code) {
    return NextResponse.json({ error: "email и code обязательны." }, { status: 400 });
  }

  try {
    await ensureSchema();

    const result = await sql`SELECT code, attempts, expires_at FROM email_verifications WHERE email = ${email}`;
    const record = result.rows[0] as { code: string; attempts: number; expires_at: string } | undefined;

    if (!record) {
      return NextResponse.json(
        { error: "Код не найден. Запросите новый.", code: "NOT_FOUND" },
        { status: 400 },
      );
    }
    if (new Date(record.expires_at) < new Date()) {
      await sql`DELETE FROM email_verifications WHERE email = ${email}`;
      return NextResponse.json({ error: "Код истёк. Запросите новый.", code: "EXPIRED" }, { status: 400 });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Слишком много неверных попыток. Запросите новый код.", code: "TOO_MANY_ATTEMPTS" },
        { status: 400 },
      );
    }
    if (record.code !== code) {
      await sql`UPDATE email_verifications SET attempts = attempts + 1 WHERE email = ${email}`;
      return NextResponse.json({ error: "Неверный код.", code: "INVALID" }, { status: 400 });
    }

    // Correct — consume the code and unlock the account.
    await sql`DELETE FROM email_verifications WHERE email = ${email}`;
    await sql`UPDATE users SET email_verified = true WHERE email = ${email}`;

    const userResult = await sql`SELECT id, nickname, plan FROM users WHERE email = ${email}`;
    const user = userResult.rows[0] as { id: string; nickname: string; plan: string } | undefined;
    if (!user) {
      return NextResponse.json({ error: "Аккаунт не найден." }, { status: 404 });
    }

    const token = signToken(user.id);
    return NextResponse.json({ token, email, nickname: user.nickname, plan: user.plan });
  } catch (err) {
    console.error("verify-email error", err);
    return NextResponse.json({ error: "Не удалось проверить код." }, { status: 500 });
  }
}
