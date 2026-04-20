"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/* ─────────────── Título de grupo (label + linha) — padrão Orbit / cockpit ─────────────── */
export function SettingsGroupTitle({ title }: { title: string }) {
  return (
    <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="max-w-[85%] shrink-0 text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-muted-foreground sm:max-w-none">
        {title}
      </span>
      <div className="h-px min-w-12 flex-1 bg-border" role="presentation" />
    </div>
  )
}

/* ─────────────── Card de configuração (superfície elevada) ─────────────── */
export function SettingsCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ─────────────── Section card ─────────────── */
export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-[12.5px] text-muted-foreground/80">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </div>
  )
}

/* ─────────────── Row (label + control) ─────────────── */
export function SettingRow({
  label,
  description,
  control,
  danger = false,
  className,
}: {
  label: string
  description?: string
  control: ReactNode
  danger?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        danger && "bg-destructive/5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            danger ? "text-destructive" : "text-card-foreground"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">{control}</div>
    </div>
  )
}

/* ─────────────── Page header ─────────────── */
export function PageHeader({
  title,
  description,
  badge,
  action,
}: {
  title: string
  description?: string
  badge?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-[22px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {badge && <div className="mt-3 flex flex-wrap gap-2">{badge}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ─────────────── Colored role chip ─────────────── */
export function RoleChip({
  variant,
  children,
}: {
  variant: "socio" | "gestor" | "membro"
  children: ReactNode
}) {
  const styles: Record<typeof variant, string> = {
    socio:
      "border-primary/25 bg-primary/10 text-primary",
    gestor:
      "border-chart-2/25 bg-chart-2/10 text-chart-2",
    membro:
      "border-border bg-muted text-muted-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        styles[variant]
      )}
    >
      {children}
    </span>
  )
}

/* ─────────────── Status dot ─────────────── */
export function StatusDot({
  tone = "ok",
  label,
}: {
  tone?: "ok" | "warn" | "danger"
  label: string
}) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-500"
      : tone === "warn"
        ? "text-amber-500"
        : "text-destructive"
  const dotCls =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-destructive"
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", toneCls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotCls)} />
      {label}
    </span>
  )
}
