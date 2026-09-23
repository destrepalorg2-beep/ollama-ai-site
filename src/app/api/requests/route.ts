import { NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/server/rate-limit";

/**
 * Contact-form / support-request intake. Forwards straight to the existing
 * Telegram bot (@paybotayhub_bot) as a message to OWNER_CHAT_ID — the same
 * bot already used for payments, so requests land wherever that's already
 * being watched. No database involved: this is a notification, not a record
 * that needs querying later.
 */
export async function POST(req: Request): Promise<Response> {
  if (isRateLimited(`requests:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много заявок. Попробуйте позже." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();
  const description = String(body.description || "").trim();
  const type = String(body.type || "contact").trim();

  if (!name || !contact || !description) {
    return NextResponse.json({ error: "Заполните все поля." }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.OWNER_CHAT_ID;
  if (!token || !chatId) {
    console.error("requests: TELEGRAM_BOT_TOKEN or OWNER_CHAT_ID is not set");
    return NextResponse.json({ error: "Форма временно недоступна." }, { status: 500 });
  }

  // Telegram's message-formatting special characters, escaped so a name or
  // message containing them can't break the Markdown parse (or worse, let
  // someone inject formatting/links into the notification).
  const esc = (s: string) => s.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

  const text =
    `📨 *Новая заявка* (${esc(type)})\n\n` +
    `*От:* ${esc(name)}\n` +
    `*Контакт:* ${esc(contact)}\n\n` +
    `${esc(description)}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("requests: Telegram API error", res.status, detail);
      return NextResponse.json({ error: "Не удалось отправить заявку." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("requests: send failed", err);
    return NextResponse.json({ error: "Не удалось отправить заявку." }, { status: 502 });
  }
}
