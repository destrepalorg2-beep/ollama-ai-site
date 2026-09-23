"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthForm, type Provider } from "@/components/ui/auth-form";
import { API_BASE, DEV_MODE, completeSignIn, setPending, signInOffline } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noAccountEmail, setNoAccountEmail] = useState<string | null>(null);

  const submit = async ({ email, password }: { email: string; password: string }) => {
    setError(null);
    setNotice(null);
    setNoAccountEmail(null);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        completeSignIn(data.token, { email, nickname: data.nickname, plan: data.plan });
        router.push("/profile");
        return;
      }
      if (res.ok) {
        // Server wants an emailed code instead of returning a token outright.
        setPending({ email });
        router.push("/verify");
        return;
      }
      if (data.code === "account_not_found") {
        // Point new visitors at registration instead of a flat "wrong
        // password" — trades a little account-enumeration exposure for a
        // much clearer first-time experience (see auth.routes.ts).
        setNoAccountEmail(email);
        return;
      }
      setError(res.status === 401 ? "Неверный email или пароль." : data.error || "Не удалось войти.");
    } catch {
      // Backend is down. In development we let you through so the site stays
      // clickable; in a production build this is a hard error — a bypass that
      // checks no password must never ship.
      if (DEV_MODE) {
        signInOffline(email);
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
    setNotice(`Вход через ${p === "sso" ? "SSO" : p} пока не подключён — войдите по email.`);
  };

  const emailLink = () => {
    setError(null);
    setNotice("Введите email и пароль — вход по ссылке появится позже.");
  };

  return (
    <div className="app-theme flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-foreground">AI HUB</Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">{t("auth.home")}</Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-3">
          {noAccountEmail && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <p className="text-white/80">
                Аккаунта с email <span className="font-medium text-white">{noAccountEmail}</span> ещё нет.
              </p>
              <Link
                href={`/register?email=${encodeURIComponent(noAccountEmail)}`}
                className="mt-2 inline-block font-medium text-foreground underline underline-offset-4"
              >
                Зарегистрироваться →
              </Link>
            </div>
          )}
          <AuthForm
            mode="signin"
            busy={busy}
            error={error}
            notice={notice}
            onEmailSubmit={submit}
            onSocialSignIn={social}
            onEmailLink={emailLink}
            onForgot={() => setNotice("Напишите в поддержку на странице «Контакты» — поможем восстановить доступ.")}
          />
        </div>
      </main>
    </div>
  );
}
