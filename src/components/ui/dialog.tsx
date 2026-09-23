"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal dialog without @radix-ui/react-dialog (not installed). Keeps the parts
 * that matter: rendered in a portal so no ancestor can clip it, Escape and
 * backdrop close it, the page behind stops scrolling, and focus returns to
 * whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const opener = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl",
              className,
            )}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="-mr-1 shrink-0 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
