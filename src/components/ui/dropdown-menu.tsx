"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Small dropdown menu, hand-rolled because @radix-ui/react-dropdown-menu is
 * not installed in this project. Covers what we actually use: click to open,
 * click outside or Escape to close, arrow keys to move between items, and the
 * trigger gets focus back when the menu closes.
 */
type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};
const MenuCtx = React.createContext<Ctx | null>(null);

function useMenu() {
  const ctx = React.useContext(MenuCtx);
  if (!ctx) throw new Error("DropdownMenu parts must be used inside <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  return <MenuCtx.Provider value={{ open, setOpen, triggerRef }}>{children}</MenuCtx.Provider>;
}

export function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen, triggerRef } = useMenu();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const { open, setOpen, triggerRef } = useMenu();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = Array.from(
        ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
      );
      if (!items.length) return;
      e.preventDefault();
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[next]?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, triggerRef]);

  const side = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "absolute top-full z-50 mt-2 min-w-[15rem] overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-1 text-white shadow-xl",
            side,
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  onSelect,
  ...props
}: Omit<React.ComponentProps<"button">, "onSelect"> & {
  destructive?: boolean;
  onSelect?: () => void;
}) {
  const { setOpen } = useMenu();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        onSelect?.();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left text-sm font-medium outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10",
        destructive ? "text-red-400 hover:bg-red-500/10 focus-visible:bg-red-500/10" : "text-white",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-white/10", className)} />;
}
