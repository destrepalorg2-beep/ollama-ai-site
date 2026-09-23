"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";

export function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="overflow-hidden bg-black px-6 pb-20 pt-6 md:pb-32 md:pt-10">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="relative aspect-video overflow-hidden rounded-3xl"
        >
          <video src={VIDEO} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
            <div className="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/50">Наш подход</p>
              <p className="text-sm leading-relaxed text-white md:text-base">
                Всё работает локально: модели Ollama на вашем компьютере или мост к Claude. Данные не покидают ваш сервер, а панель управления держит его под контролем.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/docs" className="liquid-glass inline-block rounded-full px-8 py-3 text-sm font-medium text-white">
                Как это работает
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
