"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { areaLabel, ACTION_PLAN_STATUS_LABELS } from "@/lib/cockpit/constants"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Clock, MoreHorizontal, Plus } from "lucide-react"

type ActionPlan = {
  id: number
  title: string
  area: string
  ownerName: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "planned" | "in_progress" | "blocked" | "delivered" | "archived"
  blockedNote?: string
}

const COLUMN_ORDER: ActionPlan["status"][] = [
  "planned",
  "in_progress",
  "blocked",
  "delivered",
  "archived",
]

export const statusAccent: Record<ActionPlan["status"] | "overdue", string> = {
  planned: "#6366f1",
  in_progress: "#0ea5e9",
  blocked: "#f59e0b",
  delivered: "#22c55e",
  archived: "#94a3b8",
  overdue: "#ef4444",
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

function priorityLabel(p: ActionPlan["priority"]) {
  return p === "high" ? "ALTA" : p === "medium" ? "MÉDIA" : "BAIXA"
}

function priorityColor(p: ActionPlan["priority"]) {
  if (p === "high") return "text-red-600 dark:text-red-400"
  if (p === "medium") return "text-amber-600 dark:text-amber-400"
  return "text-emerald-600 dark:text-emerald-400"
}

function isOverdue(plan: ActionPlan, todayIso: string) {
  return plan.status !== "delivered" && plan.status !== "archived" && plan.dueDate < todayIso
}

function KanbanColumn({
  status,
  children,
  count,
}: {
  status: ActionPlan["status"]
  children: React.ReactNode
  count: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col",
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusAccent[status] }} />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {ACTION_PLAN_STATUS_LABELS[status] ?? status}
          </span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Adicionar"
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Mais"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="min-h-[120px] space-y-3 pt-3">
        {children}
      </div>
    </div>
  )
}

function PlanCardDrag({ plan }: { plan: ActionPlan }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: plan.id,
    data: { type: "plan", status: plan.status },
  })
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("touch-none", isDragging && "opacity-50")}
      {...listeners}
      {...attributes}
    >
      <PlanCardInner plan={plan} />
    </div>
  )
}

export function ActionPlanCard({ plan }: { plan: ActionPlan }) {
  const todayIso = new Date().toISOString().slice(0, 10)
  const overdue = isOverdue(plan, todayIso)
  const leftBar =
    overdue
      ? statusAccent.overdue
      : plan.status === "blocked"
        ? statusAccent.blocked
        : statusAccent[plan.status]
  return (
    <Card className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-card">
      <div
        className="absolute left-3 top-4 bottom-4 w-1 rounded-full"
        style={{ backgroundColor: leftBar }}
        aria-hidden
      />
      <CardContent className="pl-7 pr-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {overdue && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-500/10 dark:text-red-400">
                ATRASADO
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {areaLabel(plan.area)}
            </span>
          </div>
          <span className={cn("flex items-center gap-1 text-[10px] font-semibold", priorityColor(plan.priority))}>
            <span className="inline-block h-2 w-2 rounded-full bg-current/70" />
            {priorityLabel(plan.priority)}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-slate-900 dark:text-slate-100">
          {plan.title}
        </p>
        {plan.status === "blocked" && (plan.blockedNote?.trim() ?? "") !== "" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-orange-400/40 bg-orange-400/10 px-3 py-2 text-xs text-orange-900 dark:text-orange-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{plan.blockedNote}</span>
          </div>
        )}
        <div className="mt-3 border-t" />
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border bg-sky-100 text-[10px] font-semibold text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200"
              title={plan.ownerName}
            >
              {initials(plan.ownerName)}
            </div>
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">
              {plan.ownerName}
            </span>
          </div>
          <div className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>
            <Clock className="h-3.5 w-3.5" />
            {new Date(plan.dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </div>
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-80 transition hover:bg-accent hover:text-foreground group-hover:opacity-100"
          aria-label="Ações"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}

function PlanCardInner({ plan }: { plan: ActionPlan }) {
  return <ActionPlanCard plan={plan} />
}

export function KanbanBoard({ plans }: { plans: ActionPlan[] }) {
  return <ActionPlanKanban plans={plans} />
}

function PlanCardOverlay({ plan }: { plan: ActionPlan }) {
  return (
    <div className="w-[280px] rotate-1">
      <PlanCardInner plan={plan} />
    </div>
  )
}

export function ActionPlanKanban({
  plans,
  allPlans,
  onStatusChange,
}: {
  plans: ActionPlan[]
  allPlans?: ActionPlan[]
  onStatusChange?: (id: number, status: string) => void
}) {
  const effectiveAllPlans = allPlans ?? plans
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const byColumn = useMemo(() => {
    const map = new Map<ActionPlan["status"], ActionPlan[]>()
    for (const c of COLUMN_ORDER) map.set(c, [])
    for (const p of plans) {
      const list = map.get(p.status) ?? []
      list.push(p)
      map.set(p.status, list)
    }
    return map
  }, [plans])

  const activePlan = activeId != null ? effectiveAllPlans.find((p) => p.id === activeId) : null

  function resolveTargetStatus(overId: string | number): ActionPlan["status"] | null {
    if (typeof overId === "string" && COLUMN_ORDER.includes(overId as ActionPlan["status"])) {
      return overId as ActionPlan["status"]
    }
    if (typeof overId === "number") {
      const p = effectiveAllPlans.find((x) => x.id === overId)
      return p?.status ?? null
    }
    return null
  }

  function onDragStart(event: DragStartEvent) {
    const id = event.active.id
    if (typeof id === "number") setActiveId(id)
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const planId = active.id
    if (typeof planId !== "number") return
    const next = resolveTargetStatus(over.id)
    if (next) onStatusChange?.(planId, next)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex min-w-max gap-6 pb-2">
          {COLUMN_ORDER.map((status) => {
            const columnPlans = byColumn.get(status) ?? []
            return (
              <KanbanColumn key={status} status={status} count={columnPlans.length}>
                {columnPlans.map((plan) => (
                  <PlanCardDrag key={plan.id} plan={plan} />
                ))}
                {status === "delivered" && columnPlans.length > 0 && (
                  <button
                    type="button"
                    className="w-full rounded-xl border border-dashed bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/50"
                    onClick={(e) => e.preventDefault()}
                  >
                    + {Math.max(0, columnPlans.length - 2)} entregues — ver histórico
                  </button>
                )}
              </KanbanColumn>
            )
          })}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activePlan ? <PlanCardOverlay plan={activePlan} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
