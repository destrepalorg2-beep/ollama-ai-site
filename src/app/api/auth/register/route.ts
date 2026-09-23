import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

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

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Этот email уже зарегистрирован — войдите.", code: "email_taken" },
        { status: 409 },
      );
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (id, email, password_hash, nickname, plan)
      VALUES (${id}, ${email}, ${passwordHash}, ${nickname}, ${plan})
    `;

    const token = signToken(id);
    return NextResponse.json({ token, userId: id, email, nickname, plan });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Не удалось зарегистрироваться." }, { status: 500 });
  }
}
