"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { hub, rub } from "@/components/landing/config";

export function PricingCards() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-sm">
        <button onClick={() => setYearly(false)} className={`rounded-full px-4 py-1.5 transition-colors ${!yearly ? "bg-white text-black" : "text-white/60"}`}>Помесячно</button>
        <button onClick={() => setYearly(true)} className={`rounded-full px-4 py-1.5 transition-colors ${yearly ? "bg-white text-black" : "text-white/60"}`}>На год <span className="text-emerald-400">−17%</span></button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {hub.plans.map((pl) => {
          const perMonth = pl.monthly === 0 ? 0 : yearly ? Math.round(pl.yearly / 12) : pl.monthly;
          const billed = pl.monthly === 0 ? "Бесплатно навсегда" : yearly ? `оплата за год · ${rub(pl.yearly)}` : "оплата помесячно";
          return (
            <div key={pl.id} className={`liquid-glass relative flex flex-col rounded-3xl p-6 ${pl.popular ? "ring-1 ring-white/25" : ""}`}>
              {pl.popular && <span className="absolute right-5 top-5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">Популярный</span>}
              <div className="text-lg font-semibold text-white">{pl.name}</div>
              <div className="mt-1 text-sm text-white/50">{pl.info}</div>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">{pl.monthly === 0 ? "0 ₽" : rub(perMonth)}</span>
                {pl.monthly !== 0 && <span className="pb-1 text-sm text-white/50">/мес</span>}
              </div>
              <div className="mt-1 text-xs text-white/50">{billed}</div>
              <ul className="mt-6 flex-1 space-y-3">
                {pl.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.4} /> {f}
                  </li>
                ))}
              </ul>
              <Link href={pl.monthly === 0 ? "/register" : `/register?plan=${pl.id}`} className={`mt-7 rounded-xl py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${pl.popular ? "bg-white text-black" : "liquid-glass text-white"}`}>
                {pl.monthly === 0 ? "Начать бесплатно" : `Выбрать ${pl.name}`}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
