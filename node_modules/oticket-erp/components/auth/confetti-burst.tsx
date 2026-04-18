"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const PALETTE = ["#7b61ff", "#00d4ff", "#22c55e", "#f59e0b", "#ec4899", "#a78bfa"];

export type ConfettiBurstProps = {
  /** Quando false, não renderiza */
  active: boolean;
  count?: number;
  className?: string;
  /** Repete até `active` virar false (ex.: modal fechado) */
  loop?: boolean;
  /** Duração de cada “onda” de partículas (segundos) — maior = mais lento */
  duration?: number;
  /** Pausa entre repetições quando `loop` é true */
  repeatDelay?: number;
};

/**
 * Confete saindo do centro — Framer Motion.
 * Com `loop`, a animação recomeça em ciclo enquanto `active` for true.
 */
export function ConfettiBurst({
  active,
  count = 48,
  className,
  loop = false,
  duration = 1.35,
  repeatDelay = 0,
}: ConfettiBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
        const dist = 72 + Math.random() * 100;
        return {
          id: i,
          angle,
          dist,
          color: PALETTE[i % PALETTE.length],
          delay: Math.random() * 0.25,
          w: 5 + Math.random() * 5,
          h: 3 + Math.random() * 3,
          spin: Math.random() * 720 - 360,
        };
      }),
    [count],
  );

  const waveDuration = loop ? Math.max(duration, 2.8) : duration;
  const waveRepeatDelay = loop ? Math.max(repeatDelay, 0.15) : 0;

  if (!active) return null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-0 w-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-visible ${className ?? ""}`}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px] shadow-sm"
          style={{
            width: p.w,
            height: p.h,
            background: p.color,
            top: 0,
            left: 0,
            marginLeft: -p.w / 2,
            marginTop: -p.h / 2,
          }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [1, 1.1, 0.6],
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 24,
            rotate: p.spin,
          }}
          transition={{
            duration: waveDuration,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
            repeat: loop ? Infinity : 0,
            repeatDelay: waveRepeatDelay,
          }}
        />
      ))}
    </div>
  );
}
