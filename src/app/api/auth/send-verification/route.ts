import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";
import { sendVerificationEmail } from "@/lib/server/mailer";

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`send-verification:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подождите 10 минут." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "email обязателен." }, { status: 400 });
  }

  try {
    await ensureSchema();

    const userResult = await sql`SELECT id, email_verified FROM users WHERE email = ${email}`;
    const user = userResult.rows[0] as { id: string; email_verified: boolean } | undefined;
    if (!user) {
      return NextResponse.json({ error: "Аккаунт не найден." }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ error: "Email уже подтверждён — войдите." }, { status: 400 });
    }

    const existingCode = await sql`SELECT last_sent_at FROM email_verifications WHERE email = ${email}`;
    const lastSent = existingCode.rows[0]?.last_sent_at as string | undefined;
    if (lastSent && Date.now() - new Date(lastSent).getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "Код уже отправлен. Подождите минуту." },
        { status: 429 },
      );
    }

    const code = randomInt(100_000, 999_999).toString();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
    await sql`
      INSERT INTO email_verifications (email, code, attempts, expires_at, last_sent_at)
      VALUES (${email}, ${code}, 0, ${expiresAt}, now())
      ON CONFLICT (email) DO UPDATE SET code = ${code}, attempts = 0, expires_at = ${expiresAt}, last_sent_at = now()
    `;

    await sendVerificationEmail(email, code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-verification error", err);
    return NextResponse.json({ error: "Не удалось отправить код." }, { status: 500 });
  }
}
