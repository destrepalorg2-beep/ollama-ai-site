"use client";

/**
 * Lightweight canvas particle sphere — no three.js / extra deps.
 * A cloud of points laid out on a sphere (fibonacci distribution) that
 * slowly rotates, rendered with a soft glow in the site's purple brand
 * colors. Used behind the OTP code input on /verify.
 */

import { useEffect, useRef } from "react";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const POINT_COUNT = 220;
const COLORS = ["#5b21b6", "#7c3aed", "#a855f7", "#ddd6fe"];

function fibonacciSphere(count: number): Vec3[] {
  const points: Vec3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    points.push({ x: Math.cos(theta) * radiusAtY, y, z: Math.sin(theta) * radiusAtY });
  }
  return points;
}

export default function ParticleSphereAnimation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = fibonacciSphere(POINT_COUNT);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let angleY = 0;
    let angleX = 0.4;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      if (!reduceMotion) {
        angleY += 0.0032;
        angleX = 0.42 + Math.sin(angleY * 0.5) * 0.12;
      }

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = points
        .map((p) => {
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;
          const y1 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;
          return { x: x1, y: y1, z: z2 };
        })
        .sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const depth = (p.z + 1) / 2; // 0 = far, 1 = near
        const scale = radius * (0.55 + 0.45 * depth);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale * 0.98;
        const size = Math.max(0.6, depth * dpr * 2.4);
        const color = COLORS[Math.min(COLORS.length - 1, Math.floor(depth * COLORS.length))];

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.25 + depth * 0.65;
        ctx.shadowColor = color;
        ctx.shadowBlur = depth * 6 * dpr;
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
