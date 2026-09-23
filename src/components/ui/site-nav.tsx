"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { UserMenu } from "@/components/ui/user-menu";
import { PaymentButton } from "@/components/ui/payment-dialog";

/**
 * One nav for the whole site. Section links are anchors on the landing page and
 * absolute links everywhere else, so they work from any route.
 */
export const NAV_ITEMS: { key: string; hash?: string; href?: string }[] = [
  { key: "nav.features", hash: "#features" },
  { key: "nav.models", hash: "#models" },
  { key: "nav.pricing", href: "/pricing" },
  { key: "nav.download", href: "/download" },
  { key: "nav.faq", href: "/faq" },
  { key: "nav.contacts", href: "/contacts" },
];

const linkClass =
  "whitespace-nowrap text-[11px] text-foreground/70 transition-colors hover:text-foreground sm:text-xs md:text-[13px]";

/** "Войти" until the browser reports a session, then the account avatar menu. */
function AuthLink() {
  const { account, ready } = useAuth();
  const { t } = useT();
  if (ready && account) return <UserMenu account={account} />;
  return (
    <Link href="/login" className={`${linkClass} font-medium text-foreground/90`}>
      {t("nav.signin")}
    </Link>
  );
}

export function SiteNav({ onLanding = false }: { onLanding?: boolean }) {
  const { t } = useT();
  return (
    // On the landing the nav sits over the hero video. The video is absolutely
    // positioned, so a static nav would paint underneath it — hence the
    // explicit positioning and z-index here.
    <div className={onLanding ? "absolute inset-x-0 top-0 z-30 flex justify-center" : "flex justify-center"}>
      <nav className="flex max-w-[96vw] flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-b-2xl bg-black px-5 py-2.5 md:gap-x-7 md:rounded-b-3xl md:px-8 lg:gap-x-8">
        {!onLanding && (
          <Link href="/" className={`${linkClass} font-semibold text-foreground`}>
            AI HUB
          </Link>
        )}
        {NAV_ITEMS.map((n) => {
          const href = n.href ?? (onLanding ? n.hash! : `/${n.hash}`);
          return n.hash && onLanding ? (
            <a key={n.key} href={href} className={linkClass}>{t(n.key)}</a>
          ) : (
            <Link key={n.key} href={href} className={linkClass}>{t(n.key)}</Link>
          );
        })}
        <PaymentButton className={linkClass}>{t("nav.payment")}</PaymentButton>
        <AuthLink />
      </nav>
    </div>
  );
}
