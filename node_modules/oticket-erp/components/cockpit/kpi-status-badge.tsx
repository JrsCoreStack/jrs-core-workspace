"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, Check, Minus, type LucideIcon } from "lucide-react"

type KpiStatus = "above" | "attention" | "critical" | "empty"

export function KpiStatusBadge({ status }: { status: KpiStatus }) {
  const map: Record<KpiStatus, { label: string; className: string; icon: LucideIcon }> = {
    above: {
      label: "Atingido",
      className: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      icon: Check,
    },
    attention: {
      label: "Atenção",
      className: "border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-400",
      icon: AlertTriangle,
    },
    critical: {
      label: "Crítico",
      className: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400",
      icon: AlertTriangle,
    },
    empty: {
      label: "Sem dados",
      className: "border-muted-foreground/30 bg-muted text-muted-foreground",
      icon: Minus,
    },
  }
  const cfg = map[status]
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={cn("gap-1 font-normal", cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}
