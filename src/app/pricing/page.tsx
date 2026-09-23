"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/ui/site-nav";
import { SiteFooter } from "@/components/ui/site-footer";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

/** Prices are the same numbers in every language; only the wording differs. */
const PRICE: Record<string, { monthly: number; yearly: number; popular?: boolean }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 490, yearly: 4900, popular: true },
  ultra: { monthly: 1490, yearly: 14900 },
};

export default function PricingPage() {
  const { lang } = useT();
  const c = CONTENT[lang];
  const [yearly, setYearly] = useState(false);
  const rub = (n: number) => n.toLocaleString(lang === "ru" ? "ru-RU" : lang) + " ₽";

  return (
    <div className="min-h-screen bg-black">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-display text-5xl tracking-tight text-white md:text-7xl">{c.pricing.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">{c.pricing.lead}</p>
        </div>

        <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-sm">
          <Button onClick={() => setYearly(false)} variant={!yearly ? "default" : "ghost"} size="sm" className="rounded-full">
            {c.landing.monthly}
          </Button>
          <Button onClick={() => setYearly(true)} variant={yearly ? "default" : "ghost"} size="sm" className="rounded-full">
            {c.landing.yearly} <span className="ml-1 text-emerald-400">{c.landing.save}</span>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {c.plans.map((pl) => {
            const p = PRICE[pl.id];
            const perMonth = p.monthly === 0 ? 0 : yearly ? Math.round(p.yearly / 12) : p.monthly;
            const billed =
              p.monthly === 0
                ? c.landing.freeForever
                : yearly
                  ? `${c.landing.billedYearly} · ${rub(p.yearly)}`
                  : c.landing.billedMonthly;
            return (
              <div
                key={pl.id}
                className={`relative flex flex-col rounded-3xl border p-6 ${p.popular ? "border-white/25 bg-white/[0.03]" : "border-white/10"}`}
              >
                {p.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    {c.landing.popular}
                  </span>
                )}
                <div className="text-lg font-semibold text-white">{pl.name}</div>
                <div className="mt-1 text-sm text-white/50">{pl.info}</div>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{p.monthly === 0 ? "0 ₽" : rub(perMonth)}</span>
                  {p.monthly !== 0 && <span className="pb-1 text-sm text-white/50">{c.landing.perMonth}</span>}
                </div>
                <div className="mt-1 text-xs text-white/50">{billed}</div>
                <ul className="mt-6 flex-1 space-y-3">
                  {pl.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.4} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.monthly === 0 ? "/register" : `/register?plan=${pl.id}`}
                  className={buttonVariants({ variant: p.popular ? "default" : "outline", size: "full", className: "mt-7" })}
                >
                  {p.monthly === 0 ? c.landing.startFree : `${c.landing.choose} ${pl.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
