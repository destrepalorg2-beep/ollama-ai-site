"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
    tag: "Модели",
    title: "Локальный AI",
    desc: "Ollama на вашем компьютере или мост к Claude. Любые модели, максимальная скорость, никаких чужих токенов.",
  },
  {
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
    tag: "Управление",
    title: "Панель и клиенты",
    desc: "Десктоп-панель, веб-клиент и мобильное приложение: пользователи, подписки, логи и QR-доступ в одном месте.",
  },
];

export function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
      <div ref={ref} className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 flex items-end justify-between md:mb-16"
        >
          <h2 className="text-3xl tracking-tight text-white md:text-5xl">Что вы получаете</h2>
          <span className="hidden text-sm text-white/40 md:block">Возможности</span>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="liquid-glass group overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-video overflow-hidden">
                <video src={c.video} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/40">{c.tag}</span>
                  <span className="liquid-glass rounded-full p-2 text-white"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
                <h3 className="mb-3 mt-4 text-xl tracking-tight text-white md:text-2xl">{c.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
