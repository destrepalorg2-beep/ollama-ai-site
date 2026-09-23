"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { AuthForm, type Provider } from "@/components/ui/auth-form";
import { Input, Label } from "@/components/ui/input";
import { API_BASE, DEV_MODE, completeSignIn, setPending, signInOffline } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

const MONTHLY_RUB: Record<string, number> = { free: 0, pro: 490, ultra: 1490 };

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useT();
  const perMonth = CONTENT[lang].landing.perMonth;
  const PLANS: Record<string, { name: string; price: string }> = Object.fromEntries(
    CONTENT[lang].plans.map((p) => [
      p.id,
      {
        name: p.name,
        price:
          MONTHLY_RUB[p.id] === 0
            ? `0 ₽ · ${t("register.free")}`
            : `${MONTHLY_RUB[p.id].toLocaleString("ru-RU")} ₽ ${perMonth}`,
      },
    ]),
  );
  const [plan, setPlan] = useState<string | null>(null);
  const [emailFromLink, setEmailFromLink] = useState<string | undefined>(undefined);
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Read ?plan= from the URL directly: useSearchParams would need a Suspense
  // boundary around this page and fails the build without one.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("plan");
      if (p && PLANS[p]) setPlan(p);
      const e = params.get("email");
      if (e) setEmailFromLink(e);
    } catch {}
  }, []);

  const submit = async ({ email, password }: { email: string; password: string }) => {
    setError(null);
    setNotice(null);
    if (nickname.trim().length < 2) {
      setError(t("auth.errorNicknameShort"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname: nickname.trim(), plan: plan || "free" }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPending({ email, nickname: nickname.trim(), plan: plan || "free", userId: data.userId });

        if (data.token) {
          completeSignIn(data.token, { email, nickname: nickname.trim(), plan: plan || "free" });
          router.push("/profile");
        } else {
          router.push("/verify");
        }
        return;
      }
      setError(res.status === 409 ? t("auth.errorEmailTaken") : data.error || t("auth.errorRegisterGeneric"));
    } catch {
      if (DEV_MODE) {
        signInOffline(email, { nickname: nickname.trim(), plan: plan || "free" });
        router.push("/profile");
        return;
      }
      setError(t("auth.errorServerDown"));
    } finally {
      setBusy(false);
    }
  };

  const social = (p: Provider) => {
    setError(null);
    setNotice(t("auth.socialRegisterNotConnected").replace("{provider}", p === "sso" ? "SSO" : p));
  };

  return (
    <div className="app-theme flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-foreground">AI HUB</Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">{t("auth.home")}</Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        {plan && PLANS[plan] && (
          <div className="flex w-full max-w-[380px] items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("register.selectedPlan")}</div>
              <div className="truncate text-sm font-semibold text-foreground">
                {PLANS[plan].name} <span className="font-normal text-muted-foreground">· {PLANS[plan].price}</span>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0 text-xs font-medium text-foreground underline-offset-4 hover:underline">
              {t("register.change")}
            </Link>
          </div>
        )}

        <AuthForm
          mode="register"
          busy={busy}
          error={error}
          notice={notice}
          defaultEmail={emailFromLink}
          onEmailSubmit={submit}
          onSocialSignIn={social}
          onEmailLink={() => setNotice(t("auth.emailLinkNoticeRegister"))}
          extraTop={
            <div className="space-y-2">
              <Label htmlFor="nickname">{t("auth.nickname")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nickname"
                  name="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("auth.nicknamePlaceholder")}
                  className="pl-9"
                  minLength={2}
                  maxLength={50}
                  required
                />
              </div>
            </div>
          }
        />
      </main>
    </div>
  );
}
