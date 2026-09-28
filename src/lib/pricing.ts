/**
 * Plan prices, one table per site language, instead of a single hardcoded
 * RUB number formatted with different digit grouping. A Polish or Ukrainian
 * visitor paying in rubles makes no sense, so each language gets its own
 * currency and its own (roughly FX-converted, then rounded to a normal
 * subscription price) numbers — not a live-converted RUB figure, which
 * would show ugly amounts like "3.44 $" and drift every time the rate
 * moves. Source of truth for the actual charge is still RUB (see
 * bot/bot.mjs's PLANS — that's what Telegram Stars actually bills), these
 * are display-only estimates for people paying by card in their own market.
 *
 * Rates used for the conversion (2026-09-26, cbr.ru): 1 USD ≈ 84.34 RUB,
 * 1 PLN ≈ 21.96 RUB, 1 UAH ≈ 1.88 RUB. Revisit these numbers occasionally —
 * they're not live.
 */

export type PlanId = "free" | "pro" | "ultra";
export type Lang = "ru" | "en" | "uk" | "pl";

export const CURRENCY: Record<Lang, { code: string; symbol: string; locale: string }> = {
  ru: { code: "RUB", symbol: "₽", locale: "ru-RU" },
  en: { code: "USD", symbol: "$", locale: "en-US" },
  uk: { code: "UAH", symbol: "₴", locale: "uk-UA" },
  pl: { code: "PLN", symbol: "zł", locale: "pl-PL" },
};

/** Monthly / yearly price per plan, per language. Yearly = 10× monthly in
 *  every currency (two months free), matching the "-17%" badge on the
 *  billing toggle. */
export const PRICES: Record<Lang, Record<PlanId, { monthly: number; yearly: number }>> = {
  ru: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 290, yearly: 2900 },
    ultra: { monthly: 690, yearly: 6900 },
  },
  en: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 3.99, yearly: 39.99 },
    ultra: { monthly: 8.99, yearly: 89.99 },
  },
  uk: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 160, yearly: 1600 },
    ultra: { monthly: 380, yearly: 3800 },
  },
  pl: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 15, yearly: 150 },
    ultra: { monthly: 35, yearly: 350 },
  },
};

/** Formats an amount in the given language's currency, e.g. "290 ₽",
 *  "$3.99", "35 zł". Falls back to ru/RUB for an unknown language. */
export function formatPrice(lang: string, amount: number): string {
  const cur = CURRENCY[(lang as Lang) in CURRENCY ? (lang as Lang) : "ru"];
  if (amount === 0) return `0 ${cur.symbol}`;
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: "currency",
      currency: cur.code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${cur.symbol}`;
  }
}

export function planPrice(lang: string, planId: string): { monthly: number; yearly: number } {
  const table = PRICES[(lang as Lang) in PRICES ? (lang as Lang) : "ru"];
  return table[(planId as PlanId) in table ? (planId as PlanId) : "free"];
}
