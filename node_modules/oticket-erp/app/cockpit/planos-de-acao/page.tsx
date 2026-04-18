"use client"

import { Input } from "@/components/ui/input"
import { Suspense, useEffect, useMemo, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateActionPlanDialog } from "@/components/cockpit/dialogs/create-action-plan-dialog"
import { Columns3, List, Search, ClipboardList, Play, Ban, PackageCheck, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KanbanBoard } from "@/components/cockpit/planos-de-acao/kanban-board"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { ActionPlanDetailsDialog } from "@/components/cockpit/planos-de-acao/action-plan-details-dialog"
import { Header } from "@/components/ui/header"
import api from "@/utils/api"
import { normalizeAreaSlug } from "@/lib/cockpit/constants"
import { toastApiError } from "@/lib/cockpit/api-error"
import type { ActionPlan } from "@/components/cockpit/planos-de-acao/action-plan-card"

/* Status labels */
const STATUS_LABELS: Record<string, string> = {
  planned: "Planejado",
  in_progress: "Em Execução",
  blocked: "Bloqueado",
  delivered: "Entregue",
  archived: "Arquivado",
}

/* Adapter: normalize API snake_case to the shape components expect */
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

function PlanosDeAcaoPageInner() {
  const searchParams = useSearchParams()
  const [actionPlans, setActionPlans] = useState<NormalizedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const detailsPlan = detailsId != null ? actionPlans.find((p) => p.id === detailsId) ?? null : null

  const [area, setArea] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [due, setDue] = useState<string>("any")
  const [priority, setPriority] = useState<string>("all")

  const todayIso = new Date().toISOString().slice(0, 10)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/cockpit/action-plans", { params: { today: todayIso } })
      setActionPlans((res.data ?? []).map(normalizePlan))
    } catch (e) {
      console.error("Erro ao carregar planos de ação:", e)
      toastApiError(e, { fallback: "Erro ao carregar planos de ação." })
    }
    finally { setLoading(false) }
  }, [todayIso])

  useEffect(() => { void fetchPlans() }, [fetchPlans])

  useEffect(() => {
    const d = searchParams.get("due")
    if (d === "overdue" || d === "today") setDue(d)
    const id = searchParams.get("id")
    if (id) setDetailsId(id)
  }, [searchParams])

  const ritualIdParam = searchParams.get("ritual_id")
  const meetingIdParam = searchParams.get("meeting_id")
  const [cadenceDash, setCadenceDash] = useState<{
    open: number
    overdue: number
    blocked: number
    pending: number
  } | null>(null)

  useEffect(() => {
    if (!ritualIdParam && !meetingIdParam) {
      setCadenceDash(null)
      return
    }
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/action-plans/dashboard/summary", {
          params: {
            ...(ritualIdParam ? { ritual_id: ritualIdParam } : {}),
            ...(meetingIdParam ? { meeting_id: meetingIdParam } : {}),
          },
        })
        if (alive)
          setCadenceDash(
            (data ?? null) as { open: number; overdue: number; blocked: number; pending: number } | null,
          )
      } catch {
        if (alive) setCadenceDash(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [ritualIdParam, meetingIdParam])

  const filtered = useMemo(() => {
    return actionPlans.filter((p) => {
      const a = area === "all" || String(normalizeAreaSlug(p.area)) === area
      const s = status === "all" || p.status === status
      const pr = priority === "all" || p.priority === priority
      const overdue = p.status !== "delivered" && p.status !== "archived" && p.dueDate < todayIso
      const d =
        due === "any" ||
        (due === "overdue" && overdue) ||
        (due === "today" && p.dueDate === todayIso)
      const text =
        q.trim() === "" ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(q.toLowerCase())
      return a && s && pr && d && text
    })
  }, [actionPlans, area, status, due, priority, q])

  const counts = useMemo(() => {
    const planned = actionPlans.filter((p) => p.status === "planned").length
    const inProgress = actionPlans.filter((p) => p.status === "in_progress").length
    const blocked = actionPlans.filter((p) => p.status === "blocked").length
    const delivered = actionPlans.filter((p) => p.status === "delivered").length
    const overdue = actionPlans.filter(
      (p) => p.status !== "delivered" && p.status !== "archived" && p.dueDate < todayIso
    ).length
    return { planned, inProgress, blocked, delivered, overdue }
  }, [actionPlans, todayIso])

  return (
    <>
      <Header
        title="Planos de Ação"
        description="Acompanhamento e gestão de todas as ações da empresa"
        actions={
          <CreateActionPlanDialog
            onCreated={() => void fetchPlans()}
            trigger={
              <Button type="button" variant="default" size="sm">
                + Novo Plano
              </Button>
            }
          />
        }
      />
      <main className={COCKPIT_MAIN_CLASS}>
        {cadenceDash != null && (ritualIdParam || meetingIdParam) ? (
          <div className="mb-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
            <div className="font-semibold">Painel desta cadência</div>
            <p className="mt-1 text-emerald-900/90 dark:text-emerald-200/90">
              Em aberto: <strong>{cadenceDash.open}</strong> · Atrasados:{" "}
              <strong>{cadenceDash.overdue}</strong> · Bloqueados: <strong>{cadenceDash.blocked}</strong> · Total
              pendente: <strong>{cadenceDash.pending}</strong>
            </p>
          </div>
        ) : null}

        {/* Resumo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "PLANEJADO",   value: counts.planned,    color: "#6366f1", Icon: ClipboardList },
            { label: "EM EXECUÇÃO", value: counts.inProgress, color: "#06b6d4", Icon: Play },
            { label: "BLOQUEADO",   value: counts.blocked,    color: "#fb923c", Icon: Ban },
            { label: "ENTREGUE",    value: counts.delivered,  color: "#22c55e", Icon: PackageCheck },
            { label: "ATRASADO",    value: counts.overdue,    color: "#ef4444", Icon: Clock },
          ].map((c) => (
            <Card
              key={c.label}
              className="bg-card border-border"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: c.color }}>
                      {c.value}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: c.color + "18" }}>
                    <c.Icon className="h-6 w-6" style={{ color: c.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barra de filtros + toggle */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9 bg-background"
                placeholder="Buscar por título ou responsável..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="h-9 w-full sm:w-[170px]">
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {AREAS.map((a) => (
                    <SelectItem key={a.slug} value={a.slug}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-full sm:w-[170px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="planned">Planejado</SelectItem>
                <SelectItem value="in_progress">Em execução</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={due} onValueChange={setDue}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder="Qualquer prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer prazo</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9 w-full sm:w-[140px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prioridade</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                <div
                  role="tablist"
                  aria-label="Visualização"
                  className="relative grid h-10 grid-cols-2 rounded-lg border border-border bg-muted/30 p-1"
                >
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-1 w-[calc(50%-4px)] rounded-md bg-primary transition-transform duration-200 ease-out",
                      view === "table" ? "translate-x-0" : "translate-x-full"
                    )}
                  />
                  <button
                    role="tab"
                    aria-selected={view === "table"}
                    type="button"
                    onClick={() => setView("table")}
                    className={cn(
                      "relative z-10 inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                      view === "table" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </button>
                  <button
                    role="tab"
                    aria-selected={view === "kanban"}
                    type="button"
                    onClick={() => setView("kanban")}
                    className={cn(
                      "relative z-10 inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                      view === "kanban" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Columns3 className="h-4 w-4" />
                    Kanban
                  </button>
                </div>
                <div className="sm:hidden">
                  <CreateActionPlanDialog
                    trigger={<Button type="button">+ Novo</Button>}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 min-w-0">
          {view === "kanban" ? (
            <KanbanBoard
              plans={filtered}
              allPlans={actionPlans}
              onOpenDetails={setDetailsId}
              onStatusChange={async (id, newStatus) => {
                // Optimistic update — move card immediately
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
          ) : (
            <ActionPlansListTable
              plans={filtered}
              todayIso={todayIso}
              onOpenDetails={setDetailsId}
            />
          )}
        </div>

        <ActionPlanDetailsDialog
          open={detailsId != null}
          onOpenChange={(open) => setDetailsId(open ? detailsId : null)}
          plan={detailsPlan}
          onPlanUpdated={() => void fetchPlans()}
        />
      </main>
    </>
  )
}

export default function PlanosDeAcaoPage() {
  return (
    <Suspense fallback={<main className={COCKPIT_MAIN_CLASS}><p className="p-6 text-sm text-muted-foreground">Carregando planos…</p></main>}>
      <PlanosDeAcaoPageInner />
    </Suspense>
  )
}

function shortDateWithYear(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  const dayMonth = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  return { dayMonth, year: d.getFullYear() }
}

function statusPillClass(status: string) {
  if (status === "in_progress") return "border-sky-200 bg-sky-50 text-sky-700"
  if (status === "blocked") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  return "border-indigo-200 bg-indigo-50 text-indigo-700"
}

function priorityPill(priority: string) {
  if (priority === "high") return { dot: "bg-red-500", pill: "bg-red-50 text-red-700" as const, label: "Alta" }
  if (priority === "medium") return { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800" as const, label: "Média" }
  return { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800" as const, label: "Baixa" }
}

function avatarColorsForName(name: string) {
  const palette = [
    { bg: "bg-sky-100", text: "text-sky-800", ring: "ring-sky-200" },
    { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" },
    { bg: "bg-violet-100", text: "text-violet-800", ring: "ring-violet-200" },
    { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" },
    { bg: "bg-rose-100", text: "text-rose-800", ring: "ring-rose-200" },
  ]
  const hash = name.trim().toLowerCase().split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? "?"
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

function meetingLine(ritualId: string | null, meetingId: string | null) {
  if (!ritualId && !meetingId) return null
  // Placeholder — API de ritual/reunião ainda não está sendo consultada aqui
  return null
}

function ActionPlansListTable({
  plans,
  todayIso,
  onOpenDetails,
}: {
  plans: NormalizedPlan[]
  todayIso: string
  onOpenDetails: (id: string) => void
}) {
  const pageSize = 8
  const [page, setPage] = useState(1)
  const total = plans.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = plans.slice(start, start + pageSize)

  const pageButtons = useMemo(() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const last = totalPages
    return [1, 2, 3, "…", last] as const
  }, [totalPages])

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[36%]">Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((p: NormalizedPlan) => {
            const overdue = p.status !== "delivered" && p.status !== "archived" && p.dueDate < todayIso
            const delivered = p.status === "delivered"
            const meeting = meetingLine(p.ritualId ?? null, p.meetingId ?? null)
            const area = AREAS.find((a) => a.slug === p.area)?.name ?? p.area
            const { dayMonth, year } = shortDateWithYear(p.dueDate)
            const avatar = avatarColorsForName(p.ownerName)
            const pr = priorityPill(p.priority)

            return (
              <TableRow
                key={p.id}
                className={cn("cursor-pointer", overdue && "bg-destructive/5")}
                onClick={() => onOpenDetails(p.id)}
              >
                <TableCell className="align-top">
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {overdue && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-bold text-destructive">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        ATRASADO
                      </span>
                    )}
                    {meeting && <span className="text-muted-foreground">{meeting}</span>}
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                      statusPillClass(p.status)
                    )}
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-1",
                        avatar.bg,
                        avatar.text,
                        avatar.ring
                      )}
                    >
                      {initials(p.ownerName)}
                    </div>
                    <span className="text-sm text-foreground">{p.ownerName}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className={cn("flex items-baseline gap-2", overdue && "text-destructive")}>
                    <span className={cn("text-sm font-semibold", delivered && "line-through text-muted-foreground")}>
                      {dayMonth}
                    </span>
                    <span className={cn("font-mono text-xs text-muted-foreground", overdue && "text-destructive", delivered && "text-muted-foreground")}>
                      {year}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{area}</TableCell>

                <TableCell>
                  <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", pr.pill)}>
                    <span className={cn("h-2 w-2 rounded-full", pr.dot)} />
                    {pr.label}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">Exibindo {pageItems.length} de {total} planos</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>← Anterior</Button>

          {pageButtons.map((n, idx) =>
            n === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
            ) : (
              <Button
                key={n}
                variant={safePage === n ? "default" : "outline"}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setPage(Number(n))}
              >
                {n}
              </Button>
            )
          )}

          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Próxima →</Button>
        </div>
      </div>
    </div>
  )
}
