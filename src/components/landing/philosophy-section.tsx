"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

export function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="overflow-hidden bg-black px-6 py-28 md:py-40">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl"
        >
          Мощность <span className="font-display italic text-white/40">×</span> Приватность
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <video src={VIDEO} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center gap-8"
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">Выберите провайдера</p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                Запускайте любые модели Ollama прямо на своём железе или подключите Claude через локальный мост. Максимальная скорость там, где нужно, и полный контроль над тем, что и куда уходит.
              </p>
            </div>
            <div className="h-px w-full bg-white/10" />
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">Всё под контролем</p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                Пользователи, подписки, логи и QR-доступ — в одной панели. Пароли хранятся хешем, доступ по ролям, а данные не покидают ваш сервер.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
