"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Mail, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

function fade(el: HTMLVideoElement, from: number, to: number, ms: number) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    el.style.opacity = String(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => { v.play().catch(() => {}); fade(v, 0, 1, 500); };
    const onTimeUpdate = () => {
      if (v.duration && v.duration - v.currentTime <= 0.55) fade(v, Number(v.style.opacity || 1), 0, 500);
    };
    const onEnded = () => {
      v.style.opacity = "0";
      setTimeout(() => { v.currentTime = 0; v.play().catch(() => {}); fade(v, 0, 1, 500); }, 100);
    };
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        preload="auto"
        src={HERO_VIDEO}
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        style={{ opacity: 0 }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      <div className="relative z-20">
        <SiteHeader />
      </div>

      <div className="relative z-10 flex flex-1 -translate-y-[8%] flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="font-display whitespace-nowrap text-7xl tracking-tight text-white md:text-8xl lg:text-9xl">
          Локальный AI <em className="italic text-white/80">без облака</em>
        </h1>

        <form onSubmit={(e) => e.preventDefault()} className="mt-8 w-full max-w-xl">
          <div className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
            />
            <button type="submit" aria-label="Подписаться" className="rounded-full bg-white p-3 text-black transition-transform hover:scale-105">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <p className="mt-5 max-w-md px-4 text-sm leading-relaxed text-white/70">
          Один AI-сервер на вашем железе: десктоп-панель, веб-клиент и мобильное приложение работают с одними моделями. Без облака и без подписки на чужие токены.
        </p>

        <Link href="/pricing" className="liquid-glass mt-6 rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5">
          Смотреть тарифы
        </Link>
      </div>

      <div className="relative z-10 flex justify-center gap-4 pb-12">
        {[Mail, MessageCircle, Globe].map((I, i) => (
          <a key={i} href="#" className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white" aria-label="social">
            <I className="h-5 w-5" strokeWidth={1.6} />
          </a>
        ))}
      </div>
    </section>
  );
}
