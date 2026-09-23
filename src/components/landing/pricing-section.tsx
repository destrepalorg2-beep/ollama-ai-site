"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PricingCards } from "@/components/landing/pricing-cards";

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="scroll-mt-20 overflow-hidden bg-black px-6 py-28 md:py-40">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-white/40">Тарифы</p>
          <h2 className="mt-4 text-4xl tracking-tight text-white md:text-6xl">
            Простые <span className="font-display italic text-white/60">тарифы</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">Те же планы, что и в панели управления. Отменить можно в любой момент.</p>
        </motion.div>
        <PricingCards />
      </div>
    </section>
  );
}
