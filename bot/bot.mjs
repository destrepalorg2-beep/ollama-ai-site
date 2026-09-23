/**
 * AI HUB payment bot.
 *
 * Long polling, not a webhook: a webhook needs a public HTTPS address, and this
 * runs on a laptop behind NAT. Polling works from anywhere with no tunnel.
 *
 * No dependencies — Node 18+ has fetch built in.
 *
 * Reads .env.local from the site folder. The token never appears in logs.
 */

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { lookup } from "node:dns/promises";
import { fileURLToPath } from "node:url";
import { findRoute, post } from "./tg-net.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOG = join(HERE, "bot-log.txt");

/** Everything the operator needs to debug a failed start ends up in one file. */
function log(...parts) {
  const line = parts.join(" ");
  console.log(line);
  try {
    appendFileSync(LOG, line + "\r\n");
  } catch {}
}
try {
  writeFileSync(LOG, `--- ${new Date().toISOString()} ---\r\n`);
} catch {}

/* ── config ───────────────────────────────────────────────────────────────── */

function loadEnv() {
  for (const p of [join(HERE, ".env.local"), join(HERE, "..", ".env.local")]) {
    try {
      const text = readFileSync(p, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
      return p;
    } catch {}
  }
  return null;
}

const envPath = loadEnv();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
/* Меняется командой /owner, поэтому let: иначе владельца нельзя было бы
   назначить без перезапуска бота. */
let OWNER = process.env.OWNER_CHAT_ID?.trim() || null;

/* Код, которым назначают владельца. Виден только в этом окне, поэтому назвать
   себя владельцем может лишь тот, у кого есть доступ к машине с ботом. Без
   такой проверки первый посторонний, нашедший бота, увёл бы себе все чеки. */
const CLAIM_CODE = String(Math.floor(1000 + Math.random() * 9000));

/**
 * Прописывает значение в .env.local.
 *
 * Именно заменяет строку, а не дописывает в конец: парсер берёт первое
 * вхождение ключа, и дописанная строка после пустого OWNER_CHAT_ID= была бы
 * молча проигнорирована при следующем запуске.
 */
function setEnvValue(key, value) {
  if (!envPath) return false;
  try {
    const text = readFileSync(envPath, "utf8");
    const line = `${key}=${value}`;
    // [^\\S\\r\\n] — это «пробел, но не перенос строки». С обычным \\s движок
    // считает началом строки и позицию между \\r и \\n, съедает этот \\n при
    // замене и склеивает предыдущую строку с нашей — так пропадала строка
    // с токеном. Тест на это есть.
    const re = new RegExp(`^[^\\S\\r\\n]*${key}[^\\S\\r\\n]*=.*$`, "m");
    const next = re.test(text)
      ? text.replace(re, line)
      : text.replace(/\s*$/, "") + `\r\n${line}\r\n`;
    writeFileSync(envPath, next, "utf8");
    return true;
  } catch (e) {
    log("  не удалось записать " + key + " в .env.local: " + (e.message ?? e));
    return false;
  }
}

/* ── Очередь чеков ────────────────────────────────────────────────────────────
   Бот не может проверить чек сам — он лишь картинка, а не платёж. Но чек не
   должен теряться: каждый складывается в файл, владельцу приходит с кнопками
   «Подтвердить / Отклонить», а раз в несколько часов бот напоминает, сколько
   их висит непроверенными. Единственный шаг, который остаётся на человеке, —
   собственно решение: его автоматизировать нельзя. */
const RECEIPTS_FILE = join(HERE, "receipts.json");
const REMIND_EVERY_MS = 6 * 60 * 60 * 1000; // раз в 6 часов

function readReceipts() {
  try {
    const arr = JSON.parse(readFileSync(RECEIPTS_FILE, "utf8"));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeReceipts(list) {
  try {
    writeFileSync(RECEIPTS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (e) {
    log("  не удалось записать receipts.json: " + (e.message ?? e));
  }
}
function addReceipt(rec) {
  const list = readReceipts();
  list.push(rec);
  writeReceipts(list);
  return rec;
}
function updateReceipt(id, patch) {
  const list = readReceipts();
  const r = list.find((x) => x.id === id);
  if (!r) return null;
  Object.assign(r, patch);
  writeReceipts(list);
  return r;
}
const pendingReceipts = () => readReceipts().filter((r) => r.status === "pending");

log("env file:", envPath ?? "NOT FOUND");
log("keys found:", Object.keys(process.env).filter((k) => k.startsWith("TELEGRAM_") || k.startsWith("NEXT_PUBLIC_") || k === "OWNER_CHAT_ID").join(", ") || "none");
log("token present:", TOKEN ? `yes (${TOKEN.length} chars)` : "NO");

if (!TOKEN) {
  log("");
  log("  ОШИБКА: в .env.local нет строки TELEGRAM_BOT_TOKEN с непустым значением.");
  log("  Откройте файл и проверьте, что строка выглядит так:");
  log("      TELEGRAM_BOT_TOKEN=123456:AAA...");
  log("  без пробелов вокруг знака = и без кавычек.");
  process.exit(1);
}

/** Payment details shown in chat. Same numbers as the site. */
const PAY = {
  recipient: "Степан П.",
  phone: "+7 951 533-43-91",
  cardOzon: "2204 3211 7840 1139",
  cardTbank: "2200 7019 9069 3829",
  ton: "UQAF9LJyeKJQrM0wyoHeBsDxJLqLcYBVrEVgtl_vSEm54oos",
};

/**
 * Telegram Stars price per plan.
 * ADJUST THESE. Stars are not roubles — check the current rate in @BotFather
 * before taking real money, otherwise you undercharge or overcharge.
 */
const PLANS = {
  pro: { title: "Pro", stars: 400, rub: "490 ₽ / мес", desc: "5 000 кредитов в месяц, повышенная скорость, приоритетная очередь." },
  ultra: { title: "Ultra", stars: 1200, rub: "1 490 ₽ / мес", desc: "15 000 кредитов в месяц, максимальная скорость, высший приоритет." },
};

/* ── Telegram API ─────────────────────────────────────────────────────────── */

/* Many ISPs block api.telegram.org outright, and a VPN client running in
   "proxy" mode only covers the browser — Node dials out past it and hits the
   block. tg-net.mjs finds a way through; TG_PROXY just tells it where to look
   first. The route it settles on is set below, before polling starts. */
const PROXY = process.env.TG_PROXY?.trim();
log("proxy:", PROXY ? PROXY.replace(/\/\/[^@]*@/, "//***@") : "не задан, ищу сам");

const API = `https://api.telegram.org/bot${TOKEN}`;

/** Set once findRoute picks a way out; null means a direct connection works. */
let AGENT = null;

/** fetch hides the real reason behind "fetch failed" — dig it out. */
function why(e) {
  const c = e?.cause ?? e;
  const code = c?.code ?? "";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN")
    return "DNS не резолвит api.telegram.org — адрес режется провайдером или DNS.";
  if (code === "ECONNREFUSED") return "Соединение отклонено.";
  if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT")
    return "Таймаут подключения — трафик до Telegram не проходит.";
  if (code === "CERT_HAS_EXPIRED" || String(code).includes("CERT"))
    return "Проблема с сертификатом — возможно, антивирус подменяет TLS.";
  return code ? `Код: ${code}` : (c?.message ?? "неизвестно");
}

async function call(method, body) {
  const { status, json } = await post(`${API}/${method}`, body, { agent: AGENT });
  if (!json.ok) {
    // Never print the URL — it carries the token.
    console.error(`  ! ${method}: ${json.description ?? status}`);
  }
  return json;
}

const send = (chat_id, text, extra = {}) =>
  call("sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });

const kb = (rows) => ({ reply_markup: { inline_keyboard: rows } });

/* ── texts ────────────────────────────────────────────────────────────────── */

const WELCOME =
  "<b>AI HUB</b>\n\n" +
  "Здесь можно оплатить подписку и прислать чек перевода.\n\n" +
  "Выберите, что нужно:";

const MAIN_KB = kb([
  [{ text: "⭐ Оплатить звёздами", callback_data: "stars" }],
  [{ text: "🧾 Прислать чек перевода", callback_data: "receipt" }],
  [{ text: "💳 Реквизиты для перевода", callback_data: "details" }],
]);

const detailsText = () =>
  "<b>Реквизиты</b>\n" +
  `Получатель: <b>${PAY.recipient}</b>\n\n` +
  `СБП: <code>${PAY.phone}</code>\n` +
  `Ozon Банк: <code>${PAY.cardOzon}</code>\n` +
  `Т-Банк: <code>${PAY.cardTbank}</code>\n` +
  `TON: <code>${PAY.ton}</code>\n\n` +
  "Нажмите на любую строку, чтобы скопировать.\n" +
  "После перевода пришлите сюда скриншот или чек.";

const plansKb = kb([
  ...Object.entries(PLANS).map(([id, p]) => [
    { text: `${p.title} — ${p.stars} ⭐`, callback_data: `buy_${id}` },
  ]),
  [{ text: "← Назад", callback_data: "menu" }],
]);

/* ── handlers ─────────────────────────────────────────────────────────────── */

const awaitingReceipt = new Set();

async function sendInvoice(chat_id, planId) {
  const plan = PLANS[planId];
  if (!plan) return send(chat_id, "Такого тарифа нет.");
  return call("sendInvoice", {
    chat_id,
    title: `AI HUB — ${plan.title}`,
    description: plan.desc,
    payload: `plan_${planId}_${Date.now()}`,
    // Stars invoices take an empty provider_token and the XTR currency.
    provider_token: "",
    currency: "XTR",
    prices: [{ label: `${plan.title}`, amount: plan.stars }],
  });
}


/** Pinpoint where the traffic dies: DNS, the internet at all, or just Telegram. */
async function diagnose() {
  log("");
  log("  --- Проверка связи ---");

  // 1. DNS
  try {
    const r = await lookup("api.telegram.org");
    log(`  DNS api.telegram.org  -> ${r.address}  OK`);
  } catch (e) {
    log(`  DNS api.telegram.org  -> НЕ РЕЗОЛВИТ (${e.code ?? e.message})`);
  }

  // 2. Is the internet reachable at all from Node?
  const probe = async (url, label) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      log(`  ${label.padEnd(22)}-> HTTP ${res.status}  OK`);
      return true;
    } catch (e) {
      log(`  ${label.padEnd(22)}-> НЕ ОТВЕЧАЕТ (${why(e)})`);
      return false;
    } finally {
      clearTimeout(t);
    }
  };

  const web = await probe("https://example.com", "example.com");
  const tg = await probe("https://api.telegram.org", "api.telegram.org");

  log("");
  if (!web) {
    log("  Интернет из Node вообще не работает.");
    log("  Скорее всего трафик режет антивирус или брандмауэр — разрешите node.exe.");
  } else if (!tg) {
    log("  Интернет есть, но именно Telegram недоступен.");
    log("  Это и есть блокировка. Важно: VPN-расширение в браузере");
    log("  НЕ покрывает Node — нужен VPN на всю систему либо TG_PROXY в .env.local.");
  }
  log("  ----------------------");
}

/** Пересылает чек владельцу и прикрепляет кнопки решения. Картинку показывает
 *  forwardMessage; кнопки идут отдельным сообщением, т.к. к пересылке разметку
 *  прикрепить нельзя. */
async function forwardReceiptToOwner(rec) {
  if (!OWNER) return;
  try {
    await call("forwardMessage", { chat_id: OWNER, from_chat_id: rec.chat, message_id: rec.messageId });
  } catch (e) {
    // Пересылка могла не пройти (сообщение удалили) — решение всё равно возможно.
    console.error("  ! forward receipt:", e.message);
  }
  const who = `${rec.name || "без имени"}${rec.username ? " @" + rec.username : ""} (<code>${rec.fromId}</code>)`;
  await send(OWNER, `🧾 Чек на проверку от ${who}`, kb([[
    { text: "✅ Подтвердить", callback_data: `ok_${rec.id}` },
    { text: "✖️ Отклонить", callback_data: `no_${rec.id}` },
  ]]));
}

/** Досылает владельцу все накопившиеся чеки — вызывается после назначения через /owner. */
async function flushPending() {
  for (const rec of pendingReceipts()) await forwardReceiptToOwner(rec);
}

async function onMessage(msg) {
  const chat = msg.chat.id;
  const text = (msg.text || "").trim();

  if (msg.successful_payment) {
    const sp = msg.successful_payment;
    await send(chat, "✅ Оплата прошла. Тариф подключим в ближайшее время — спасибо!");
    if (OWNER) {
      await send(
        OWNER,
        `💫 <b>Оплата звёздами</b>\n${sp.total_amount} ⭐\nПлатёж: <code>${sp.telegram_payment_charge_id}</code>\n` +
          `От: ${msg.from.first_name ?? ""} @${msg.from.username ?? "—"} (<code>${msg.from.id}</code>)`,
      );
    }
    return;
  }

  if (msg.photo || msg.document) {
    awaitingReceipt.delete(chat);
    const rec = addReceipt({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      chat,
      name: msg.from.first_name ?? "",
      username: msg.from.username ?? null,
      fromId: msg.from.id,
      messageId: msg.message_id,
      when: new Date().toISOString(),
      status: "pending",
    });
    await send(chat, "🧾 Чек получен. Проверим и подключим тариф — обычно в течение дня.");
    // Сохранён в любом случае. Если владелец уже назначен — сразу пересылаем
    // ему; если нет — дождётся команды /owner и придёт пачкой (flushPending).
    if (OWNER) await forwardReceiptToOwner(rec);
    else log("  Чек сохранён в очередь — владелец не назначен, придёт после /owner.");
    return;
  }

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1] ?? "";
    if (payload.startsWith("stars_")) {
      const id = payload.slice(6);
      if (PLANS[id]) return sendInvoice(chat, id);
      return send(chat, "Выберите тариф:", plansKb);
    }
    if (payload.startsWith("receipt")) {
      awaitingReceipt.add(chat);
      return send(chat, "Пришлите скриншот перевода одним сообщением — фото или файлом.");
    }
    return send(chat, WELCOME, MAIN_KB);
  }

  if (text === "/id") {
    return send(chat, `Ваш chat id: <code>${chat}</code>`);
  }

  if (text === "/pending") {
    if (!OWNER || String(OWNER) !== String(chat)) return send(chat, WELCOME, MAIN_KB);
    const list = pendingReceipts();
    if (!list.length) return send(chat, "Непроверенных чеков нет.");
    await send(chat, `Непроверенных чеков: <b>${list.length}</b>. Пересылаю…`);
    for (const rec of list) await forwardReceiptToOwner(rec);
    return;
  }

  if (text.startsWith("/owner")) {
    const code = text.split(/\s+/)[1] ?? "";
    if (OWNER && String(OWNER) === String(chat)) {
      return send(chat, "Вы уже владелец — чеки приходят сюда.");
    }
    if (OWNER) {
      // Владелец уже есть: молча отказываем, не подсказывая, что код вообще есть.
      return send(chat, WELCOME, MAIN_KB);
    }
    if (code !== CLAIM_CODE) {
      return send(
        chat,
        "Код не подошёл.\n\nОн показан в окне, где запущен бот, — там строка " +
          "<i>«Чтобы получать чеки сюда…»</i>. Отправьте <code>/owner КОД</code>.",
      );
    }
    OWNER = String(chat);
    const saved = setEnvValue("OWNER_CHAT_ID", OWNER);
    log(`  Владелец назначен: ${OWNER}${saved ? " (записано в .env.local)" : " (только на это время)"}`);
    const waiting = pendingReceipts().length;
    await send(
      chat,
      "✅ Готово. Чеки и оплаты теперь приходят сюда." +
        (saved ? "" : "\n\nЗаписать в .env.local не вышло — после перезапуска придётся повторить.") +
        (waiting ? `\n\nВ очереди уже ${waiting} чек(ов) — пересылаю их сейчас.` : ""),
    );
    // Всё, что пришло, пока владельца не было, досылаем разом.
    if (waiting) await flushPending();
    return;
  }

  if (awaitingReceipt.has(chat)) {
    return send(chat, "Жду скриншот перевода — прикрепите его как фото или файл.");
  }

  return send(chat, WELCOME, MAIN_KB);
}

async function onCallback(q) {
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
      awaitingReceipt.add(chat);
      return send(chat, "Пришлите скриншот перевода одним сообщением — фото или файлом.");
    default:
      if (q.data?.startsWith("buy_")) return sendInvoice(chat, q.data.slice(4));
      if (q.data?.startsWith("ok_") || q.data?.startsWith("no_")) return decideReceipt(q);
  }
}

/** Владелец нажал «Подтвердить» или «Отклонить» под чеком. */
async function decideReceipt(q) {
  const chat = q.message.chat.id;
  // Решать может только владелец. Кнопки видит лишь он, но проверяем всё равно.
  if (!OWNER || String(OWNER) !== String(chat)) return;

  const approve = q.data.startsWith("ok_");
  const id = q.data.slice(3);
  const rec = readReceipts().find((r) => r.id === id);
  if (!rec) return call("editMessageText", {
    chat_id: chat, message_id: q.message.message_id, text: "Этот чек уже не найден.",
  });
  if (rec.status !== "pending") return call("editMessageText", {
    chat_id: chat, message_id: q.message.message_id,
    text: `Уже обработан: ${rec.status === "approved" ? "подтверждён" : "отклонён"}.`,
  });

  updateReceipt(id, { status: approve ? "approved" : "rejected", decidedAt: new Date().toISOString() });

  // Убираем кнопки у сообщения владельца и подписываем решение.
  await call("editMessageText", {
    chat_id: chat, message_id: q.message.message_id,
    text: approve ? "✅ Чек подтверждён — пользователю отправлено уведомление."
                  : "✖️ Чек отклонён — пользователю отправлено уведомление.",
  });
  // Сообщаем плательщику.
  await send(rec.chat, approve
    ? "✅ Оплата подтверждена. Тариф активирован — спасибо!"
    : "✖️ Оплата не подтверждена. Если это ошибка, пришлите чёткий скриншот перевода ещё раз или напишите нам.");
}

/* ── polling loop ─────────────────────────────────────────────────────────── */

let offset = 0;

async function poll() {
  try {
    const res = await call("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message", "callback_query", "pre_checkout_query"],
    });
    for (const u of res.result ?? []) {
      offset = u.update_id + 1;
      try {
        if (u.pre_checkout_query) {
          // Must be answered within 10 seconds or Telegram cancels the payment.
          await call("answerPreCheckoutQuery", { pre_checkout_query_id: u.pre_checkout_query.id, ok: true });
        } else if (u.callback_query) {
          await onCallback(u.callback_query);
        } else if (u.message) {
          await onMessage(u.message);
        }
      } catch (e) {
        console.error("  ! update:", e.message);
      }
    }
  } catch (e) {
    console.error("  ! poll:", e.message);
    await new Promise((r) => setTimeout(r, 3000));
  }
  setImmediate(poll);
}

