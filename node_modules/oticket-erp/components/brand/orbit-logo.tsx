"use client";

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

/**
 * Lockup horizontal: ícone + wordmark "Orbit" (Space Grotesk 700 — manual da marca).
 */
export function OrbitLogoLockup({
  variant = "light",
  className,
  markSize = 40,
}: {
  variant?: "light" | "dark";
  className?: string;
  markSize?: number;
}) {
  const color = variant === "light" ? "#0d0f14" : "#ffffff";
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <OrbitMark size={markSize} />
      <span
        className="orbit-wordmark text-[22px] font-bold leading-none tracking-[-0.03em] sm:text-[24px]"
        style={{ color }}
      >
        Orbit
      </span>
    </div>
  );
}
