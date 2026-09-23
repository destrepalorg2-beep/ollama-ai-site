import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/server/db";

/**
 * Telegram bot — as a webhook on this deployment, not a script on someone's
 * laptop.
 *
 * The old bot/bot.mjs long-polled Telegram from a Windows machine behind a
 * VPN. That worked only while that machine was on, that VPN was covering
 * Node (a VPN's "browser only" mode does not), and api.telegram.org wasn't
 * blocked on that network — in practice, often none of the three. Vercel's
 * servers have none of those problems, so Telegram is told to push updates
 * here instead of anyone polling for them. Whoever can pay does, any time,
 * with no dependency on a computer in Russia being on and reachable.
 *
 * State that bot.mjs kept in local files (OWNER_CHAT_ID in .env.local,
 * receipts.json) now lives in Postgres (bot_settings, bot_receipts) — a
 * serverless function has no disk that survives between calls.
 *
 * Set up once: point Telegram at this URL —
 *   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
 *     ?url=https://<your-domain>/api/telegram/webhook
 *     &secret_token=<TELEGRAM_WEBHOOK_SECRET>
 * (open that as a URL in your own browser — the token never has to be typed
 * anywhere else). See README notes in bot/bot.mjs for the plan/pricing
 * source of truth if those ever need changing.
 */

export const runtime = "nodejs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
/** Code that proves whoever sends /owner controls the deployment, not just
 *  the Telegram account — same idea as bot.mjs's console-only CLAIM_CODE,
 *  but as a secret only the operator has (env var) since there's no console
 *  window here to print it into. */
const OWNER_CODE = process.env.BOT_OWNER_CODE?.trim();

const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

async function call(method: string, body: unknown) {
  if (!API) return { ok: false, description: "TELEGRAM_BOT_TOKEN not configured" };
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ ok: false }));
  if (!json.ok) console.error(`telegram ${method}:`, json.description ?? res.status);
  return json;
}

