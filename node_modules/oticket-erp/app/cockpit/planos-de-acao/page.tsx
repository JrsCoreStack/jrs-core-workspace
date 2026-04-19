"use client"

import { Suspense, useEffect, useMemo, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CreateActionPlanDialog } from "@/components/cockpit/dialogs/create-action-plan-dialog"
import { KanbanBoard } from "@/components/cockpit/planos-de-acao/kanban-board"
import { ActionPlanDetailsDialog } from "@/components/cockpit/planos-de-acao/action-plan-details-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import api from "@/utils/api"
import { normalizeAreaSlug } from "@/lib/cockpit/constants"
import { toastApiError } from "@/lib/cockpit/api-error"
import type { ActionPlan } from "@/components/cockpit/planos-de-acao/action-plan-card"

/* Status labels */
const STATUS_LABELS: Record<string, string> = {
  planned: "Planejado",
  in_progress: "Em Execução",
  blocked: "Bloqueado",
  delivered: "Concluído",
  archived: "Arquivado",
}

function coercePriority(v: unknown): ActionPlan["priority"] {
  return v === "high" || v === "medium" || v === "low" ? v : "medium"
}

function coerceStatus(v: unknown): ActionPlan["status"] {
  return v === "planned" || v === "in_progress" || v === "blocked" || v === "delivered" || v === "archived"
    ? v
    : "planned"
}

function normalizePlan(p: Record<string, unknown>): ActionPlan {
  const toId = (v: unknown): string | null => {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s ? s : null
  }
  const createdRaw = p.created_at as string | Date | undefined
  const createdAt =
    createdRaw instanceof Date
      ? createdRaw.toISOString()
      : typeof createdRaw === "string"
        ? createdRaw
        : undefined

  return {
    id: String(p.id ?? ""),
    title: (p.title as string) ?? "",
    area: String(normalizeAreaSlug((p.area as string) ?? "")),
    ownerName: (p.owner_name as string) ?? "",
    dueDate: (p.due_date as string) ?? "",
    createdAt,
    priority: coercePriority(p.priority),
    status: coerceStatus(p.status),
    ritualId: toId(p.ritual_id),
    meetingId: toId(p.meeting_id),
    blockedNote: (p.blocked_note as string) ?? undefined,
    notes: (p.description as string) ?? null,
    history: Array.isArray(p.history) ? (p.history as Array<{ action: string; at: string; by: string }>) : [],
    dependsOnPlanId: toId(p.depends_on_plan_id),
    comments: Array.isArray(p.comments)
      ? (p.comments as Array<{ id: string; text: string; at: string; by: string; parent_id?: string | null }>)
      : [],
  }
}

type NormalizedPlan = ActionPlan

const AREAS = [
  { slug: "COMMERCIAL", name: "Comercial" },
  { slug: "MARKETING", name: "Marketing" },
  { slug: "FINANCIAL", name: "Financeiro" },
  { slug: "TECHNOLOGY", name: "Tecnologia" },
  { slug: "OPERATIONAL", name: "Operacional" },
  { slug: "STRATEGIC", name: "Estratégico" },
  { slug: "PLAY", name: "Play" },
]

type FilterChip = "all" | "mine" | "team" | "overdue"

