/**
 * Telegram bot links.
 *
 * Only the bot's PUBLIC @username lives here — it is visible to anyone who
 * opens the bot anyway. The bot TOKEN must never reach this file or any other
 * client-side code: anything shipped to the browser is readable by every
 * visitor, and the token is full control of the bot. Keep it server-side, in
 * .env.local as TELEGRAM_BOT_TOKEN, and read it only from API routes.
 */
export const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TG_BOT?.replace(/^@/, "") || "paybotayhub_bot";

const base = `https://t.me/${BOT_USERNAME}`;

/** Deep link that opens the bot; `start` lands in the bot's /start payload. */
export function botLink(start?: string) {
  return start ? `${base}?start=${encodeURIComponent(start)}` : base;
}

/** Bot opens straight on the receipt flow for the given plan. */
export const receiptLink = (plan?: string) => botLink(plan ? `receipt_${plan}` : "receipt");

/**
 * Bot opens straight on the Telegram Stars invoice for the given plan.
 * `intentToken` is the one-time token from /api/payment/intent — when
 * present, the bot can auto-upgrade this account's plan the instant the
 * Stars payment succeeds. Without it (not signed in, or the token request
 * failed) the flow still works, it just isn't linked to an account and the
 * plan gets set by hand, same as before this existed.
 */
export const starsLink = (plan?: string, intentToken?: string) =>
  botLink(plan ? `stars_${plan}${intentToken ? `_${intentToken}` : ""}` : "stars");
