"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/ui/site-nav";
import { SiteFooter } from "@/components/ui/site-footer";
import { useT } from "@/lib/i18n";
import { CONTENT } from "@/lib/content";

/* ── Config (kept in-file so no new modules are imported) ─────────────────── */
const HUB = {
  name: "AI HUB",
  apiBase: "http://localhost:3000",
  // Prices only — every user-facing plan string lives in lib/content.ts so it
  // can be translated; these are matched to it by id.
  plans: [
    { id: "free", monthly: 0, yearly: 0 },
    { id: "pro", monthly: 490, yearly: 4900, popular: true },
    { id: "ultra", monthly: 1490, yearly: 14900 },
  ] as { id: string; monthly: number; yearly: number; popular?: boolean }[],
  models: ["llama3", "llama2", "mistral", "phi3", "gemma", "qwen2", "codellama", "deepseek-coder"],
};

const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";

const V_HERO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const V_FEATURED = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";
const V_PHIL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";
const V_SVC1 = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const V_SVC2 = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4";



function fade(el: HTMLVideoElement, from: number, to: number, ms: number) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    el.style.opacity = String(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Words pull-up ────────────────────────────────────────────────────────── */
function WordsPullUp({ text, className = "", showAsterisk = false }: { text: string; className?: string; showAsterisk?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");
  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">*</span>}
          </motion.span>
        );
      })}
    </span>
  );
}

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    // { once: true }: cloud video can refire "canplay" mid-playback (a brief
    // rebuffer, or the loop restart) — without this, that re-ran the fade and
    // snapped opacity back to 0 every time, flashing the hero to black.
    const onCanPlay = () => { v.play().catch(() => {}); fade(v, 0, 1, 700); };
    v.addEventListener("canplay", onCanPlay, { once: true });
    return () => { v.removeEventListener("canplay", onCanPlay); };
  }, []);
  return (
    <section className="h-screen w-full">
      <div className="relative h-full w-full overflow-hidden">
        <video ref={videoRef} autoPlay loop muted playsInline preload="auto" src={V_HERO} className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0 }} />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <SiteNav onLanding />

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2 sm:px-6 md:px-10">
          <h1 className="font-display font-medium leading-[0.85] tracking-[-0.07em] text-foreground text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw]">
            <WordsPullUp text={HUB.name} className="flex-nowrap whitespace-nowrap" />
          </h1>
        </div>
      </div>
    </section>
  );
}
function About() {
  const { lang } = useT();
  const c = CONTENT[lang].landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="relative overflow-hidden bg-black px-6 pb-10 pt-32 md:pb-14 md:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-sm uppercase tracking-widest text-white/40">{c.aboutTag}</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }} className="mt-6 text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          <span className="font-display italic text-white/60">{c.aboutLead}</span>{" "}
          <br className="hidden md:block" />
          <span className="font-display italic text-white/60">{c.aboutRest}</span>
        </motion.h2>
      </div>
    </section>
  );
}

