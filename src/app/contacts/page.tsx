"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "err"; text: string };

export default function ContactsPage() {
  const { lang } = useT();
  const c = CONTENT[lang].contacts;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const channels = [
    { icon: Mail, label: c.mail, value: "support@aihub.local", href: "mailto:support@aihub.local" },
    { icon: MessageCircle, label: c.telegram, value: "@aihub_support", href: "https://t.me/aihub_support" },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !text.trim()) {
      setStatus({ kind: "err", text: c.errEmpty });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("http://localhost:3000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, description: text, type: "contact" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "ok" });
      setName(""); setContact(""); setText("");
    } catch {
      setStatus({ kind: "err", text: c.errServer });
    }
  };

  const field = "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

  return (
    <PageShell title={c.title} lede={c.lead}>
      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map(({ icon: I, label, value, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/25"
          >
            <I className="h-5 w-5 text-white/60" strokeWidth={1.6} />
            <div className="mt-4 text-xs uppercase tracking-widest text-white/40">{label}</div>
            <div className="mt-1 break-all text-sm text-white">{value}</div>
          </a>
        ))}
      </div>

      <form onSubmit={submit} className="mt-12 space-y-5">
        <h2 className="text-xl font-semibold text-white">{c.formTitle}</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">{c.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePlaceholder} className={field} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">{c.contact}</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={c.contactPlaceholder} className={field} />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">{c.message}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={c.messagePlaceholder} className={`${field} resize-y`} />
        </label>

        {status.kind === "ok" && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{c.ok}</p>
        )}
        {status.kind === "err" && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{status.text}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={status.kind === "sending"}>
            {status.kind === "sending" ? c.sending : c.submit}
          </Button>
          <Link href="/faq" className={buttonVariants({ variant: "ghost" })}>{c.seeFaq}</Link>
        </div>
      </form>
    </PageShell>
  );
}
