"use client";

/**
 * Branded 6-digit OTP input: animated particle sphere + glowing slots.
 * Controlled from the outside (value/onChange/isSuccess) so /verify can
 * drive it with the real verify-email API instead of the fake demo timer
 * this was adapted from.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ParticleSphereAnimation from "@/components/ui/input-otp-10-utils/particalsphear";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 450,
  damping: 28,
} as const;

function OtpSlot({ index, isSuccess }: { index: number; isSuccess: boolean }) {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  const [pulseKey, setPulseKey] = useState(0);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (char && char !== prevCharRef.current) {
      setPulseKey((prev) => prev + 1);
    }
    prevCharRef.current = char;
  }, [char]);

  return (
    <div
      className={cn(
        "relative flex h-14 w-11 sm:w-12 items-center justify-center rounded-xl border transition-all duration-300 font-mono text-xl font-bold select-none",
        isSuccess
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
          : isActive
            ? "border-white bg-white/10 text-white"
            : "border-white/15 bg-white/[0.04] text-white/50 hover:border-white/25 hover:bg-white/[0.08]",
      )}
    >
      <AnimatePresence mode="popLayout">
        {char ? (
          <motion.span
            key={`char-${char}`}
            initial={{ opacity: 0, scale: 0.5, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -6 }}
            transition={SPRING_TRANSITION}
            className={cn("absolute font-mono text-xl", isSuccess ? "text-emerald-400" : "text-white")}
          >
            {char}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {pulseKey > 0 && (
          <motion.div
            key={pulseKey}
            className="absolute inset-0 rounded-xl border border-white/70 pointer-events-none"
            initial={{ opacity: 0.8, scale: 0.9, filter: "blur(0px)" }}
            animate={{ opacity: 0, scale: 1.5, filter: "blur(2px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      {hasFakeCaret && !isSuccess && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-white h-6 w-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );
}

export interface InputOtp10Props {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  isSuccess?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  title?: string;
  subtitle?: string;
  successTitle?: string;
  successSubtitle?: string;
  /** Status line under the slots. enteredLabel takes "{n}" as a placeholder
   *  for the digit count, e.g. "Entered: {n} / 6". All three default to
   *  Russian so the component still works if a caller doesn't localize it. */
  waitingLabel?: string;
  enteredLabel?: string;
  completeLabel?: string;
}

export default function InputOtp10({
  value,
  onChange,
  onComplete,
  isSuccess = false,
  disabled = false,
  autoFocus = true,
  title = "Введите код",
  subtitle = "Введите 6-значный код из письма.",
  successTitle = "Код подтверждён",
  successSubtitle = "Вход выполняется...",
  waitingLabel = "Ожидание ввода…",
  enteredLabel = "Введено: {n} / 6",
  completeLabel = "Код введён",
}: InputOtp10Props) {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8 overflow-hidden group select-none">

      <div className="flex flex-col items-center gap-6 sm:gap-7 relative">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin pointer-events-none"
            style={{ animationDuration: "60s" }}
          />
          <div
            className="absolute inset-2 rounded-full border border-white/10 animate-spin pointer-events-none"
            style={{ animationDuration: "30s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-4 rounded-full border border-dashed border-white/5 pointer-events-none" />
          <div
            className={cn(
              "absolute -inset-1.5 rounded-full transition-all duration-500",
              isSuccess
                ? "bg-linear-to-t from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 animate-pulse"
                : "bg-linear-to-t from-white/0 via-white/5 to-white/0 animate-pulse",
            )}
            style={!isSuccess ? { animationDuration: "3s" } : undefined}
          />
          <div
            className={cn(
              "w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-500",
              isSuccess ? "scale-105" : "scale-95 group-hover:scale-100",
            )}
          >
            <ParticleSphereAnimation className="w-full h-full scale-135 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs rounded-full"
              >
                <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center flex flex-col gap-1.5">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">
            {isSuccess ? successTitle : title}
          </h3>
          <p className="text-xs text-white/50 max-w-2xs leading-relaxed">
            {isSuccess ? successSubtitle : subtitle}
          </p>
        </div>

        <div className="w-full flex justify-center">
          <OTPInput
            maxLength={6}
            value={value}
            onChange={(v) => {
              onChange(v);
              if (v.length === 6) onComplete?.(v);
            }}
            pattern={REGEXP_ONLY_DIGITS}
            autoFocus={autoFocus}
            disabled={disabled}
            containerClassName="group flex items-center justify-center gap-2 sm:gap-2.5"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <OtpSlot key={idx} index={idx} isSuccess={isSuccess} />
              ))}
            </div>
          </OTPInput>
        </div>

        <div className="h-4 flex items-center justify-center">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
            {value.length === 0
              ? waitingLabel
              : value.length < 6
                ? enteredLabel.replace("{n}", String(value.length))
                : completeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