function Featured() {
  const { lang } = useT();
  const c = CONTENT[lang].landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section className="overflow-hidden bg-black px-6 pb-20 pt-6 md:pb-32 md:pt-10">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9 }} className="relative aspect-video overflow-hidden rounded-3xl">
          <video src={V_FEATURED} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/40">{c.approachTag}</p>
            <p className="text-sm leading-relaxed text-white/70 md:text-base">{c.approach}</p>
          </div>
          <Link href="/download" className={buttonVariants({ variant: "outline" })}>{c.download}</Link>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  const { lang } = useT();
  const c = CONTENT[lang].landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="features" className="scroll-mt-20 overflow-hidden bg-black px-6 py-28 md:py-40">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.h2 initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl">
          {c.philTitleA} <span className="font-display italic text-white/40">×</span> {c.philTitleB}
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="aspect-[4/3] overflow-hidden rounded-3xl">
            <video src={V_PHIL} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="flex flex-col justify-center gap-8">
            {c.philBlocks.map((b, i) => (
              <div key={b.tag}>
                {i > 0 && <div className="mb-8 h-px w-full bg-white/10" />}
                <p className="mb-4 text-xs uppercase tracking-widest text-white/40">{b.tag}</p>
                <p className="text-base leading-relaxed text-white/70 md:text-lg">{b.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Models() {
  const { lang } = useT();
  const c = CONTENT[lang].landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="models" className="scroll-mt-20 overflow-hidden bg-black px-6 py-20">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="text-3xl tracking-tight text-white md:text-5xl">{c.modelsTitle}</motion.h2>
        <p className="mt-3 max-w-2xl text-white/50">{c.modelsLead}</p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {HUB.models.map((m) => <span key={m} className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/80">{m}</span>)}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { lang } = useT();
  const L = CONTENT[lang].landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const videos = [V_SVC1, V_SVC2];
  const cards = L.services.map((sv, i) => ({ ...sv, video: videos[i] }));
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
      <div ref={ref} className="relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-12 flex items-end justify-between md:mb-16">
          <h2 className="text-3xl tracking-tight text-white md:text-5xl">{L.servicesTitle}</h2>
          <span className="hidden text-sm text-white/40 md:block">{L.servicesTag}</span>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {cards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: i * 0.15 }} className="group overflow-hidden rounded-3xl border border-white/10">
              <div className="relative aspect-video overflow-hidden">
                <video src={c.video} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/40">{c.tag}</span>
                  <span className="rounded-full border border-white/15 p-2 text-white"><ArrowUpRight className="h-4 w-4" /></span>
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

function Pricing() {
  const { lang } = useT();
  const C = CONTENT[lang];
  const L = C.landing;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="scroll-mt-20 overflow-hidden bg-black px-6 py-28 md:py-40">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-12 text-center">
          <p className="text-sm uppercase tracking-widest text-white/40">{L.pricingTag}</p>
          <h2 className="mt-4 text-4xl tracking-tight text-white md:text-6xl">{L.pricingTitleA} <span className="font-display italic text-white/60">{L.pricingTitleB}</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/50">{L.pricingLead}</p>
        </motion.div>
        <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-sm">
          <Button onClick={() => setYearly(false)} variant={!yearly ? "default" : "ghost"} size="sm" className="rounded-full">{L.monthly}</Button>
          <Button onClick={() => setYearly(true)} variant={yearly ? "default" : "ghost"} size="sm" className="rounded-full">{L.yearly} <span className="ml-1 text-emerald-400">{L.save}</span></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {HUB.plans.map((pl) => {
            const perMonth = pl.monthly === 0 ? 0 : yearly ? Math.round(pl.yearly / 12) : pl.monthly;
            const tr = C.plans.find((x) => x.id === pl.id)!;
            const billed = pl.monthly === 0 ? L.freeForever : yearly ? `${L.billedYearly} · ${rub(pl.yearly)}` : L.billedMonthly;
            return (
              <div key={pl.id} className={`relative flex flex-col rounded-3xl border p-6 ${pl.popular ? "border-white/25 bg-white/[0.03]" : "border-white/10"}`}>
                {pl.popular && <span className="absolute right-5 top-5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">{L.popular}</span>}
                <div className="text-lg font-semibold text-white">{tr.name}</div>
                <div className="mt-1 text-sm text-white/50">{tr.info}</div>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{pl.monthly === 0 ? "0 ₽" : rub(perMonth)}</span>
                  {pl.monthly !== 0 && <span className="pb-1 text-sm text-white/50">{L.perMonth}</span>}
                </div>
                <div className="mt-1 text-xs text-white/50">{billed}</div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tr.feats.map((f) => (<li key={f} className="flex items-start gap-2.5 text-sm text-white/90"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.4} /> {f}</li>))}
                </ul>
                <Link href={pl.monthly === 0 ? "/register" : `/register?plan=${pl.id}`} className={buttonVariants({ variant: pl.popular ? "default" : "outline", size: "full", className: "mt-7" })}>
                  {pl.monthly === 0 ? L.startFree : `${L.choose} ${tr.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <div className="bg-black">
      <Hero />
      <About />
      <Featured />
      <Philosophy />
      <Models />
      <Services />
      <Pricing />
      <SiteFooter />
    </div>
  );
}
