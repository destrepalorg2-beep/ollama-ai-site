"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { AuthForm, type Provider } from "@/components/ui/auth-form";
import { Input, Label } from "@/components/ui/input";
import { API_BASE, DEV_MODE, completeSignIn, setPending, signInOffline } from "@/lib/auth";
import { useT } from "@/lib/i18n";

const PLANS: Record<string, { name: string; price: string }> = {
  free: { name: "Free", price: "0 ₽ · бесплатно" },
  pro: { name: "Pro", price: "490 ₽ / мес" },
  ultra: { name: "Ultra", price: "1 490 ₽ / мес" },
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useT();
  const [plan, setPlan] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Read ?plan= from the URL directly: useSearchParams would need a Suspense
  // boundary around this page and fails the build without one.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("plan");
      if (p && PLANS[p]) setPlan(p);
    } catch {}
  }, []);

  const submit = async ({ email, password }: { email: string; password: string }) => {
    setError(null);
    setNotice(null);
    if (nickname.trim().length < 2) {
      setError("Никнейм минимум 2 символа.");
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
      setError(res.status === 409 ? "Этот email уже зарегистрирован — войдите." : data.error || "Не удалось зарегистрироваться.");
    } catch {
      if (DEV_MODE) {
        signInOffline(email, { nickname: nickname.trim(), plan: plan || "free" });
        router.push("/profile");
        return;
      }
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setBusy(false);
    }
  };

  const social = (p: Provider) => {
    setError(null);
    setNotice(`Регистрация через ${p === "sso" ? "SSO" : p} пока не подключена — используйте email.`);
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
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Выбранный тариф</div>
              <div className="truncate text-sm font-semibold text-foreground">
                {PLANS[plan].name} <span className="font-normal text-muted-foreground">· {PLANS[plan].price}</span>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0 text-xs font-medium text-foreground underline-offset-4 hover:underline">
              Изменить
            </Link>
          </div>
        )}

        <AuthForm
          mode="register"
          busy={busy}
          error={error}
          notice={notice}
          onEmailSubmit={submit}
          onSocialSignIn={social}
          onEmailLink={() => setNotice("Заполните форму — вход по ссылке появится позже.")}
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