const send = (chat_id: number | string, text: string, extra: Record<string, unknown> = {}) =>
  call("sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

const kb = (rows: { text: string; callback_data: string }[][]) => ({ reply_markup: { inline_keyboard: rows } });

/* ── settings (was OWNER_CHAT_ID in .env.local) ─────────────────────────── */

async function getOwner(): Promise<string | null> {
  await ensureSchema();
  const r = await sql`SELECT value FROM bot_settings WHERE key = 'owner_chat_id'`;
  return (r.rows[0]?.value as string | undefined) ?? null;
}
async function setOwner(chatId: string) {
  await sql`
    INSERT INTO bot_settings (key, value) VALUES ('owner_chat_id', ${chatId})
    ON CONFLICT (key) DO UPDATE SET value = ${chatId}
  `;
}

/* ── texts (mirrors bot/bot.mjs — keep the two in sync if wording changes) ── */

const PAY = {
  ton: "UQAF9LJyeKJQrM0wyoHeBsDxJLqLcYBVrEVgtl_vSEm54oos",
};

const PLANS: Record<string, { title: string; stars: number; desc: string }> = {
  pro: { title: "Pro", stars: 400, desc: "5 000 кредитов в месяц, повышенная скорость, приоритетная очередь." },
  ultra: { title: "Ultra", stars: 1200, desc: "15 000 кредитов в месяц, максимальная скорость, высший приоритет." },
};

const WELCOME =
  "<b>AI HUB</b>\n\nЗдесь можно оплатить подписку и прислать чек перевода.\n\nВыберите, что нужно:";

const MAIN_KB = kb([
  [{ text: "⭐ Оплатить звёздами", callback_data: "stars" }],
  [{ text: "🧾 Прислать чек перевода", callback_data: "receipt" }],
  [{ text: "💎 Кошелёк TON", callback_data: "details" }],
]);

const detailsText = () =>
  "<b>Оплата в TON</b>\n" +
  `Адрес: <code>${PAY.ton}</code>\n\n` +
  "Нажмите, чтобы скопировать.\n" +
  "После перевода пришлите сюда скриншот или чек.";

const plansKb = kb([
  ...Object.entries(PLANS).map(([id, p]) => [{ text: `${p.title} — ${p.stars} ⭐`, callback_data: `buy_${id}` }]),
  [{ text: "← Назад", callback_data: "menu" }],
]);

async function sendInvoice(chat_id: number | string, planId: string, intentToken?: string) {
  const plan = PLANS[planId];
  if (!plan) return send(chat_id, "Такого тарифа нет.");
  const payload = intentToken ? `site_${planId}_${intentToken}` : `plan_${planId}_${Date.now()}`;
  return call("sendInvoice", {
    chat_id,
    title: `AI HUB — ${plan.title}`,
    description: plan.desc,
    payload,
    provider_token: "",
    currency: "XTR",
    prices: [{ label: plan.title, amount: plan.stars }],
  });
}

/** Same account-linking as before, just inlined instead of an HTTP hop to
 *  /api/admin/redeem-payment — webhook and DB are the same deployment now,
 *  so there's no reason to leave the process to talk to itself. */
async function redeemPayment(token: string, planId: string | null): Promise<{ ok: boolean; email?: string }> {
  try {
    const result = await sql`SELECT email, plan, consumed_at FROM payment_intents WHERE token = ${token}`;
    const intent = result.rows[0] as { email: string; plan: string; consumed_at: string | null } | undefined;
    if (!intent || intent.consumed_at) return { ok: false };
    const plan = planId || intent.plan;
    await sql`UPDATE users SET plan = ${plan} WHERE email = ${intent.email}`;
    await sql`UPDATE payment_intents SET consumed_at = now() WHERE token = ${token}`;
    return { ok: true, email: intent.email };
  } catch (e) {
    console.error("redeemPayment failed:", e);
    return { ok: false };
  }
}

/* ── receipts (was receipts.json) ────────────────────────────────────────── */

async function addReceipt(rec: {
  id: string;
  chat: number;
  name: string;
  username: string | null;
  fromId: number;
  messageId: number;
}) {
  await sql`
    INSERT INTO bot_receipts (id, chat_id, name, username, from_id, message_id)
    VALUES (${rec.id}, ${String(rec.chat)}, ${rec.name}, ${rec.username}, ${String(rec.fromId)}, ${rec.messageId})
  `;
}
async function pendingReceipts() {
  const r = await sql`SELECT * FROM bot_receipts WHERE status = 'pending' ORDER BY created_at ASC`;
  return r.rows as { id: string; chat_id: string; name: string; username: string | null; message_id: number }[];
}
async function getReceipt(id: string) {
  const r = await sql`SELECT * FROM bot_receipts WHERE id = ${id}`;
  return r.rows[0] as { id: string; chat_id: string; status: string } | undefined;
}
async function decideReceiptRow(id: string, approve: boolean) {
  await sql`UPDATE bot_receipts SET status = ${approve ? "approved" : "rejected"}, decided_at = now() WHERE id = ${id}`;
}

async function forwardReceiptToOwner(owner: string, rec: { id: string; chat_id: string; name: string; username: string | null; message_id: number }) {
  try {
    await call("forwardMessage", { chat_id: owner, from_chat_id: rec.chat_id, message_id: rec.message_id });
  } catch (e) {
    console.error("forward receipt failed:", e);
  }
  const who = `${rec.name || "без имени"}${rec.username ? " @" + rec.username : ""} (<code>${rec.chat_id}</code>)`;
  await send(owner, `🧾 Чек на проверку от ${who}`, kb([[
    { text: "✅ Подтвердить", callback_data: `ok_${rec.id}` },
    { text: "✖️ Отклонить", callback_data: `no_${rec.id}` },
  ]]));
}

/* ── update handlers ─────────────────────────────────────────────────────── */

async function onMessage(msg: any) {
  const chat = msg.chat.id;
  const text = (msg.text || "").trim();

  if (msg.successful_payment) {
    const sp = msg.successful_payment;
    const payload: string = sp.invoice_payload || "";
    let planId: string | null = null;
    let intentToken: string | null = null;
    if (payload.startsWith("site_")) {
      const rest = payload.slice(5);
      const cut = rest.indexOf("_");
      planId = cut === -1 ? rest : rest.slice(0, cut);
      intentToken = cut === -1 ? null : rest.slice(cut + 1);
    } else if (payload.startsWith("plan_")) {
      planId = payload.slice(5).split("_")[0];
    }

    const redeemed = intentToken ? await redeemPayment(intentToken, planId) : { ok: false };

    await send(
      chat,
      redeemed.ok
        ? "✅ Оплата прошла, тариф уже подключён на сайте — можно пользоваться!"
        : "✅ Оплата прошла. Тариф подключим в ближайшее время — спасибо!",
    );
    const owner = await getOwner();
    if (owner) {
      await send(
        owner,
        `💫 <b>Оплата звёздами</b>${planId ? ` — ${planId}` : ""}\n${sp.total_amount} ⭐\n` +
          `Платёж: <code>${sp.telegram_payment_charge_id}</code>\n` +
          `От: ${msg.from.first_name ?? ""} @${msg.from.username ?? "—"} (<code>${msg.from.id}</code>)\n` +
          (intentToken
            ? redeemed.ok
              ? `Тариф на сайте обновлён автоматически (${redeemed.email}).`
              : "⚠️ Не удалось обновить тариф на сайте автоматически — подключите вручную."
            : "Без привязки к аккаунту — подключите тариф вручную."),
      );
    }
    return;
  }

  if (msg.photo || msg.document) {
    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      chat,
      name: msg.from.first_name ?? "",
      username: msg.from.username ?? null,
      fromId: msg.from.id,
      messageId: msg.message_id,
    };
    await addReceipt(rec);
    await send(chat, "🧾 Чек получен. Проверим и подключим тариф — обычно в течение дня.");
    const owner = await getOwner();
    if (owner) {
      await forwardReceiptToOwner(owner, {
        id: rec.id,
        chat_id: String(rec.chat),
        name: rec.name,
        username: rec.username,
        message_id: rec.messageId,
      });
    }
    return;
  }

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1] ?? "";
    if (payload.startsWith("stars_")) {
      const rest = payload.slice(6);
      const cut = rest.indexOf("_");
      const id = cut === -1 ? rest : rest.slice(0, cut);
      const intentToken = cut === -1 ? undefined : rest.slice(cut + 1);
      if (PLANS[id]) return sendInvoice(chat, id, intentToken);
      return send(chat, "Выберите тариф:", plansKb);
    }
    if (payload.startsWith("receipt")) {
      return send(chat, "Пришлите скриншот перевода одним сообщением — фото или файлом.");
    }
    return send(chat, WELCOME, MAIN_KB);
  }

  if (text === "/id") {
    return send(chat, `Ваш chat id: <code>${chat}</code>`);
  }

  if (text === "/pending") {
    const owner = await getOwner();
    if (!owner || String(owner) !== String(chat)) return send(chat, WELCOME, MAIN_KB);
    const list = await pendingReceipts();
    if (!list.length) return send(chat, "Непроверенных чеков нет.");
    await send(chat, `Непроверенных чеков: <b>${list.length}</b>. Пересылаю…`);
    for (const rec of list) await forwardReceiptToOwner(owner, rec);
    return;
  }

  if (text.startsWith("/owner")) {
    const code = text.split(/\s+/)[1] ?? "";
    const owner = await getOwner();
    if (owner && String(owner) === String(chat)) {
      return send(chat, "Вы уже владелец — чеки приходят сюда.");
    }
    if (owner) {
      return send(chat, WELCOME, MAIN_KB);
    }
    if (!OWNER_CODE || code !== OWNER_CODE) {
      return send(chat, "Код не подошёл.");
    }
    await setOwner(String(chat));
    const waiting = (await pendingReceipts()).length;
    await send(
      chat,
      "✅ Готово. Чеки и оплаты теперь приходят сюда." +
        (waiting ? `\n\nВ очереди уже ${waiting} чек(ов) — пересылаю их сейчас.` : ""),
    );
    if (waiting) for (const rec of await pendingReceipts()) await forwardReceiptToOwner(String(chat), rec);
    return;
  }

  return send(chat, WELCOME, MAIN_KB);
}

