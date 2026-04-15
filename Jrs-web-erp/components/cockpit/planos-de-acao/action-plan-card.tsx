"use client"

import { areaLabel } from "@/lib/cockpit/constants"
import { cn } from "@/lib/utils"
import { AlertTriangle, CalendarCheck2, Clock } from "lucide-react"

export type ActionPlan = {
  id: string
  title: string
  area: string
  ritualId: string | null
  meetingId: string | null
  ownerName: string
  dueDate: string
  /** ISO date da criação (API `created_at`) — usado na barra de prazo no modal */
  createdAt?: string
  priority: "high" | "medium" | "low"
  status: "planned" | "in_progress" | "blocked" | "delivered" | "archived"
  blockedNote?: string
  notes?: string | null
  history?: Array<{ action: string; at: string; by: string }>
  dependsOnPlanId?: string | null
  comments?: Array<{ id: string; text: string; at: string; by: string; parent_id?: string | null }>
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

// Paleta com 10 cores distintas para avatares
const AVATAR_PALETTE = [
  { bg: "bg-violet-100",  text: "text-violet-800",  ring: "ring-violet-200"  },
  { bg: "bg-sky-100",     text: "text-sky-800",     ring: "ring-sky-200"     },
  { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" },
  { bg: "bg-rose-100",    text: "text-rose-800",    ring: "ring-rose-200"    },
  { bg: "bg-amber-100",   text: "text-amber-800",   ring: "ring-amber-200"   },
  { bg: "bg-teal-100",    text: "text-teal-800",    ring: "ring-teal-200"    },
  { bg: "bg-indigo-100",  text: "text-indigo-800",  ring: "ring-indigo-200"  },
  { bg: "bg-pink-100",    text: "text-pink-800",    ring: "ring-pink-200"    },
  { bg: "bg-orange-100",  text: "text-orange-800",  ring: "ring-orange-200"  },
  { bg: "bg-cyan-100",    text: "text-cyan-800",    ring: "ring-cyan-200"    },
]

/** Retorna sempre a mesma cor para o mesmo nome (hash simples) */
function avatarColors(name: string) {
  const hash = name
    .trim()
    .toLowerCase()
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function priorityDotColor(p: ActionPlan["priority"]) {
  if (p === "high") return "#ef4444"
  if (p === "medium") return "#f59e0b"
  return "#22c55e"
}

function priorityLabel(p: ActionPlan["priority"]) {
  return p === "high" ? "ALTA" : p === "medium" ? "MÉDIA" : "BAIXA"
}

function priorityTextClass(p: ActionPlan["priority"]) {
  if (p === "high") return "text-red-500"
  if (p === "medium") return "text-amber-500"
  return "text-emerald-500"
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

export function ActionPlanCard({
  plan,
  onOpenDetails,
}: {
  plan: ActionPlan
  onOpenDetails?: (planId: string) => void
}) {
  const todayIso = new Date().toISOString().slice(0, 10)
  const overdue =
    plan.status !== "delivered" && plan.status !== "archived" && plan.dueDate < todayIso
  const blocked = plan.status === "blocked"
  const delivered = plan.status === "delivered"

  // Barra lateral SOMENTE para atrasados e bloqueados
  const showBar = overdue || blocked
  const barColor = overdue ? "#ef4444" : "#fb923c"

  return (
    <div
      role={onOpenDetails ? "button" : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      onClick={() => onOpenDetails?.(plan.id)}
      onKeyDown={(e) => {
        if (!onOpenDetails) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpenDetails(plan.id)
        }
      }}
      className={cn(
        "flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card",
        onOpenDetails &&
          "cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-950/30 dark:focus:ring-emerald-400/30"
      )}
    >
      {/* Barra lateral — apenas atrasado (vermelho) ou bloqueado (laranja) */}
      {showBar && (
        <div
          className="w-[4px] shrink-0 self-stretch"
          style={{ backgroundColor: barColor }}
          aria-hidden
        />
      )}

      {/* Conteúdo */}
      <div className="min-w-0 flex-1 p-4">

        {/* LINHA 1: Título + Prioridade */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
            {plan.title}
          </p>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-[11px] font-bold",
              priorityTextClass(plan.priority)
            )}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: priorityDotColor(plan.priority) }}
            />
            {priorityLabel(plan.priority)}
          </span>
        </div>

        {/* LINHA 2: Bloco colorido contido dentro do card */}
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center gap-2 rounded-xl px-3 py-2",
            overdue
              ? " dark:bg-red-500/10"
              : blocked
                ? " dark:bg-orange-500/10"
                : "px-0 py-0"
          )}
        >
          {overdue && (
            <span className="rounded-full border bg-red-50 border-red-400 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-500 dark:border-red-500 dark:text-red-400">
              Atrasado
            </span>
          )}
          {blocked && !overdue && (
            <span className="rounded-full border bg-orange-50 border-orange-400 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-500 dark:border-orange-500 dark:text-orange-400">
              Bloqueado
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[11px] font-medium text-slate-600 dark:border-border dark:bg-muted dark:text-slate-300">
            {areaLabel(plan.area)}
          </span>
        </div>

        {/* Nota de bloqueio (somente bloqueados) */}
        {blocked && (plan.blockedNote?.trim() ?? "") !== "" && (
          <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{plan.blockedNote}</span>
          </div>
        )}

        {/* DIVISÓRIA */}
        <div className="my-3 border-t border-slate-200 dark:border-border" />

        {/* LINHA 3: Responsável + Data */}
        <div className="flex items-center justify-between gap-2">
          {/* Avatar + Nome */}
          {(() => {
            const colors = avatarColors(plan.ownerName)
            return (
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1",
                    colors.bg, colors.text, colors.ring
                  )}
                >
                  {initials(plan.ownerName)}
                </div>
                <span className={cn("truncate text-sm font-medium", colors.text)}>
                  {plan.ownerName}
                </span>
              </div>
            )
          })()}

          {/* Data */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 text-sm font-medium",
              overdue
                ? "text-red-500 dark:text-red-400"
                : delivered
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
            )}
          >
            {delivered ? (
              <CalendarCheck2 className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>{formatDate(plan.dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
