import Link from "next/link";
import { Globe } from "lucide-react";
import { hub } from "@/components/landing/config";
import { ServerStatus } from "@/components/landing/server-status";

/** Liquid-glass pill navigation — the site's existing menu, restyled. */
export function SiteHeader({ sticky = false }: { sticky?: boolean }) {
  return (
    <div className={`${sticky ? "sticky top-0" : "relative"} z-30 px-6 py-6`}>
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <Globe className="h-6 w-6" strokeWidth={1.6} /> {hub.name}
          </Link>
          <div className="ml-8 hidden items-center gap-8 md:flex">
            {hub.nav.slice(0, 4).map((n) => (
              <Link key={n.href} href={n.href} className="text-sm font-medium text-white/80 transition-colors hover:text-white">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ServerStatus className="hidden lg:inline-flex" />
          <Link href="/login" className="text-sm font-medium text-white/90 transition-colors hover:text-white">Войти</Link>
          <Link href="/pricing" className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5">
            Начать
          </Link>
        </div>
      </div>
    </div>
  );
}
