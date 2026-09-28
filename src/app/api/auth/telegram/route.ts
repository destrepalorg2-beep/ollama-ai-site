import { NextResponse } from "next/server";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { sql, ensureSchema } from "@/lib/server/db";
import { signToken } from "@/lib/server/jwt";
import { createSession } from "@/lib/server/sessions";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

/**
 * Verifies a Telegram Login Widget payload and signs in (or creates) the
 * matching account. Same bot, same TELEGRAM_BOT_TOKEN, as the payments bot
 * in /api/telegram/webhook — the login widget just needs the bot's domain
 * set once via @BotFather (Bot Settings → Domain), nothing else new.
 *
 * Verification per Telegram's own spec: https://core.telegram.org/widgets/login
 *   secret   = SHA256(bot_token)
 *   check    = HMAC-SHA256(secret, "key=value" pairs sorted by key, \n-joined,
 *              excluding "hash") must equal the `hash` field, hex-encoded.
 */

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
// Telegram recommends rejecting stale auth_date so a captured payload can't
// be replayed indefinitely; a day is generous but still bounded.
const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

interface TelegramPayload {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verify(payload: TelegramPayload): boolean {
  if (!TOKEN) return false;
  const { hash, ...rest } = payload;
  if (!hash) return false;

  const dataCheckString = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = createHash("sha256").update(TOKEN).digest();
  const computed = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(String(hash), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`telegram-login:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }
  if (!TOKEN) {
    return NextResponse.json({ error: "Вход через Telegram не настроен на сервере." }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as TelegramPayload | null;
  if (!body || !body.id || !body.hash || !body.auth_date) {
    return NextResponse.json({ error: "Некорректные данные от Telegram." }, { status: 400 });
  }

  if (!verify(body)) {
    return NextResponse.json({ error: "Подпись Telegram не подтверждена." }, { status: 401 });
  }
  if (Date.now() / 1000 - body.auth_date > MAX_AUTH_AGE_SEC) {
    return NextResponse.json({ error: "Сессия входа через Telegram устарела — попробуйте снова." }, { status: 401 });
  }

  try {
    await ensureSchema();

    const telegramId = body.id;
    const nickname = body.username ? `@${body.username}` : body.first_name || "Telegram";
    // Telegram never hands over an email — this account still needs a value
    // in the NOT NULL UNIQUE `email` column, so it gets one that's unique
    // per telegram id and obviously not a real inbox. profile.tsx / the
    // login form both key off `id`, not this, so nothing else needs to know.
    const syntheticEmail = `tg${telegramId}@telegram.local`;

    const result = await sql`
      INSERT INTO users (id, email, password_hash, nickname, plan, avatar, email_verified, telegram_id)
      VALUES (${randomUUID()}, ${syntheticEmail}, NULL, ${nickname}, 'free', ${body.photo_url ?? null}, true, ${telegramId})
      ON CONFLICT (telegram_id) DO UPDATE SET nickname = EXCLUDED.nickname, avatar = EXCLUDED.avatar
      RETURNING id, email, nickname, plan
    `;
    const user = result.rows[0] as { id: string; email: string; nickname: string; plan: string };

    const sessionId = await createSession(user.id, req);
    const token = signToken(user.id, sessionId);
    return NextResponse.json({ token, email: user.email, nickname: user.nickname, plan: user.plan });
  } catch (err) {
    console.error("telegram login error", err);
    return NextResponse.json({ error: "Не удалось войти через Telegram." }, { status: 500 });
  }
}
