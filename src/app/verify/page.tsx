"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { completeSignIn, getPending } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import InputOtp10 from "@/components/ui/input-otp-10";

/* Same hero video as the homepage — swap this constant for V_FEATURED /
   V_PHIL / V_SVC1 / V_SVC2 (see src/app/page.tsx) if a different clip fits
   better here. */
const V_VERIFY_BG =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

function fade(el: HTMLVideoElement, from: number, to: number, ms: number) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    el.style.opacity = String(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();
  const { t } = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const email = typeof window !== "undefined" ? (getPending()?.email ?? null) : null;

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => {
      v.play().catch(() => {});
      fade(v, 0, 1, 900);
    };
    v.addEventListener("canplay", onCanPlay);
    return () => v.removeEventListener("canplay", onCanPlay);
  }, []);

  const submitCode = async (value: string) => {
    if (value.length !== 6 || loading || isSuccess) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: value }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        setIsSuccess(true);
        setMessage({ text: "✅ Email подтверждён! Вход в систему...", type: "success" });
        completeSignIn(data.token, { email: email || undefined, nickname: data.nickname, plan: data.plan });
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      } else {
        if (data.code === "EXPIRED") {
          setMessage({ text: "Код истёк. Запросите новый", type: "error" });
        } else if (data.code === "TOO_MANY_ATTEMPTS") {
          setMessage({ text: data.error || "Слишком много неверных попыток", type: "error" });
        } else if (response.status === 400) {
          setMessage({ text: "Неверный код. Попробуйте ещё раз", type: "error" });
        } else {
          setMessage({ text: data.error || "Ошибка проверки кода", type: "error" });
        }
        setCode("");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage({ text: "Ошибка соединения с сервером", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage({ text: "✅ Новый код отправлен!", type: "success" });
      } else {
        const data = await response.json().catch(() => ({}));
        setMessage({
          text:
            response.status === 429
              ? "Слишком много попыток. Подождите 10 минут"
              : data.error || "Ошибка отправки",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage({ text: "Ошибка соединения", type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0b0b16]">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={V_VERIFY_BG}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0 }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/90" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold text-white">
          AI HUB
        </Link>
        <Link href="/" className="text-sm text-white/60 transition-colors hover:text-white">
          {t("auth.home")}
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex w-full max-w-md flex-col items-center gap-5"
        >
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Проверьте почту</h1>
            <p className="text-sm text-white/60">Мы отправили 6-значный код подтверждения на</p>
            <p className="mt-2 inline-block break-all rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/15 px-4 py-1.5 text-sm text-[#c4b5fd]">
              {email}
            </p>
          </div>

          {message && (
            <div
              className={`w-full rounded-xl border p-3 text-center text-sm backdrop-blur-sm ${
                message.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <InputOtp10
            value={code}
            onChange={setCode}
            onComplete={submitCode}
            isSuccess={isSuccess}
            disabled={loading || isSuccess}
            title={loading ? "Проверка..." : "Введите код"}
            subtitle="6 цифр из письма — код действует 15 минут."
            successTitle="Email подтверждён"
            successSubtitle="Выполняется вход..."
          />

          <div className="text-center">
            <p className="mb-3 text-sm text-white/50">Не получили код?</p>
            <button
              onClick={handleResend}
              disabled={resending || loading || isSuccess}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm text-white/70 backdrop-blur-sm transition-all hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/10 hover:text-white disabled:opacity-50"
            >
              {resending ? "Отправка..." : "Отправить повторно"}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
