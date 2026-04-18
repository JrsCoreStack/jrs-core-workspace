"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const PALETTE = [
  "#7b61ff", "#9178ff", "#00d4ff", "#22c55e",
  "#f59e0b", "#ec4899", "#a78bfa", "#38bdf8",
  "#fb923c", "#34d399",
];

export type ConfettiBurstProps = {
  /** Quando false, não renderiza */
  active: boolean;
  count?: number;
  className?: string;
  /** Repete até `active` virar false */
  loop?: boolean;
  /** Duração de cada onda de partículas (segundos) — maior = mais lento */
  duration?: number;
  /** Pausa entre repetições quando `loop` é true */
  repeatDelay?: number;
};

/**
 * Confete explodindo do centro — Framer Motion.
 * Com `loop`, recomeça em ciclo enquanto `active` for true.
 * Partículas com formas variadas: retângulos finos e quadradinhos.
 */
export function ConfettiBurst({
  active,
  count = 60,
  className,
  loop = false,
  duration = 1.35,
  repeatDelay = 0,
}: ConfettiBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.1;
        /* distância maior para espalhamento visível no modal */
        const dist = 110 + Math.random() * 160;
        const isSquare = Math.random() > 0.6;
        const size = isSquare ? 5 + Math.random() * 5 : 4 + Math.random() * 4;
        return {
          id: i,
          angle,
          dist,
          color: PALETTE[i % PALETTE.length],
          delay: Math.random() * 0.45,
          w: isSquare ? size : size * 2.4,
          h: size,
          spin: Math.random() * 900 - 450,
          radius: isSquare ? 1 : 2,
        };
      }),
    [count],
  );

  /* Para loop, nunca deixar duração menor que 3.5 s para ser "lento" */
  const waveDuration = loop ? Math.max(duration, 3.5) : duration;
  const waveRepeatDelay = loop ? Math.max(repeatDelay, 0.3) : 0;

  if (!active) return null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-0 w-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-visible ${className ?? ""}`}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: "absolute",
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.radius,
            top: 0,
            left: 0,
            marginLeft: -p.w / 2,
            marginTop: -p.h / 2,
            boxShadow: `0 1px 3px ${p.color}66`,
          }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 1, 0],
            scale: [0.8, 1.2, 1, 0.7],
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 40,
            rotate: p.spin,
          }}
          transition={{
            duration: waveDuration,
            delay: p.delay,
            ease: [0.15, 1, 0.3, 1],
            repeat: loop ? Infinity : 0,
            repeatDelay: waveRepeatDelay,
          }}
        />
      ))}
    </div>
  );
}
