"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Star } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { isOfflineSession, useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";
import { receiptLink, starsLink } from "@/lib/telegram";

// Manual payment details (phone / card numbers / crypto wallet) used to be
// hardcoded here and rendered in plain text on this public page. Personal
// bank details on a public site invite card-number harvesting and spam, so
// that block was removed entirely — Telegram Stars and "send receipt to the
// bot" are the only payment paths shown now. If a manual-transfer option is
// needed again later, collect it through the bot chat instead of publishing
// it on the page.

export function PaymentDialog({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan?: string;
}) {
  const { lang } = useT();
  const { account } = useAuth();
  const c = CONTENT[lang].payment;

  // When the visitor is signed in and a specific plan was picked, get a
  // one-time token that links the Stars payment back to their account, so
  // the bot can flip their plan the moment Telegram confirms the payment
  // instead of waiting on a manual check. Silently falls back to the old,
  // unlinked flow if this fails for any reason (not signed in, offline
  // session, network hiccup) — nothing here blocks paying.
  const [intentToken, setIntentToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    setIntentToken(undefined);
    if (!open || !plan || !account || isOfflineSession(account)) return;
    let cancelled = false;
    fetch("/api/payment/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${account.token}` },
      body: JSON.stringify({ plan }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.token) setIntentToken(d.token);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, plan, account?.token]);

  return (
    <Dialog open={open} onClose={onClose} title={c.title}>
      <p className="text-sm leading-relaxed text-white/60">{c.lead}</p>

      <div className="mt-5">
        <div className="mb-2 text-[11px] uppercase tracking-widest text-white/40">{c.tgTitle}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={starsLink(plan, intentToken)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 p-4 transition-colors hover:border-white/25"
          >
            <Star className="size-4 text-white/60" strokeWidth={1.6} />
            <div className="mt-3 text-sm font-medium text-white">{c.tgStars}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/45">{c.tgStarsNote}</div>
          </a>
          <a
            href={receiptLink(plan)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 p-4 transition-colors hover:border-white/25"
          >
            <Send className="size-4 text-white/60" strokeWidth={1.6} />
            <div className="mt-3 text-sm font-medium text-white">{c.tgReceipt}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/45">{c.tgReceiptNote}</div>
          </a>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="text-sm font-semibold text-white">{c.afterTitle}</div>
        <p className="mt-2 text-xs leading-relaxed text-white/55">{c.after}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={receiptLink(plan)} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm" })}>
            {c.tgReceipt}
          </a>
          <Link href="/pricing" onClick={onClose} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {c.plans}
          </Link>
        </div>
      </div>
    </Dialog>
  );
}

/** Button that opens the payment dialog. */
export function PaymentButton({
  plan,
  className,
  children,
}: {
  plan?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <PaymentDialog open={open} onClose={() => setOpen(false)} plan={plan} />
    </>
  );
}
