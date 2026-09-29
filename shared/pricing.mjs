/**
 * Single source of truth for the actual charged price: RUB and Telegram
 * Stars, since that's what both the site (bank transfer / card, RUB) and
 * the bot (Telegram Stars) ultimately bill in. Both `src/lib/pricing.ts`
 * (site) and `bot/bot.mjs` (Telegram bot) import BASE_PRICES from here
 * instead of hardcoding their own copies — change a price once, here,
 * and both surfaces pick it up automatically instead of drifting apart
 * (previously each file hardcoded its own copy of 290/690/3480/8280 and
 * had to be kept in sync by hand).
 *
 * Plain ESM .mjs (not .ts) on purpose: bot.mjs is a standalone Node
 * script with no build step, so it needs to `import` this file directly
 * at runtime. The Next.js site imports the same file at build time.
 *
 * Non-RUB prices shown on the site (USD/UAH/PLN in src/lib/pricing.ts)
 * are separate, manually curated, FX-rounded display estimates for
 * visitors paying by card in their own market — not a live conversion of
 * these RUB numbers, and intentionally not derived from this file (a
 * live-converted "$3.44" reads worse than a rounded "$3.99", and would
 * drift every time the rate moves). See the comment in pricing.ts.
 */

/**
 * Monthly price per plan: RUB (what the site charges) and Telegram Stars
 * (what the bot charges). Both are the actual billed amount, chosen and
 * sanity-checked by hand against @BotFather's Stars rate — NOT derived
 * from a single formula, because Telegram's own Stars pricing isn't
 * perfectly linear and forcing one rate would silently shift an already
 * agreed-on price by a star or two. `starsPerRub` here is purely
 * informational (what rate this Stars price implies), so a future price
 * change can be sanity-checked against @BotFather's current rate before
 * picking a new Stars number.
 */
export const BASE_PRICES = {
  free: { rub: 0, stars: 0 },
  pro: { rub: 290, stars: 235 },
  ultra: { rub: 690, stars: 560 },
};

/** Yearly = exactly 12× monthly, no discount (owner's explicit choice,
 *  2026-09-29) — applies uniformly to RUB and Stars alike. Both bot.mjs
 *  and pricing.ts derive their yearly figures through this one function
 *  so the ×12 relationship can't drift out of sync either. */
export function yearlyOf(monthly) {
  return monthly * 12;
}

/** {monthly, yearly} RUB + Stars figures for a plan id, built from
 *  BASE_PRICES — what bot.mjs's PLANS and pricing.ts's `ru` table are
 *  both generated from. */
export function planPricing(planId) {
  const base = BASE_PRICES[planId] ?? BASE_PRICES.free;
  return {
    rub: { monthly: base.rub, yearly: yearlyOf(base.rub) },
    stars: { monthly: base.stars, yearly: yearlyOf(base.stars) },
    starsPerRub: base.rub > 0 ? +(base.stars / base.rub).toFixed(4) : 0,
  };
}