async function onCallback(q: any) {
  const chat = q.message.chat.id;
  await call("answerCallbackQuery", { callback_query_id: q.id });

  switch (q.data) {
    case "menu":
      return send(chat, WELCOME, MAIN_KB);
    case "stars":
      return send(chat, "<b>Оплата звёздами</b>\nВыберите тариф:", plansKb);
    case "details":
      return send(chat, detailsText());
    case "receipt":
      return send(chat, "Пришлите скриншот перевода одним сообщением — фото или файлом.");
    default:
      if (q.data?.startsWith("buy_")) return sendInvoice(chat, q.data.slice(4));
      if (q.data?.startsWith("ok_") || q.data?.startsWith("no_")) return decideReceipt(q);
  }
}

async function decideReceipt(q: any) {
  const chat = q.message.chat.id;
  const owner = await getOwner();
  if (!owner || String(owner) !== String(chat)) return;

  const approve = q.data.startsWith("ok_");
  const id = q.data.slice(3);
  const rec = await getReceipt(id);
  if (!rec) return call("editMessageText", { chat_id: chat, message_id: q.message.message_id, text: "Этот чек уже не найден." });
  if (rec.status !== "pending") {
    return call("editMessageText", {
      chat_id: chat,
      message_id: q.message.message_id,
      text: `Уже обработан: ${rec.status === "approved" ? "подтверждён" : "отклонён"}.`,
    });
  }

  await decideReceiptRow(id, approve);
  await call("editMessageText", {
    chat_id: chat,
    message_id: q.message.message_id,
    text: approve ? "✅ Чек подтверждён — пользователю отправлено уведомление." : "✖️ Чек отклонён — пользователю отправлено уведомление.",
  });
  await send(
    rec.chat_id,
    approve
      ? "✅ Оплата подтверждена. Тариф активирован — спасибо!"
      : "✖️ Оплата не подтверждена. Если это ошибка, пришлите чёткий скриншот перевода ещё раз или напишите нам.",
  );
}

/* ── entry point ──────────────────────────────────────────────────────────── */

export async function POST(req: Request): Promise<Response> {
  // Telegram sends this header on every webhook call once secret_token was
  // set in setWebhook — without checking it, anyone who finds this URL could
  // feed it fake updates (fake payments, fake receipt approvals).
  if (WEBHOOK_SECRET) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== WEBHOOK_SECRET) return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!TOKEN) return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });

  const update = await req.json().catch(() => null);
  if (!update) return NextResponse.json({ ok: true });

  try {
    if (update.pre_checkout_query) {
      // Must be answered within 10 seconds or Telegram cancels the payment.
      await call("answerPreCheckoutQuery", { pre_checkout_query_id: update.pre_checkout_query.id, ok: true });
    } else if (update.callback_query) {
      await onCallback(update.callback_query);
    } else if (update.message) {
      await onMessage(update.message);
    }
  } catch (e) {
    // Always 200 back to Telegram — a thrown error here would make Telegram
    // retry the same update repeatedly instead of moving on.
    console.error("telegram webhook handler error:", e);
  }

  return NextResponse.json({ ok: true });
}
