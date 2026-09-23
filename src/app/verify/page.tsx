"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeSignIn, getPending } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyPage() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const email = typeof window !== "undefined" ? (getPending()?.email ?? null) : null;

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [email, router]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    paste.split("").forEach((char, i) => {
      newCode[i] = char;
    });
    setCode(newCode);

    const lastIdx = Math.min(paste.length, 5);
    inputsRef.current[lastIdx]?.focus();

    if (paste.length === 6) {
      submitCode(paste);
    }
  };

  const submitCode = async (codeStr?: string) => {
    const finalCode = codeStr || code.join("");
    if (finalCode.length !== 6) {
      setMessage({ text: "Введите все 6 цифр", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "✅ Email подтверждён! Вход в систему...", type: "success" });

        // Auto-login
        const deviceId = "web-" + Math.random().toString(36).substring(2, 11);
        const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          // Carries email / nickname / plan over from the pending keys, so the
          // profile page has something to show after verification.
          completeSignIn(loginData.token, { email: email || undefined, nickname: loginData.nickname, plan: loginData.plan });

          setTimeout(() => {
            router.push("/profile");
          }, 1000);
        } else {
          setMessage({ text: "Email подтверждён! Перейдите на страницу входа", type: "success" });
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        if (response.status === 400) {
          setMessage({ text: "Неверный код. Попробуйте ещё раз", type: "error" });
        } else if (data.code === "EXPIRED") {
          setMessage({ text: "Код истёк. Запросите новый", type: "error" });
        } else {
          setMessage({ text: data.error || "Ошибка проверки кода", type: "error" });
        }
        // Clear inputs on error
        setCode(new Array(6).fill(""));
        inputsRef.current[0]?.focus();
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage({ text: "Ошибка соединения с сервером", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("http://localhost:3000/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage({ text: "✅ Новый код отправлен!", type: "success" });
      } else {
        const data = await response.json();
        if (response.status === 429) {
          setMessage({ text: "Слишком много попыток. Подождите 10 минут", type: "error" });
        } else {
          setMessage({ text: data.error || "Ошибка отправки", type: "error" });
        }
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage({ text: "Ошибка соединения", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1f1f2f] rounded-[24px] p-8 sm:p-12 max-w-[440px] w-full shadow-2xl text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center text-4xl">
          ✉️
        </div>

        <h1 className="text-white text-3xl font-bold mb-3">Проверьте почту</h1>
        <p className="text-[#9ca3af] mb-8 text-sm leading-relaxed">
          Мы отправили 6-значный код подтверждения на ваш email
        </p>

        <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 p-3 rounded-xl text-[#a78bfa] text-sm mb-8 word-break-all">
          {email}
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submitCode(); }} className="space-y-8">
          <div className="flex gap-3 justify-center">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputsRef.current[idx] = el; }}
                type="text"
                maxLength={1}
                pattern="[0-9]"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-12 h-16 sm:w-14 sm:h-20 bg-[#2a2a3e] border-2 border-transparent rounded-xl text-white text-3xl font-bold text-center transition-all focus:outline-none focus:border-[#7c3aed] focus:bg-[#1f1f2f]"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white text-base font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Проверка...
              </>
            ) : (
              "Подтвердить"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#9ca3af] text-sm mb-3">Не получили код?</p>
          <button
            onClick={handleResend}
            disabled={loading}
            className="px-6 py-3 rounded-xl border border-[#3f3f5f] text-sm text-[#9ca3af] transition-all hover:bg-[#7c3aed]/10 hover:border-[#7c3aed] hover:text-white disabled:opacity-60"
          >
            {loading ? "Отправка..." : "Отправить повторно"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
