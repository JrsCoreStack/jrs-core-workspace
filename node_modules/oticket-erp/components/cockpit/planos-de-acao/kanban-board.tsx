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
import { ActionPlanCard, type ActionPlan } from "./action-plan-card"
import { CreateActionPlanDialog } from "@/components/cockpit/dialogs/create-action-plan-dialog"

type PlanStatus = ActionPlan["status"]

const COLUMNS: {
  key: Exclude<PlanStatus, "archived">
  label: string
  dot: string
  topBorder: string
  countStyle?: { background: string; color: string }
}[] = [
  { key: "planned",     label: "PLANEJADO",    dot: "#6366f1", topBorder: "#6366f1" },
  { key: "in_progress", label: "EM EXECUÇÃO",  dot: "#f59e0b", topBorder: "#f59e0b" },
  { key: "blocked",     label: "BLOQUEADO",    dot: "#ef4444", topBorder: "#ef4444", countStyle: { background: "rgba(239,68,68,0.10)", color: "#ef4444" } },
  { key: "delivered",   label: "CONCLUÍDO",    dot: "#22c55e", topBorder: "#22c55e", countStyle: { background: "rgba(34,197,94,0.10)", color: "#22c55e" } },
]

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
      className={cn("touch-none", isDragging && "opacity-40")}
      {...listeners}
      {...attributes}
    >
      <ActionPlanCard plan={plan} onOpenDetails={onOpenDetails} />
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
      style={{
        outline: isOver ? "2px solid var(--rf-accent, #7b61ff)" : undefined,
        outlineOffset: isOver ? "2px" : undefined,
        borderRadius: "0 0 14px 14px",
      }}
    >
      {children}
    </div>
  )
}

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
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCollapsed = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const byColumn = useMemo(() => {
    const map = new Map<Exclude<PlanStatus, "archived">, ActionPlan[]>()
    for (const c of COLUMNS) map.set(c.key, [])
    for (const p of plans) {
      if (p.status !== "archived") map.get(p.status as Exclude<PlanStatus, "archived">)?.push(p)
    }
    return map
  }, [plans])

  const archivedPlans = useMemo(() => plans.filter((p) => p.status === "archived"), [plans])
  const activePlan = activeId != null ? effectiveAllPlans.find((p) => p.id === activeId) : null

  const resolveStatusFromOver = (overId: string | number): Exclude<PlanStatus, "archived"> | null => {
    const overStr = String(overId)
    if (COLUMNS.some((c) => c.key === overStr)) return overStr as Exclude<PlanStatus, "archived">
    const p = effectiveAllPlans.find((x) => String(x.id) === overStr)
    if (!p || p.status === "archived") return null
    return p.status as Exclude<PlanStatus, "archived">
  }

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!e.over) return
    const planId = String(e.active.id)
    const next = resolveStatusFromOver(e.over.id)
    if (next) onStatusChange?.(planId, next)
  }

  return (
    <>
      <style>{`
        .kb-board {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 16px 20px 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--rf-border-strong, rgba(255,255,255,0.16)) transparent;
          min-height: calc(100vh - 180px);
          align-items: flex-start;
          height: 100%;
          overflow-y: auto;
        }
        .kb-board::-webkit-scrollbar { height: 5px; }
        .kb-board::-webkit-scrollbar-thumb { background: var(--rf-border-strong); border-radius: 3px; }

        .kb-col { flex-shrink: 0; width: 242px; display: flex; flex-direction: column; }

        .kb-col-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--rf-bg-surface);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 14px 14px 0 0;
          border-bottom: none;
        }
        .kb-col-head-row { display: flex; align-items: center; gap: 8px; }
        .kb-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .kb-col-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--rf-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }
        .kb-col-count {
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 9999px;
          background: var(--rf-bg-overlay, #1c1f28);
          color: var(--rf-text-secondary);
        }
        .kb-col-menu {
          color: var(--rf-text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.18s;
          background: none;
          border: none;
          display: flex;
          align-items: center;
        }
        .kb-col-menu:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }

        .kb-col-body {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 0 0 14px 14px;
          padding: 8px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 2px solid;
        }

        .kb-add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px dashed var(--rf-border-strong);
          color: var(--rf-text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          margin-top: 2px;
          background: transparent;
          width: 100%;
        }
        .kb-add-btn:hover {
          border-color: var(--rf-accent-border, rgba(123,97,255,0.28));
          color: var(--rf-accent, #7b61ff);
          background: var(--rf-accent-soft, rgba(123,97,255,0.08));
        }

        /* Archived col (collapsed) */
        .kb-col-archived-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--rf-bg-surface);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .kb-col-archived-head:hover { background: var(--rf-bg-hover); }
        .kb-col-archived-body {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 0 0 14px 14px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 2px solid var(--rf-text-muted, #3d4455);
        }

        /* Add new column button */
        .kb-col-add {
          flex-shrink: 0;
          width: 200px;
          align-self: flex-start;
        }
        .kb-col-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--rf-bg-surface);
          border: 1px dashed var(--rf-border-strong);
          border-radius: 14px;
          color: var(--rf-text-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          width: 100%;
        }
        .kb-col-add-btn:hover {
          border-color: var(--rf-accent-border, rgba(123,97,255,0.28));
          color: var(--rf-accent, #7b61ff);
          background: var(--rf-accent-soft, rgba(123,97,255,0.08));
        }
      `}</style>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="kb-board">
          {COLUMNS.map((col) => {
            const items = byColumn.get(col.key) ?? []
            const isCol = !collapsed[col.key]

            return (
              <div key={col.key} className="kb-col">
                {/* Column header */}
                <div className="kb-col-head">
                  <div className="kb-col-head-row">
                    <div className="kb-col-dot" style={{ background: col.dot }} />
                    <span className="kb-col-name">{col.label}</span>
                    <span
                      className="kb-col-count"
                      style={col.countStyle}
                    >
                      {items.length}
                    </span>
                  </div>
                  <button className="kb-col-menu" onClick={() => toggleCollapsed(col.key)} title="Menu">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>

                {/* Column body */}
                {isCol && (
                  <DroppableColumn id={col.key}>
                    <div
                      className="kb-col-body"
                      style={{ borderTopColor: col.topBorder }}
                    >
                      {items.map((p) => (
                        <DraggableCard key={p.id} plan={p} onOpenDetails={onOpenDetails} />
                      ))}

                      {items.length === 0 && (
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "28px 12px",
                          textAlign: "center",
                          opacity: 0.45,
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 6 }}>
                            {col.key === "delivered" ? "✓" : col.key === "blocked" ? "⊘" : "·"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--rf-text-muted)" }}>Nenhum plano</div>
                        </div>
                      )}

                      <CreateActionPlanDialog
                        onCreated={() => {}}
                        trigger={
                          <button type="button" className="kb-add-btn">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Adicionar plano
                          </button>
                        }
                      />
                    </div>
                  </DroppableColumn>
                )}
              </div>
            )
          })}

          {/* Archived column */}
          <div className="kb-col">
            <div
              className="kb-col-archived-head"
              style={{ borderRadius: archivedOpen ? "14px 14px 0 0" : 14, borderBottom: archivedOpen ? "none" : undefined }}
              onClick={() => setArchivedOpen((v) => !v)}
            >
              <div className="kb-col-head-row">
                <div className="kb-col-dot" style={{ background: "var(--rf-text-muted, #3d4455)" }} />
                <span className="kb-col-name" style={{ color: "var(--rf-text-muted)" }}>ARQUIVADO</span>
                <span className="kb-col-count">{archivedPlans.length}</span>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transition: "transform 0.2s", transform: archivedOpen ? "rotate(180deg)" : "none", color: "var(--rf-text-muted)" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {archivedOpen && (
              <div className="kb-col-archived-body">
                {archivedPlans.map((p) => (
                  <ActionPlanCard key={p.id} plan={p} onOpenDetails={onOpenDetails} />
                ))}
                {archivedPlans.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 12px", fontSize: 11, color: "var(--rf-text-muted)", opacity: 0.6 }}>
                    Nenhum plano arquivado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nova coluna button */}
          <div className="kb-col-add">
            <button type="button" className="kb-col-add-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nova coluna
            </button>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activePlan ? (
            <div style={{ width: 242, transform: "rotate(1deg)", opacity: 0.9 }}>
              <ActionPlanCard plan={activePlan} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
