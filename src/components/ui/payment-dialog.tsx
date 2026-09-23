"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, CreditCard, Send, Smartphone, Star } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";
import { receiptLink, starsLink } from "@/lib/telegram";

/** Payment details. Digits live here once; formatting is derived. */
const DETAILS = {
  phone: "+79515334391",
  cardOzon: "2204321178401139",
  cardTbank: "2200701990693829",
  ton: "UQAF9LJyeKJQrM0wyoHeBsDxJLqLcYBVrEVgtl_vSEm54oos",
};

const groupCard = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ");
const prettyPhone = (n: string) => n.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 $1 $2-$3-$4");

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Clipboard API needs a secure context — fall back to the old command.
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
  }
}

function Row({
  icon: Icon,
  label,
  value,
  display,
  note,
  mono,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  display: string;
  note: string;
  mono?: boolean;
}) {
  const { lang } = useT();
  const c = CONTENT[lang].payment;
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-white/50" strokeWidth={1.6} />
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-white/40">{label}</div>
          <div className={`mt-1 break-all text-white ${mono ? "font-mono text-[12px] leading-relaxed" : "text-base"}`}>
            {display}
          </div>
          <div className="mt-1.5 text-xs leading-relaxed text-white/45">{note}</div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={async () => {
          await copyText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? c.copied : c.copy}
      </Button>
    </div>
  );
}

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
  const c = CONTENT[lang].payment;

  return (
    <Dialog open={open} onClose={onClose} title={c.title}>
      <p className="text-sm leading-relaxed text-white/60">{c.lead}</p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <span className="text-[11px] uppercase tracking-widest text-white/40">{c.recipientLabel}</span>
        <span className="text-sm font-medium text-white">{c.recipient}</span>
      </div>

      {/* Telegram first: it is the path that needs no manual confirmation. */}
      <div className="mt-5">
        <div className="mb-2 text-[11px] uppercase tracking-widest text-white/40">{c.tgTitle}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={starsLink(plan)}
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

      <div className="mt-5 space-y-2">
        <Row icon={Smartphone} label={c.sbp} value={DETAILS.phone} display={prettyPhone(DETAILS.phone)} note={c.sbpNote} />
        <Row icon={CreditCard} label={c.cardOzon} value={DETAILS.cardOzon} display={groupCard(DETAILS.cardOzon)} note={c.cardNote} />
        <Row icon={CreditCard} label={c.cardTbank} value={DETAILS.cardTbank} display={groupCard(DETAILS.cardTbank)} note={c.cardNote} />
        <Row icon={Coins} label={c.crypto} value={DETAILS.ton} display={DETAILS.ton} note={c.cryptoNote} mono />
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
