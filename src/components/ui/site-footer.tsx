"use client";

import Link from "next/link";
import { CreditCard, Globe, MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PaymentButton } from "@/components/ui/payment-dialog";

/**
 * Four-column site footer.
 *
 * No newsletter box and no email, as asked. Social icons are left out on
 * purpose too: there are no real accounts behind them yet, and buttons that go
 * nowhere are worse than no buttons. The three links below all resolve.
 */
const COLUMNS: { title: string; links: { key: string; href: string }[] }[] = [
  {
    title: "foot.product",
    links: [
      { key: "nav.features", href: "/#features" },
      { key: "nav.models", href: "/#models" },
      { key: "nav.pricing", href: "/pricing" },
      { key: "nav.download", href: "/download" },
    ],
  },
  {
    title: "foot.help",
    links: [
      { key: "nav.faq", href: "/faq" },
      { key: "nav.contacts", href: "/contacts" },
    ],
  },
  {
    title: "foot.account",
    links: [
      { key: "nav.signin", href: "/login" },
      { key: "foot.register", href: "/register" },
      { key: "foot.profile", href: "/profile" },
      { key: "foot.terms", href: "/terms" },
    ],
  },
];

const DIRECT = [{ icon: MessageCircle, key: "foot.write", href: "/contacts" }];

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="mt-16 w-full rounded-t-xl border-t border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center justify-center gap-2 text-white sm:justify-start">
              <Globe className="h-7 w-7" strokeWidth={1.6} />
              <span className="text-2xl font-semibold">AI HUB</span>
            </Link>

            <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-white/50 sm:mx-0 sm:max-w-xs sm:text-left">
              {t("foot.tagline")}
            </p>

            <ul className="mt-8 flex flex-col items-center gap-3 sm:items-start">
              <li>
                <PaymentButton className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
                  <CreditCard className="size-4 shrink-0" strokeWidth={1.6} />
                  {t("nav.payment")}
                </PaymentButton>
              </li>
              {DIRECT.map(({ icon: I, key, href }) => (
                <li key={key}>
                  <Link href={href} className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
                    <I className="size-4 shrink-0" strokeWidth={1.6} />
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-2">
            {COLUMNS.map((col) => (
              <div key={col.title} className="text-center sm:text-left">
                <p className="text-lg font-medium text-white">{t(col.title)}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {col.links.map(({ key, href }) => (
                    <li key={key}>
                      <Link href={href} className="text-white/60 transition-colors hover:text-white">
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="text-center text-sm sm:flex sm:justify-between sm:text-left">
            <p className="text-white/40">{t("foot.privacy")}</p>
            <p className="mt-4 text-white/40 sm:order-first sm:mt-0">
              © {new Date().getFullYear()} AI HUB
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
