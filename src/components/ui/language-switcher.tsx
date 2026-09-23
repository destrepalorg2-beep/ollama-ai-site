"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages } from "lucide-react";

import { LANGS, useT, type Lang } from "@/lib/i18n";

/** Floating language picker, bottom-right on every page. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={boxRef} className="fixed bottom-5 right-5 z-[200]">
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t("lang.title")}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full right-0 mb-2 min-w-[11rem] overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-1 shadow-xl"
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => {
                    setLang(l.code as Lang);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10"
                >
                  <span>{l.label}</span>
                  {l.code === lang && <Check className="size-4 shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t("lang.title")}
        className="flex items-center gap-2 rounded-full border border-white/12 bg-[#141414]/90 px-3.5 py-2.5 text-xs font-medium text-white/80 shadow-lg backdrop-blur transition-colors hover:border-white/25 hover:text-white"
      >
        <Languages className="size-4" strokeWidth={1.7} />
        {current.short}
      </button>
    </div>
  );
}
