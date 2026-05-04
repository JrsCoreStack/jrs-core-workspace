"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Ícone orbital — manual Orbit (versão lockup clara: fundo gradiente) */
export function OrbitMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const s = Math.round(size * 0.79);
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center shadow-[0_4px_16px_rgba(123,97,255,0.38)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, size * 0.22),
        background: "linear-gradient(135deg, #1a1040, #7b61ff)",
      }}
      aria-hidden
    >
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
        />
        <circle
          cx="24"
          cy="24"
          r="12"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.45"
        />
        <circle cx="24" cy="24" r="5" fill="white" />
        <circle cx="24" cy="24" r="2.5" fill="#7b61ff" />
        <circle cx="40" cy="16" r="3.5" fill="#00d4ff" opacity="0.9" />
        <circle cx="10" cy="34" r="2.5" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}

const wordmarkGradientStyle: CSSProperties = {
  fontFamily: "var(--font-orbit-brand, Outfit, system-ui, sans-serif)",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  backgroundImage:
    "linear-gradient(105deg, var(--rf-accent, #7b61ff) 0%, #5b8def 48%, var(--rf-cyan, #00d4ff) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

/**
 * Texto “Orbit” — reutilizável no hero / painel de auth (degradê marca).
 */
export function OrbitWordmark({
  className,
  size = "md",
}: {
  className?: string;
  /** md ≈ lockup card; sm ≈ hero compacto */
  size?: "sm" | "md";
}) {
  const textClass =
    size === "sm"
      ? "text-[17px] leading-none sm:text-[18px]"
      : "text-[22px] leading-none sm:text-[24px]";
  return (
    <span className={cn("orbit-wordmark", textClass, className)} style={wordmarkGradientStyle}>
      Orbit
    </span>
  );
}

/**
 * Lockup horizontal: ícone + wordmark “Orbit”.
 * `wordmark="gradient"` — degradê roxo → azul (identidade RitualFlow).
 */
export function OrbitLogoLockup({
  variant = "light",
  wordmark = "gradient",
  className,
  markSize = 40,
}: {
  variant?: "light" | "dark";
  /** sólido só para fundos onde o degradê perde contraste */
  wordmark?: "gradient" | "solid";
  className?: string;
  markSize?: number;
}) {
  const solidColor = variant === "light" ? "#0d0f14" : "#ffffff";
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <OrbitMark size={markSize} />
      {wordmark === "gradient" ? (
        <OrbitWordmark />
      ) : (
        <span
          className="orbit-wordmark text-[22px] font-bold leading-none tracking-[-0.03em] sm:text-[24px]"
          style={{
            color: solidColor,
            fontFamily: "var(--font-orbit-brand, Outfit, system-ui, sans-serif)",
          }}
        >
          Orbit
        </span>
      )}
    </div>
  );
}
