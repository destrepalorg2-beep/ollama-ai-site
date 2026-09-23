"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect } from "react";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
export interface PrismaHeroNavItem {
  label: string;
  href: string;
}

export interface PrismaHeroProps {
  /** Big display word. Rendered with the staggered pull-up animation. */
  title?: string;
  /** Superscript asterisk after the last word of the title. */
  showAsterisk?: boolean;
  /** Body copy under the title. */
  description?: string;
  /** Call-to-action label. */
  ctaLabel?: string;
  /** Where the CTA points. Renders a button when omitted. */
  ctaHref?: string;
  onCtaClick?: () => void;
  /** Top navigation. Pass an empty array to hide the bar. */
  navItems?: PrismaHeroNavItem[];
  /** Looping background video. */
  videoSrc?: string;
  /** First frame shown while the video loads, and if it fails. */
  posterSrc?: string;
}

const defaultNavItems: PrismaHeroNavItem[] = [
  { label: "Our story", href: "#" },
  { label: "Collective", href: "#" },
  { label: "Workshops", href: "#" },
  { label: "Programs", href: "#" },
  { label: "Inquiries", href: "#" },
];

const CREAM = "#E1E0CC";

const PrismaHero = ({
  title = "Prisma",
  showAsterisk = false,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  navItems = defaultNavItems,
  videoSrc = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",
  posterSrc = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80",
}: PrismaHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);
  const ctaInner = (
    <>
      {ctaLabel}
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
        <ArrowRight className="h-4 w-4" style={{ color: CREAM }} />
      </span>
    </>
  );

  const ctaClass =
    "group inline-flex items-center gap-2 self-start rounded-full bg-primary py-1 pl-5 pr-1 text-sm font-medium text-black transition-all hover:gap-3 sm:text-base";

  return (
    <section className="h-screen w-full">
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          // Painted fallback: if both the video and its poster fail to load,
          // the frame still reads as a deliberate backdrop rather than a void.
          background:
            "radial-gradient(120% 90% at 20% 15%, #3a3a34 0%, #1c1c19 45%, #0b0b0b 100%)",
        }}
      >
        {/* Background video. The poster keeps the frame filled while it loads
            and if the source is unavailable. */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          ref={videoRef}
        />

        {/* Noise overlay — styles live in globals.css */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Navbar */}
        {navItems.length > 0 && (
          <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[10px] transition-colors sm:text-xs md:text-sm"
                  style={{ color: "rgba(225, 224, 204, 0.8)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Top Right Logo/Title */}
        <div className="absolute top-6 right-6 z-20">
          <h1
            className="font-medium tracking-tight text-xl sm:text-2xl md:text-3xl"
            style={{ color: CREAM }}
          >
            <WordsPullUp text={title} showAsterisk={showAsterisk} />
          </h1>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2 sm:px-6 md:px-10">
          <div className="flex flex-col items-end justify-end gap-5 pb-6 lg:pb-10">
            <div className="flex flex-col gap-5">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs text-primary/70 sm:text-sm md:text-base text-right"
                style={{ lineHeight: 1.2 }}
              >
                {description}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="self-end"
              >
                {(ctaHref || onCtaClick || ctaLabel) && (
                  ctaHref ? (
                    <a href={ctaHref} className={ctaClass}>
                      {ctaInner}
                    </a>
                  ) : (
                    <button type="button" onClick={onCtaClick} className={ctaClass}>
                      {ctaInner}
                    </button>
                  )
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PrismaHero };
