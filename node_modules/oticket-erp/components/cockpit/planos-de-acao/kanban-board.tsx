"use client"

import { useMemo, useState, useCallback } from "react"
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
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { ActionPlanCard, type ActionPlan } from "./action-plan-card"
import { CreateActionPlanDialog } from "@/components/cockpit/dialogs/create-action-plan-dialog"

type PlanStatus = ActionPlan["status"]

const COLUMNS: {
  key: Exclude<PlanStatus, "archived">
  label: string
  dot: string
}[] = [
  { key: "planned", label: "PLANEJADO", dot: "#3b82f6" },
  { key: "in_progress", label: "EM EXECUÇÃO", dot: "#06b6d4" },
  { key: "blocked", label: "BLOQUEADO", dot: "#fb923c" },
  { key: "delivered", label: "ENTREGUE", dot: "#22c55e" },
]

function ColumnHeader({
  label,
  count,
  dotColor,
}: {
  label: string
  count: number
  dotColor: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-border">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          {label}
        </span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {count}
        </span>
      </div>
      <CreateActionPlanDialog
        trigger={
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label={`Adicionar em ${label}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      />
    </div>
  )
}

function DroppableColumn({
  id,
  children,
}: {
  id: Exclude<PlanStatus, "archived">
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[180px] flex-1",
        isOver &&
          "ring-2 ring-emerald-600 ring-offset-2 ring-offset-slate-50 dark:ring-offset-background"
      )}
    >
      {children}
    </div>
  )
}

function DraggableCard({
  plan,
  onOpenDetails,
}: {
  plan: ActionPlan
  onOpenDetails?: (planId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: plan.id,
    data: { type: "plan" },
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
      <ActionPlanCard plan={plan} onOpenDetails={onOpenDetails} />
    </div>
  )
}

const INITIAL_VISIBLE = 4

export function KanbanBoard({
  plans,
  allPlans,
  onOpenDetails,
  onStatusChange,
}: {
  plans: ActionPlan[]
  allPlans?: ActionPlan[]
  onOpenDetails?: (planId: string) => void
  onStatusChange?: (id: string, status: ActionPlan["status"]) => void
}) {
  const effectiveAllPlans = allPlans ?? plans
  const [activeId, setActiveId] = useState<string | null>(null)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleExpand = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const byColumn = useMemo(() => {
    const map = new Map<Exclude<PlanStatus, "archived">, ActionPlan[]>()
    for (const c of COLUMNS) map.set(c.key, [])
    for (const p of plans) {
      if (p.status !== "archived") map.get(p.status as Exclude<PlanStatus, "archived">)?.push(p)
    }
    return map
  }, [plans])

  const activePlan = activeId != null ? effectiveAllPlans.find((p) => p.id === activeId) : null

  const resolveStatusFromOver = (
    overId: string | number
  ): Exclude<PlanStatus, "archived"> | null => {
    const overStr = String(overId)
    if (COLUMNS.some((c) => c.key === overStr)) {
      return overStr as Exclude<PlanStatus, "archived">
    }
    const p = effectiveAllPlans.find((x) => String(x.id) === overStr)
    if (!p || p.status === "archived") return null
    return p.status as Exclude<PlanStatus, "archived">
  }

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!e.over) return
    const planId = String(e.active.id)
    const next = resolveStatusFromOver(e.over.id)
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
        <div className="flex min-w-[760px] gap-4">
          {COLUMNS.map((col) => {
            const items = byColumn.get(col.key) ?? []
            const isExpanded = !!expanded[col.key]
            const visibleItems = isExpanded ? items : items.slice(0, INITIAL_VISIBLE)
            const hiddenCount = Math.max(0, items.length - INITIAL_VISIBLE)

            return (
              <DroppableColumn key={col.key} id={col.key}>
                <ColumnHeader
                  label={col.label}
                  count={items.length}
                  dotColor={col.dot}
                />
                <div className="mt-3 space-y-3">
                  {visibleItems.map((p) => (
                    <DraggableCard key={p.id} plan={p} onOpenDetails={onOpenDetails} />
                  ))}

                  {items.length > INITIAL_VISIBLE && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(col.key)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-border dark:bg-muted/30 dark:text-muted-foreground dark:hover:bg-muted/40"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Ver menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Ver mais {hiddenCount} {hiddenCount === 1 ? "item" : "itens"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </DroppableColumn>
            )
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePlan ? (
          <div className="w-64 rotate-1 opacity-90">
            <ActionPlanCard plan={activePlan} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
