"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeSignIn } from "@/lib/auth";

/**
 * Lands here right after /api/auth/google/callback redirects back with the
 * new JWT in the URL *fragment* (`#token=...`) — a fragment never leaves the
 * browser, so this is the only place that token exists outside the account
 * itself. Reads it, stores the session the same way the email login form
 * does, then moves on to /profile.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token");
    if (!token) {
      setFailed(true);
      return;
    }
    completeSignIn(token, {
      email: params.get("email") ?? undefined,
      nickname: params.get("nickname") ?? undefined,
      plan: params.get("plan") ?? undefined,
    });
    router.replace("/profile");
  }, [router]);

  return (
    <div className="app-theme flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">
        {failed ? (
          <>
            Не удалось войти.{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Вернуться ко входу
            </Link>
          </>
        ) : (
          "Выполняется вход…"
        )}
      </p>
    </div>
  );
}
