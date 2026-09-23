"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { useT } from "@/lib/i18n";

/* Brand marks inlined as SVG so the card matches the desktop app exactly. */
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55z" />
    <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.53-2.02-6.44-4.74H1.72v2.98A11.99 11.99 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.56 14.68a7.2 7.2 0 0 1 0-4.6V7.1H1.72a12 12 0 0 0 0 10.56l3.84-2.98z" />
    <path fill="#EA4335" d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.2 15.1 0 12 0 7.36 0 3.36 2.66 1.72 6.54l3.84 2.98C6.47 6.8 9 4.75 12 4.75z" />
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 23 23" {...props}>
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M12 1h10v10H12z" />
    <path fill="#00A4EF" d="M1 12h10v10H1z" />
    <path fill="#FFB900" d="M12 12h10v10H12z" />
  </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.05 12.54c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.42-.14-2.77.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.77 2.28-1.61 2.79-.41 6.92 1.16 9.18.77 1.11 1.68 2.35 2.87 2.31 1.15-.05 1.59-.74 2.98-.74 1.39 0 1.78.74 3 .72 1.24-.02 2.02-1.13 2.78-2.24.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.41-.93-2.43-3.69zM14.8 5.4c.63-.77 1.06-1.83.94-2.9-.91.04-2.01.61-2.66 1.37-.59.68-1.1 1.76-.96 2.8 1.01.08 2.05-.51 2.68-1.27z" />
  </svg>
);

export type AuthMode = "signin" | "register";
export type Provider = "google" | "microsoft" | "apple" | "sso";

const COPY = {
  signin: { k: "auth.signin", switchHref: "/register" },
  register: { k: "auth.register", switchHref: "/login" },
} as const;

interface AuthFormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  mode?: AuthMode;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  /** Extra field shown only on registration (nickname), rendered above email. */
  extraTop?: React.ReactNode;
  /** Pre-fills the email field, e.g. when arriving from "no account yet, register" on the login page. */
  defaultEmail?: string;
  onEmailSubmit?: (data: { email: string; password: string }) => void;
  onSocialSignIn?: (provider: Provider) => void;
  onEmailLink?: () => void;
  onForgot?: () => void;
}

export function AuthForm({
  className,
  mode = "signin",
  busy = false,
  error,
  notice,
  extraTop,
  defaultEmail,
  onEmailSubmit,
  onSocialSignIn,
  onEmailLink,
  onForgot,
  ...props
}: AuthFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const { t } = useT();
  const isRegister = mode === "register";
  const copy = COPY[mode];

  const mismatch = isRegister && confirm.length > 0 && confirm !== password;
  const tooShort = isRegister && password.length > 0 && password.length < 8;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || mismatch || tooShort) return;
    const data = new FormData(event.currentTarget);
    onEmailSubmit?.({ email: String(data.get("email") || ""), password: String(data.get("password") || "") });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <Card className={cn("mx-auto w-full max-w-[380px] shadow-xl", className)} {...props}>
      <CardHeader className="p-6 pb-4 text-left">
        <CardTitle className="text-xl">{t(`${copy.k}.title`)}</CardTitle>
        <CardDescription>{t(`${copy.k}.desc`)}</CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("auth.social")}</p>
            {/* No size prop: the buttons stretch to fill their grid cell, so all
                four end up the same width — a fixed `size="icon"` would leave
                them 36px wide and ragged inside wider cells. */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" type="button" className="w-full px-0" aria-label="Google" onClick={() => onSocialSignIn?.("google")}>
                <GoogleIcon className="size-4" />
              </Button>
              <Button variant="outline" type="button" className="w-full px-0" aria-label="Microsoft" onClick={() => onSocialSignIn?.("microsoft")}>
                <MicrosoftIcon className="size-4" />
              </Button>
              <Button variant="outline" type="button" className="w-full px-0" aria-label="Apple" onClick={() => onSocialSignIn?.("apple")}>
                <AppleIcon className="size-5" />
              </Button>
              <Button variant="outline" type="button" className="w-full px-0" onClick={() => onSocialSignIn?.("sso")}>
                <KeyRound className="h-4 w-4" />
                <span className="ml-1.5">SSO</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t("auth.or")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {extraTop}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@example.com" defaultValue={defaultEmail} className="pl-9" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                {!isRegister && (
                  <button type="button" onClick={onForgot} className="text-sm font-medium text-primary hover:underline">
                    {t("auth.forgot")}
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {tooShort && <p className="text-xs text-destructive">{t("auth.tooShort")}</p>}
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirm">{t("auth.confirm")}</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                {mismatch && <p className="text-xs text-destructive">{t("auth.mismatch")}</p>}
              </div>
            )}

            {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-sm text-destructive">{error}</motion.p>}
            {notice && !error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-sm text-muted-foreground">{notice}</motion.p>}

            <Button type="submit" variant="primary" className="w-full" disabled={busy || mismatch || tooShort}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t(`${copy.k}.submit`)}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t(`${copy.k}.switch`)}{" "}
            <Link href={copy.switchHref} className="font-medium text-primary hover:underline">
              {t(`${copy.k}.switchAction`)}
            </Link>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 p-6 pt-4">
        <Button variant="ghost" type="button" className="w-full text-muted-foreground" onClick={onEmailLink}>
          <Sparkles className="mr-2 h-4 w-4" />
          {t("auth.magic")}
        </Button>
        <p className="w-full text-center text-xs leading-relaxed text-muted-foreground">
          {t("auth.termsPrefix")}{" "}
          <Link href="/terms" className="underline hover:text-primary">{t("auth.terms")}</Link> {t("auth.and")}{" "}
          <Link href="/terms" className="underline hover:text-primary">{t("auth.privacy")}</Link>
        </p>
      </CardFooter>
      </Card>
    </motion.div>
  );
}
