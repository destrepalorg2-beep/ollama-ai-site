"use client";

import { PageShell } from "@/components/ui/page-shell";
import { CONTENT } from "@/lib/content";
import { useT } from "@/lib/i18n";
import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
  const { lang } = useT();
  const c = CONTENT[lang].terms;

  return (
    <PageShell title={c.title} lede={c.lead}>
      <div className="space-y-8">
        {c.sections.map((s) => (
          <section key={s.title}>
            <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
            <p className="leading-relaxed text-white/60">{s.body}</p>
          </section>
        ))}

        <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <ShieldCheck className="mt-1 size-5 shrink-0 text-white/50" strokeWidth={1.6} />
          <p className="text-sm italic leading-relaxed text-white/55">{c.note}</p>
        </div>
      </div>
    </PageShell>
  );
}
