"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/ui/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

export default function FaqPage() {
  const { lang } = useT();
  const c = CONTENT[lang].faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PageShell title={c.title} lede={c.lead}>
      <div className="divide-y divide-white/10 border-y border-white/10">
        {c.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="py-1">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-white transition-colors hover:text-white/80 md:text-lg"
              >
                {item.q}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 text-xl leading-none text-white/40"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="max-w-2xl pb-5 text-sm leading-relaxed text-white/60 md:text-base">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link href="/contacts" className={buttonVariants()}>{c.ask}</Link>
      </div>
    </PageShell>
  );
}