function PlanosDeAcaoPageInner() {
  const searchParams = useSearchParams()
  const [actionPlans, setActionPlans] = useState<NormalizedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const detailsPlan = detailsId != null ? actionPlans.find((p) => p.id === detailsId) ?? null : null

  const [area, setArea] = useState<string>("all")
  const [ritualFilter, setRitualFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [priority, setPriority] = useState<string>("all")
  const [chip, setChip] = useState<FilterChip>("all")

  const todayIso = new Date().toISOString().slice(0, 10)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/cockpit/action-plans", { params: { today: todayIso } })
      setActionPlans((res.data ?? []).map(normalizePlan))
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao carregar planos de ação." })
    } finally {
      setLoading(false)
    }
  }, [todayIso])

  useEffect(() => { void fetchPlans() }, [fetchPlans])

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) setDetailsId(id)
    const due = searchParams.get("due")
    if (due === "overdue") setChip("overdue")
  }, [searchParams])

  const ritualIdParam = searchParams.get("ritual_id")
  const meetingIdParam = searchParams.get("meeting_id")

  const filtered = useMemo(() => {
    return actionPlans.filter((p) => {
      const a = area === "all" || String(normalizeAreaSlug(p.area)) === area
      const pr = priority === "all" || p.priority === priority
      const overdue = p.status !== "delivered" && p.status !== "archived" && p.dueDate < todayIso
      const chipOk =
        chip === "all" ||
        (chip === "overdue" && overdue) ||
        chip === "mine" ||
        chip === "team"
      const ritualOk = ritualFilter === "all" || p.ritualId === ritualFilter
      const ownerOk = ownerFilter === "all" || p.ownerName === ownerFilter
      return a && pr && chipOk && ritualOk && ownerOk
    })
  }, [actionPlans, area, priority, chip, ritualFilter, ownerFilter, todayIso])

  const counts = useMemo(() => {
    const active = actionPlans.filter((p) => p.status !== "delivered" && p.status !== "archived").length
    const blocked = actionPlans.filter((p) => p.status === "blocked").length
    const delivered = actionPlans.filter((p) => p.status === "delivered").length
    const overdue = actionPlans.filter(
      (p) => p.status !== "delivered" && p.status !== "archived" && p.dueDate < todayIso
    ).length
    return { active, blocked, delivered, overdue }
  }, [actionPlans, todayIso])

  const uniqueOwners = useMemo(() => {
    const names = [...new Set(actionPlans.map((p) => p.ownerName).filter(Boolean))]
    return names
  }, [actionPlans])

  const isEmpty = !loading && actionPlans.length === 0

  return (
    <>
      <style>{`
        .pa-page { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

        /* TOPBAR */
        .pa-topbar {
          background: var(--rf-bg-surface);
          border-bottom: 1px solid var(--rf-border-subtle);
          padding: 16px 20px;
          flex-shrink: 0;
        }
        .pa-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .pa-title {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 20px;
          font-weight: 800;
          color: var(--rf-text-primary);
          letter-spacing: -0.3px;
        }
        .pa-sub {
          font-size: 12px;
          color: var(--rf-text-secondary);
          margin-top: 3px;
        }
        .pa-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }

        /* FILTER ROW */
        .pa-filter-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pa-filter-row::-webkit-scrollbar { display: none; }

        .pa-filter-select {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 10px;
          padding: 7px 28px 7px 10px;
          color: var(--rf-text-primary);
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%237e8a9e' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          flex-shrink: 0;
          transition: border-color 0.18s;
        }
        .pa-filter-select:focus { border-color: var(--rf-accent); }

        .pa-filter-sep { width: 1px; height: 20px; background: var(--rf-border-default); flex-shrink: 0; }

        .pa-fchip {
          flex-shrink: 0;
          padding: 6px 13px;
          border-radius: 9999px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          font-size: 12px;
          font-weight: 600;
          color: var(--rf-text-secondary);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .pa-fchip:hover { border-color: var(--rf-accent); color: var(--rf-accent); }
        .pa-fchip.active {
          background: var(--rf-accent-soft, rgba(123,97,255,0.12));
          color: var(--rf-accent, #7b61ff);
          border-color: var(--rf-accent-border, rgba(123,97,255,0.28));
        }
        .pa-fchip.danger {
          background: rgba(239,68,68,0.10);
          color: #ef4444;
          border-color: rgba(239,68,68,0.22);
        }

        /* NOVO PLANO BTN */
        .pa-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          background: var(--rf-accent, #7b61ff);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(123,97,255,0.35);
          transition: all 0.18s;
          white-space: nowrap;
        }
        .pa-btn-primary:hover { background: var(--rf-accent-hover, #9178ff); transform: translateY(-1px); }

        /* KANBAN WRAPPER */
        .pa-kanban-wrap {
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* EMPTY STATE */
        .pa-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          flex: 1;
        }
        .pa-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          display: grid;
          place-items: center;
          margin-bottom: 20px;
          color: var(--rf-text-muted);
        }
        .pa-empty-title {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--rf-text-primary);
          margin-bottom: 8px;
        }
        .pa-empty-desc {
          font-size: 13px;
          color: var(--rf-text-secondary);
          line-height: 1.6;
          max-width: 280px;
          margin-bottom: 24px;
        }
        .pa-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 10px;
          background: var(--rf-accent, #7b61ff);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(123,97,255,0.35);
          transition: all 0.18s;
        }
        .pa-empty-btn:hover { background: var(--rf-accent-hover, #9178ff); }

        .pa-sidebar-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          cursor: pointer;
          color: var(--rf-text-secondary);
          flex-shrink: 0;
          transition: all 0.18s;
        }
        .pa-sidebar-trigger:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
      `}</style>

      <div className="pa-page">
        {/* TOPBAR */}
        <div className="pa-topbar">
          <div className="pa-top-row">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <SidebarTrigger className="pa-sidebar-trigger" style={{ marginTop: 2 }} />
              <div>
                <div className="pa-title">Planos de Ação</div>
                <div className="pa-sub">
                  {isEmpty
                    ? "Nenhum plano criado ainda."
                    : `${counts.active} planos ativos · ${counts.blocked} bloqueados · ${counts.delivered} concluídos`}
                </div>
              </div>
            </div>
            <div className="pa-actions">
              <CreateActionPlanDialog
                onCreated={() => void fetchPlans()}
                trigger={
                  <button type="button" className="pa-btn-primary">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Novo Plano
                  </button>
                }
              />
            </div>
          </div>

          {!isEmpty && (
            <div className="pa-filter-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>

              <select className="pa-filter-select" value={area} onChange={(e) => setArea(e.target.value)}>
                <option value="all">Todas as áreas</option>
                {AREAS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>

              <select className="pa-filter-select" value={ritualFilter} onChange={(e) => setRitualFilter(e.target.value)}>
                <option value="all">Todos os rituais</option>
              </select>

              <select className="pa-filter-select" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
                <option value="all">Todos os responsáveis</option>
                {uniqueOwners.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>

              <select className="pa-filter-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="all">Todas as prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <div className="pa-filter-sep" />

              <div className={`pa-fchip${chip === "mine" ? " active" : ""}`} onClick={() => setChip(chip === "mine" ? "all" : "mine")}>
                Meus planos
              </div>
              <div className={`pa-fchip${chip === "team" ? " active" : ""}`} onClick={() => setChip(chip === "team" ? "all" : "team")}>
                Da equipe
              </div>
              {counts.overdue > 0 && (
                <div className={`pa-fchip${chip === "overdue" ? " active danger" : " danger"}`} onClick={() => setChip(chip === "overdue" ? "all" : "overdue")}>
                  Atrasados ({counts.overdue})
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--rf-text-muted)", fontSize: 13 }}>
            Carregando planos…
          </div>
        ) : isEmpty ? (
          <div className="pa-empty">
            <div className="pa-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="pa-empty-title">Nenhum plano de ação</div>
            <div className="pa-empty-desc">
              Crie planos de ação para transformar decisões dos rituais em tarefas executáveis pela equipe.
            </div>
            <CreateActionPlanDialog
              onCreated={() => void fetchPlans()}
              trigger={
                <button type="button" className="pa-empty-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Criar primeiro plano
                </button>
              }
            />
          </div>
        ) : (
          <div className="pa-kanban-wrap">
            <KanbanBoard
              plans={filtered}
              allPlans={actionPlans}
              onOpenDetails={setDetailsId}
              onStatusChange={async (id, newStatus) => {
                setActionPlans((prev) =>
                  prev.map((p) => String(p.id) === String(id) ? { ...p, status: newStatus } : p)
                )
                try {
                  await api.put(`/cockpit/action-plans/${id}`, { status: newStatus })
                } catch (e) {
                  toastApiError(e, { fallback: "Não foi possível alterar o status." })
                  void fetchPlans()
                }
              }}
            />
          </div>
        )}

        <ActionPlanDetailsDialog
          open={detailsId != null}
          onOpenChange={(open) => setDetailsId(open ? detailsId : null)}
          plan={detailsPlan}
          onPlanUpdated={() => void fetchPlans()}
        />
      </div>
    </>
  )
}

export default function PlanosDeAcaoPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--rf-text-muted)", fontSize: 13 }}>
        Carregando planos…
      </div>
    }>
      <PlanosDeAcaoPageInner />
    </Suspense>
  )
}
