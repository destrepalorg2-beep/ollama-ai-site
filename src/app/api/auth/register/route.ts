import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID, randomInt } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";
import { sendVerificationEmail } from "@/lib/server/mailer";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between sends

export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`register:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const nickname = String(body.nickname || "").trim();
  const plan = ["free", "pro", "ultra"].includes(body.plan) ? body.plan : "free";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Некорректный email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Пароль минимум 8 символов." }, { status: 400 });
  }
  if (nickname.length < 2) {
    return NextResponse.json({ error: "Никнейм минимум 2 символа." }, { status: 400 });
  }

  try {
    await ensureSchema();

    const existing = await sql`SELECT id, email_verified FROM users WHERE email = ${email}`;
    const existingUser = existing.rows[0] as { id: string; email_verified: boolean } | undefined;

    if (existingUser?.email_verified) {
      return NextResponse.json(
        { error: "Этот email уже зарегистрирован — войдите.", code: "email_taken" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser) {
      // A previous registration attempt never got verified — this is
      // effectively a fresh attempt with (maybe) a new password/nickname,
      // not a duplicate account, since nothing usable was ever issued for
      // the old one (no token exists without a verified email).
      await sql`
        UPDATE users SET password_hash = ${passwordHash}, nickname = ${nickname}, plan = ${plan}
        WHERE id = ${existingUser.id}
      `;
    } else {
      await sql`
        INSERT INTO users (id, email, password_hash, nickname, plan, email_verified)
        VALUES (${randomUUID()}, ${email}, ${passwordHash}, ${nickname}, ${plan}, false)
      `;
    }

    // Resend cooldown: don't let someone hammer the mailbox.
    const existingCode = await sql`SELECT last_sent_at FROM email_verifications WHERE email = ${email}`;
    const lastSent = existingCode.rows[0]?.last_sent_at as string | undefined;
    if (lastSent && Date.now() - new Date(lastSent).getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "Код уже отправлен. Подождите минуту перед повторной отправкой." },
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

    const emailed = await sendVerificationEmail(email, code);

    return NextResponse.json({
      message: emailed
        ? "Мы отправили код подтверждения на почту."
        : "Регистрация создана, но письмо отправить не удалось — обратитесь в поддержку.",
      email,
    });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Не удалось зарегистрироваться." }, { status: 500 });
  }
}
