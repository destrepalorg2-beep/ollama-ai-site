"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple, CreditCard, Download, LogOut, Monitor, Smartphone, Terminal, UserIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator, Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/vertical-tabs";
import { PaymentDialog } from "@/components/ui/payment-dialog";
import { displayName, initials, isOfflineSession, signOut, useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

/* Monthly price in rubles per plan — the only bit that isn't translated
   text, so it stays out of content.ts. Everything else (plan name, credits
   line, OS requirements) is read from CONTENT so it follows the language
   switcher instead of duplicating a hardcoded Russian copy here. */
const MONTHLY_RUB: Record<string, number> = { free: 0, pro: 490, ultra: 1490 };
const BUILD_ICONS = [Monitor, Apple, Terminal];
const BUILD_FILES = ["AI-Hub-Setup.exe", "AI-Hub.dmg", "AI-Hub.AppImage"];

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
    <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground">{value}</div>
  </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const { account, ready } = useAuth();
  const { t, lang } = useT();
  const [tab, setTab] = useState("profile");
  const [payOpen, setPayOpen] = useState(false);
  const [build, setBuild] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !account) router.replace("/login");
  }, [ready, account, router]);

  // Deep link from the account menu: /profile?tab=subscription
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "subscription" || t === "download") setTab(t);
    } catch {}
  }, []);

  if (!ready || !account) {
    return (
      <div className="app-theme flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("profile.loading")}</p>
      </div>
    );
  }

  const name = displayName(account);
  const perMonth = CONTENT[lang].landing.perMonth;
  const PLANS: Record<string, { name: string; price: string; credits: string }> = Object.fromEntries(
    CONTENT[lang].plans.map((p) => [
      p.id,
      {
        name: p.name,
        price: MONTHLY_RUB[p.id] === 0 ? "0 ₽" : `${MONTHLY_RUB[p.id].toLocaleString("ru-RU")} ₽ ${perMonth}`,
        credits: p.feats[0],
      },
    ]),
  );
  const BUILDS = CONTENT[lang].download.builds.map((b, i) => ({
    icon: BUILD_ICONS[i],
    os: b.os,
    req: b.req,
    file: BUILD_FILES[i],
  }));
  const plan = account.plan ? PLANS[account.plan] : null;

  return (
    <div className="app-theme min-h-screen">
      <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} plan={account.plan ?? undefined} />
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-foreground">AI HUB</Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">{t("auth.home")}</Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {initials(account)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">{name}</h1>
            <p className="truncate text-sm text-muted-foreground">{account.email ?? t("profile.noEmail")}</p>
          </div>
        </div>

        {isOfflineSession(account) && (
          <div className="mb-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {t("profile.offline")}
          </div>
        )}

        <Tabs defaultValue="profile" value={tab} onValueChange={setTab}>
          <div className="flex shrink-0 flex-col gap-4 sm:w-48">
          <TabsList>
            <TabsTab value="profile" className="justify-start">
              <UserIcon className="size-4" /> {t("profile.tab.profile")}
            </TabsTab>
            <TabsTab value="subscription" className="justify-start">
              <CreditCard className="size-4" /> {t("profile.tab.subscription")}
            </TabsTab>
            <TabsTab value="download" className="justify-start">
              <Download className="size-4" /> {t("profile.tab.download")}
            </TabsTab>
          </TabsList>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => { signOut(); router.push("/"); }}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              {t("profile.signout")}
            </Button>
          </div>

          <TabsPanel value="profile">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("profile.data")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("profile.dataDesc")}</p>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <Field label={t("profile.fieldNickname")} value={name} />
                <Field label={t("profile.fieldEmail")} value={account.email ?? t("profile.notSet")} />
                <Field label={t("profile.fieldPlan")} value={plan ? `${plan.name} · ${plan.credits}` : t("profile.planNotChosen")} />
              </div>
            </div>
          </TabsPanel>

          <TabsPanel value="subscription">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("profile.subTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("profile.subDesc")}</p>
              </div>
              <Separator />

              <div className="rounded-md border border-input bg-muted/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("profile.currentPlan")}</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{plan ? plan.name : t("profile.planNone")}</p>
                    {plan && <p className="mt-0.5 text-sm text-muted-foreground">{plan.price} · {plan.credits}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/pricing" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      {plan ? t("profile.changePlan") : t("profile.choosePlan")}
                    </Link>
                    <Button size="sm" onClick={() => setPayOpen(true)}>
                      {t("nav.payment")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {Object.entries(PLANS).map(([id, p]) => {
                  const current = account.plan === id;
                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                        current ? "border-foreground/40 bg-muted/40" : "border-input"
                      }`}
                    >
                      <span className="text-sm text-foreground">
                        {p.name} <span className="text-muted-foreground">· {p.credits}</span>
                      </span>
                      <span className={`text-xs ${current ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {current ? t("profile.connected") : p.price}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("profile.cancelNote")}
              </p>
            </div>
          </TabsPanel>

          <TabsPanel value="download">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("profile.dlTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("profile.dlDesc")}</p>
              </div>
              <Separator />

              <div className="flex flex-col gap-2">
                {BUILDS.map(({ icon: I, os, req, file }) => {
                  const active = build === os;
                  return (
                    <button
                      key={os}
                      type="button"
                      onClick={() => setBuild(active ? null : os)}
                      aria-pressed={active}
                      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        active ? "border-foreground/50 bg-muted/50" : "border-input hover:border-foreground/25"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <I className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
                        <span className="min-w-0">
                          <span className="block text-sm text-foreground">{os}</span>
                          <span className="block truncate text-xs text-muted-foreground">{req}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{file}</span>
                    </button>
                  );
                })}

                <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2.5">
                  <Smartphone className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
                  <span className="text-sm text-foreground">
                    {t("profile.dlPhone")} <span className="text-muted-foreground">· {t("profile.dlPhoneNote")}</span>
                  </span>
                </div>
              </div>

              {/* The button only appears once a build is picked, so it is never
                  ambiguous which file it would hand you. */}
              {build && (
                <Button size="sm" className="self-start" disabled>
                  <Download className="mr-1.5 h-4 w-4" />
                  {t("profile.tab.download")} · {build}
                </Button>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">{t("profile.dlNote")}</p>
            </div>
          </TabsPanel>

        </Tabs>
      </main>
    </div>
  );
}
