"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Vertical tabs without @radix-ui/react-tabs (not installed). Keeps the parts
 * that matter: one panel at a time, proper tab/tabpanel roles, arrow-key
 * navigation, and only the active tab in the tab order.
 */
type Ctx = { value: string; setValue: (v: string) => void };
const TabsCtx = React.createContext<Ctx | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs parts must be used inside <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsCtx.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col gap-6 sm:flex-row", className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    if (!tabs.length) return;
    e.preventDefault();
    const i = tabs.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    tabs[next]?.focus();
    tabs[next]?.click();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      className={cn("flex shrink-0 flex-row gap-1 overflow-x-auto sm:flex-col", className)}
    >
      {children}
    </div>
  );
}

export function TabsTab({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active, setValue } = useTabs();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "relative flex items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm transition-colors outline-none",
        selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {selected && (
        <motion.span
          layoutId="vtab-marker"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-foreground max-sm:inset-x-0 max-sm:inset-y-auto max-sm:bottom-0 max-sm:h-[2px] max-sm:w-auto"
        />
      )}
      {children}
    </button>
  );
}

export function TabsPanel({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active } = useTabs();
  if (active !== value) return null;
  return (
    <motion.div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn("min-w-0 flex-1", className)}
    >
      {children}
    </motion.div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn("h-px w-full shrink-0 bg-border", className)} />;
}
