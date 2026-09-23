"use client";

import { useEffect, useState } from "react";
import { hub } from "@/components/landing/config";

export function ServerStatus({ className = "" }: { className?: string }) {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(hub.apiBase + "/api/status", { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(id);
        if (alive) setOnline(res.ok);
      } catch {
        if (alive) setOnline(false);
      }
    };
    check();
    const t = setInterval(check, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const color = online == null ? "#a3a3a3" : online ? "#4ade80" : "#ef4444";
  const label = online == null ? "Проверка…" : online ? "Сервер онлайн" : "Сервер офлайн";
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-white/70 ${className}`} title={hub.apiBase}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
