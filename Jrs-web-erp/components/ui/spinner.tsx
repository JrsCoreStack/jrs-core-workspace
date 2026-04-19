"use client"

import { cn } from "@/lib/utils"

type SpinnerVariant = "ring" | "dots" | "orbit" | "bar"
type SpinnerSize   = "sm" | "md" | "lg"

const SIZE: Record<SpinnerSize, number> = { sm: 24, md: 40, lg: 56 }

interface SpinnerProps {
  variant?: SpinnerVariant
  size?: SpinnerSize
  label?: string
  className?: string
}

export function Spinner({ variant = "ring", size = "md", label, className }: SpinnerProps) {
  const px = SIZE[size]

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {variant === "ring"  && <SpinnerRing  px={px} />}
      {variant === "dots"  && <SpinnerDots  />}
      {variant === "orbit" && <SpinnerOrbit px={px} />}
      {variant === "bar"   && <SpinnerBar   />}
      {label && (
        <span style={{ fontSize: 12, color: "var(--rf-text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
          {label}
        </span>
      )}
    </div>
  )
}

function SpinnerRing({ px }: { px: number }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 40 40"
      style={{ animation: "rf-spin 1.2s linear infinite" }}
    >
      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--rf-border-default)" strokeWidth="3" />
      <circle
        cx="20" cy="20" r="16"
        fill="none"
        stroke="var(--rf-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          transformOrigin: "center",
          animation: "rf-spin-dash 1.5s ease-in-out infinite, rf-spin 2s linear infinite",
        }}
      />
    </svg>
  )
}

function SpinnerDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--rf-accent)",
            animation: `rf-dot-pulse 1.2s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function SpinnerOrbit({ px }: { px: number }) {
  return (
    <div style={{ position: "relative", width: px, height: px }}>
      {/* center dot */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: "var(--rf-accent)",
      }} />
      {/* ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: "1.5px solid var(--rf-accent-border)",
        animation: "rf-spin 2s linear infinite",
      }} />
      {/* planet */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 6, height: 6,
        marginTop: -(px / 2),
        marginLeft: -3,
        borderRadius: "50%",
        background: "var(--rf-cyan)",
        transformOrigin: `3px ${px / 2}px`,
        animation: "rf-spin 1.5s linear infinite",
      }} />
    </div>
  )
}

function SpinnerBar() {
  return (
    <div style={{
      width: 160, height: 4,
      background: "var(--rf-border-subtle)",
      borderRadius: 9999, overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        background: "linear-gradient(90deg, var(--rf-accent), var(--rf-cyan))",
        borderRadius: 9999,
        animation: "rf-bar-load 2s ease-in-out infinite",
      }} />
    </div>
  )
}

/** Spinner pequeno para colocar dentro de botões */
export function ButtonSpinner({ color = "#fff" }: { color?: string }) {
  return (
    <svg
      width={14} height={14} viewBox="0 0 40 40"
      style={{ animation: "rf-spin 1s linear infinite", flexShrink: 0 }}
    >
      <circle cx="20" cy="20" r="16" fill="none" stroke={`${color}44`} strokeWidth="3" />
      <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3"
        strokeDasharray="40,60" strokeLinecap="round" />
    </svg>
  )
}