/* ── start ────────────────────────────────────────────────────────────────── */

log("");
log("  Ищу путь до Telegram...");

const found = await findRoute({ token: TOKEN, explicit: PROXY, log });

if (!found) {
  log("");
  log("  ОШИБКА СЕТИ: не удалось достучаться до api.telegram.org");
  log("  Ни напрямую, ни через прокси, которые нашлись на этом компьютере.");
  await diagnose();
  log("");
  log("  У многих провайдеров в России адрес api.telegram.org заблокирован.");
  log("  Сам мессенджер при этом работает — он ходит другим путём.");
  log("");
  log("  Что делать, любой из вариантов:");
  log("   1. В VPN-клиенте переключить режим с Proxy на TUN и запустить снова.");
  log("      В режиме Proxy через VPN идёт только браузер, программы — нет.");
  log("   2. Прописать прокси в .env.local строкой:");
  log("          TG_PROXY=socks5://127.0.0.1:2080");
  log("      (адрес и порт посмотрите в настройках своего VPN-клиента)");
  log("   3. Запустить бота на сервере за пределами блокировки.");
  process.exit(1);
}

AGENT = found.agent;
const me = found.me;
log(`  Путь до Telegram: ${found.route.label}`);

if (!me.ok) {
  log("");
  log("  ОШИБКА: Telegram не принял токен.");
  log("  Ответ Telegram: " + (me.description ?? "нет описания"));
  log("");
  log("  Чаще всего это значит, что токен отозван или скопирован с опечаткой.");
  log("  Возьмите новый в @BotFather (/mybots -> API Token) и впишите в .env.local.");
  process.exit(1);
}

log("");
log(`  Бот @${me.result.username} запущен.`);
log(`  Файл настроек: ${envPath}`);
if (!OWNER) {
  log("");
  log("  Чеки пока некуда пересылать — владелец не назначен.");
  log("");
  log(`  Чтобы получать чеки сюда, напишите боту:  /owner ${CLAIM_CODE}`);
  log("  Код действует, пока открыто это окно, и виден только вам.");
} else {
  log(`  Чеки пересылаются: ${OWNER}`);
}
log("");
log("  Окно не закрывать — бот отвечает, пока оно открыто.");

/* Напоминание о непроверенных чеках: при старте и затем раз в несколько часов.
   Это и есть «триггер на время» — не автопроверка (её сделать нельзя), а то,
   чтобы забытый чек не завис молча. */
async function remindPending() {
  if (!OWNER) return;
  const n = pendingReceipts().length;
  if (n > 0) {
    await send(OWNER, `🔔 Непроверенных чеков: <b>${n}</b>.\nОткрыть список — команда /pending`);
  }
}
if (OWNER) {
  // Небольшая задержка на старте, чтобы сеть успела подняться.
  setTimeout(remindPending, 5000);
}
setInterval(remindPending, REMIND_EVERY_MS);

poll();
