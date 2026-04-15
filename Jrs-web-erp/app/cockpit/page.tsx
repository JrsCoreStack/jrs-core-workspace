"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import api from "@/utils/api"
import { COCKPIT_AREAS, areaColor, areaLabel } from "@/lib/cockpit/constants"
import Link from "next/link"
import {
  AlertTriangle,
  ClipboardList,
  FileDown,
  RefreshCw,
  TrendingDown,
} from "lucide-react"
import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

/* ── helpers ── */
function fmtVal(v: number, unit: string): string {
  if (unit === "R$" || unit === "BRL") {
    if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")}M`
    if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
    return `R$ ${v.toFixed(0)}`
  }
  if (unit === "%") return `${v.toFixed(1).replace(".", ",")}%`
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)
}

function devPct(current: number, goal: number): number {
  if (!goal) return 0
  return ((current - goal) / Math.abs(goal)) * 100
}

type KpiData = Record<string, unknown>

/** GET /cockpit/kpis devolve `is_cockpit` e `current_value`; o front legado usava `show_in_cockpit` / `current`. */
function kpiShowsInCockpit(k: KpiData): boolean {
  return k.show_in_cockpit === true || k.is_cockpit === true
}

function kpiCurrent(k: KpiData): number {
  const v = k.current_value ?? k.current
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function kpiGoal(k: KpiData): number {
  const g = k.goal ?? k.month_goal
  const n = typeof g === "number" ? g : Number(g)
  return Number.isFinite(n) ? n : 0
}

function kpiCodeLabel(k: KpiData): string {
  return String(k.code_ref ?? k.code ?? "")
}

/** Chave estável para listas React quando `id` pode faltar. */
function kpiReactKey(k: KpiData): string {
  return String(k.id ?? `${kpiCodeLabel(k)}-${String(k.name ?? "")}`)
}

/** Cor da série: com filtro de setor ativo, tudo acompanha a bolinha do setor; em “Todos”, cada KPI usa sua área. */
function kpiSeriesColor(kpi: KpiData, sectorFilter: string): string {
  if (sectorFilter && sectorFilter !== "all") return areaColor(sectorFilter)
  return areaColor(String(kpi.area ?? ""))
}

function formatChartAxisLabel(v: unknown): string {
  const raw = String(v ?? "")
  if (!raw.trim() || raw === "\u00a0") return ""
  const s = raw.trim()
  return s.length > 13 ? `${s.slice(0, 12)}…` : s
}

type KpiResultRow = {
  id?: string
  period_label: string
  value: number
  target?: number | null
  period_start?: string | null
}
type PeriodKey = "week" | "month" | "year"

/** Janela de calendário (prazos de planos, ocorrência de reuniões). */
function calendarPeriodDates(periodKey: PeriodKey, ref: Date): { from: string; to: string } {
  if (periodKey === "week") {
    const start = new Date(ref)
    start.setDate(start.getDate() - 6)
    return { from: start.toISOString().slice(0, 10), to: ref.toISOString().slice(0, 10) }
  }
  if (periodKey === "month") {
    const y = ref.getFullYear()
    const m = ref.getMonth()
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
  }
  const y = ref.getFullYear()
  return { from: `${y}-01-01`, to: `${y}-12-31` }
}

/** Próximo intervalo calendário alinhado ao período (semana/mês/ano) — para o 2º bloco da lateral. */
function nextCalendarPeriodDates(periodKey: PeriodKey, ref: Date): { from: string; to: string } {
  if (periodKey === "week") {
    const start = new Date(ref)
    start.setDate(start.getDate() + 1)
    const end = new Date(ref)
    end.setDate(end.getDate() + 7)
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
  }
  if (periodKey === "month") {
    const y = ref.getFullYear()
    const m = ref.getMonth()
    const start = new Date(y, m + 1, 1)
    const end = new Date(y, m + 2, 0)
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
  }
  const y = ref.getFullYear() + 1
  return { from: `${y}-01-01`, to: `${y}-12-31` }
}

function minIsoDate(a: string, b: string): string {
  return a < b ? a : b
}
function maxIsoDate(a: string, b: string): string {
  return a > b ? a : b
}

function parseResultDate(r: KpiResultRow): Date | null {
  const ps = r.period_start
  if (!ps || typeof ps !== "string") return null
  const d = new Date(ps.slice(0, 10) + "T12:00:00")
  return Number.isNaN(d.getTime()) ? null : d
}

/** Mantém pontos cujo `period_start` cai na janela; se nenhum tiver data, devolve tudo (compatibilidade). */
function filterResultsByPeriod(rows: KpiResultRow[], periodKey: PeriodKey, ref: Date): KpiResultRow[] {
  if (rows.length === 0) return rows
  const anyDate = rows.some((r) => parseResultDate(r) != null)
  if (!anyDate) return rows
  return rows.filter((r) => {
    const d = parseResultDate(r)
    if (!d) return true
    if (periodKey === "week") {
      const start = new Date(ref)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      const end = new Date(ref)
      end.setHours(23, 59, 59, 999)
      return d >= start && d <= end
    }
    if (periodKey === "month") {
      return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
    }
    return d.getFullYear() === ref.getFullYear()
  })
}

/* ── KPI chart: API lista vem sem `results`; detalhe traz histórico. Ordem cronológica para o eixo X. ── */
function KpiChart({
  kpi,
  height = 100,
  periodKey,
  sectorFilter,
}: {
  kpi: KpiData
  height?: number
  periodKey: PeriodKey
  sectorFilter: string
}) {
  const raw = (kpi.results as KpiResultRow[]) ?? []
  const goal = kpiGoal(kpi)
  const color = kpiSeriesColor(kpi, sectorFilter)
  const id = String(kpi.id ?? kpi.code_ref ?? kpi.code ?? kpi.name ?? "kpi")

  const windowRef = new Date()
  let inPeriod = filterResultsByPeriod(raw, periodKey, windowRef)
  if (inPeriod.length === 0 && raw.length > 0) inPeriod = raw
  /* Lista no backend vem do mais novo ao mais antigo; invertemos e pegamos até 6 períodos recentes em ordem temporal */
  const chronological = inPeriod.length > 0 ? [...inPeriod].reverse() : []
  const recent = chronological.slice(-6)
  let data = recent.length > 0
    ? recent.map((r) => ({
        label: r.period_label,
        actual: r.value,
        meta: (r.target ?? goal) as number,
      }))
    : [{ label: "Atual", actual: kpiCurrent(kpi), meta: goal }]

  /* Um único ponto não desenha área/linha visível no Recharts; duplicamos o ponto para formar segmento */
  if (data.length === 1) {
    const p = data[0]
    data = [
      { label: "\u00a0", actual: p.actual, meta: p.meta },
      { label: p.label || "Atual", actual: p.actual, meta: p.meta },
    ]
  }

  return (
    <ChartContainer
      className={cn(
        "w-full aspect-auto! font-sans text-xs text-muted-foreground",
        "[&_.recharts-cartesian-axis-tick_text]:text-xs [&_.recharts-cartesian-axis-tick_text]:font-normal [&_.recharts-surface]:font-sans",
      )}
      style={{ height }}
      config={{
        actual: { label: "Realizado", color },
        meta: { label: "Meta", color: "var(--muted-foreground)" },
      }}
    >
      <AreaChart data={data} margin={{ left: 2, right: 8, top: 10, bottom: 8 }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.80} />
            <stop offset="42%" stopColor={color} stopOpacity={0.70} />
            <stop offset="72%" stopColor={color} stopOpacity={0.50} />
            <stop offset="100%" stopColor={color} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        {/*
          stroke="#ccc" alinha ao seletor do ChartContainer (shadcn) que aplica stroke-border;
          hsl(var(--border)) no atributo SVG costuma não renderizar a grade visível.
        */}
        <CartesianGrid strokeDasharray="3 3" vertical horizontal stroke="#ccc" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#ccc" }}
          interval={0}
          tick={{ fontSize: 12 }}
          tickFormatter={formatChartAxisLabel}
          tickMargin={8}
          height={40}
        />
        {/* Eixo Y só com linha à esquerda (quadro do gráfico), sem escala — padrão visual tipo Shadcn */}
        <YAxis
          tickLine={false}
          axisLine={{ stroke: "#ccc" }}
          tick={false}
          width={1}
          domain={["auto", "auto"]}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={<ChartTooltipContent />}
        />
        <Area
          type="monotone"
          dataKey="actual"
          name="Realizado"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#g-${id})`}
          dot={{ r: 3.5, fill: color, stroke: "var(--background)", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="meta"
          name="Meta"
          stroke="var(--muted-foreground)"
          strokeWidth={1.75}
          strokeDasharray="6 4"
          dot={false}
        />
        <ChartLegend
          verticalAlign="bottom"
          align="center"
          content={<ChartLegendContent className="pt-2 [&>div]:justify-center" />}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

/* ── Donut: wrapper = tamanho do SVG; texto no centro geométrico (translate) ── */
function HealthDonut({ above, attention, critical, empty }: { above: number; attention: number; critical: number; empty: number }) {
  /** Recharts gera IDs de clipPath com contador global; SSR e cliente divergem e quebram a hidratação. */
  const chartReady = useIsClient()

  const total = Math.max(1, above + attention + critical + empty)
  const pct = Math.round((above / total) * 100)
  const data = [
    { name: "ok", value: above },
    { name: "warn", value: attention },
    { name: "crit", value: critical },
    { name: "nd", value: empty },
  ]
  const size = 90
  return (
    <div
      className="relative mx-auto shrink-0 overflow-visible"
      style={{ width: size, height: size }}
    >
      {chartReady ? (
        <ChartContainer
          config={{
            ok: { label: "Atingindo", color: "var(--chart-1)" },
            warn: { label: "Atenção", color: "var(--chart-4)" },
            crit: { label: "Crítico", color: "var(--chart-5)" },
            nd: { label: "Sem dado", color: "var(--border)" },
          }}
          className={cn(
            "aspect-auto! mx-auto h-[90px] w-[90px] font-sans",
            "[&_.recharts-pie-label-text]:text-[10px]",
          )}
        >
          <PieChart className="[&_.recharts-surface]:outline-none">
            <ChartTooltip content={<ChartTooltipContent hideIndicator={false} />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={`var(--color-${entry.name})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      ) : (
        <div className="h-[90px] w-[90px]" aria-hidden />
      )}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex w-[min(100%,3.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0 text-center"
        aria-hidden
      >
        <span className="block w-full text-base font-bold leading-none tabular-nums tracking-tight text-foreground">{pct}%</span>
        <span className="mt-1 block w-full text-[10px] font-medium uppercase leading-none tracking-wide text-muted-foreground">
          meta
        </span>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function CockpitPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KpiData[]>([])
  const [rituals, setRituals] = useState<KpiData[]>([])
  const [plans, setPlans] = useState<KpiData[]>([])
  const [meetings, setMeetings] = useState<KpiData[]>([])
  const [activeArea, setActiveArea] = useState("all")
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("month")

  const todayIso = new Date().toISOString().slice(0, 10)
  const todayLabel = new Date(`${todayIso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })

  async function refreshAll() {
    setLoading(true)
    try {
      const areaParams = activeArea !== "all" ? { area: activeArea } : {}
      const ref = new Date()
      const cur = calendarPeriodDates(activePeriod, ref)
      const next = nextCalendarPeriodDates(activePeriod, ref)
      const meetingParams = {
        ...areaParams,
        occurred_from: `${minIsoDate(cur.from, next.from)}T00:00:00.000Z`,
        occurred_to: `${maxIsoDate(cur.to, next.to)}T23:59:59.999Z`,
      }
      const [kR, rR, pR, mR] = await Promise.all([
        api.get("/cockpit/kpis", { params: areaParams }),
        api.get("/cockpit/rituals", { params: { status: "active", ...areaParams } }),
        api.get("/cockpit/action-plans", { params: { today: todayIso, ...areaParams } }),
        api.get("/cockpit/meetings", { params: meetingParams }),
      ])
      const list: KpiData[] = kR.data ?? []
      /* Painel precisa do histórico (`results`); só vem em GET /cockpit/kpis/:id */
      const kpisMerged = await Promise.all(
        list.map(async (k) => {
          if (!kpiShowsInCockpit(k) || k.id == null) return k
          try {
            const { data } = await api.get<KpiData>(`/cockpit/kpis/${String(k.id)}`)
            return data
          } catch {
            return k
          }
        }),
      )
      setKpis(kpisMerged)
      setRituals(rR.data ?? [])
      setPlans(pR.data ?? [])
      setMeetings(mR.data ?? [])
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  useEffect(() => { void refreshAll() }, [activeArea, activePeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  const periodDateBounds = useMemo(
    () => calendarPeriodDates(activePeriod, new Date(`${todayIso}T12:00:00`)),
    [activePeriod, todayIso],
  )

  /* ── derived data ── */
  const kpiCounts = useMemo(() => ({
    above: kpis.filter((k) => k.status === "above").length,
    attention: kpis.filter((k) => k.status === "attention").length,
    critical: kpis.filter((k) => k.status === "critical").length,
    empty: kpis.filter((k) => k.status === "empty").length,
  }), [kpis])

  const cockpitKpis = useMemo(() =>
    kpis.filter(kpiShowsInCockpit), [kpis])

  const planCounts = useMemo(() => ({
    overdue: plans.filter((p) => {
      const s = p.status as string
      const d = p.due_date as string
      return (
        s !== "delivered" &&
        s !== "archived" &&
        d < todayIso &&
        d >= periodDateBounds.from &&
        d <= periodDateBounds.to
      )
    }).length,
    blocked: plans.filter((p) => (p.status as string) === "blocked").length,
  }), [plans, todayIso, periodDateBounds])

  const ritualIdsInScope = useMemo(
    () => new Set(rituals.map((r) => String(r.id ?? "")).filter(Boolean)),
    [rituals],
  )

  const meetingsInScope = useMemo(
    () => meetings.filter((m) => ritualIdsInScope.has(String(m.ritual_id ?? ""))),
    [meetings, ritualIdsInScope],
  )

  const notTracked = useMemo(
    () => meetingsInScope.filter((m) => (m.state as string) === "not_tracked").length,
    [meetingsInScope],
  )

  /** Sessões (reuniões) no período atual e no próximo intervalo — alinhado a `activePeriod`, não à lista genérica de rituais. */
  const periodMeetingsSidebar = useMemo(() => {
    const ref = new Date(`${todayIso}T12:00:00`)
    const cur = calendarPeriodDates(activePeriod, ref)
    const next = nextCalendarPeriodDates(activePeriod, ref)
    const ritualById = new Map(rituals.map((r) => [String(r.id ?? ""), r]))
    const inCur = meetings.filter((m) => {
      const d = String((m.occurred_at as string) ?? "").slice(0, 10)
      return d && d >= cur.from && d <= cur.to
    })
    const inNext = meetings.filter((m) => {
      const d = String((m.occurred_at as string) ?? "").slice(0, 10)
      return d && d >= next.from && d <= next.to
    })
    const mapRow = (m: KpiData) => {
      const r = ritualById.get(String(m.ritual_id ?? ""))
      const name = (r?.name as string) ?? "Sessão"
      const raw = (m.occurred_at as string) ?? ""
      const d = raw.slice(0, 10)
      const t = raw ? new Date(raw) : new Date(`${d}T12:00:00`)
      const time = Number.isNaN(t.getTime()) ? "—" : t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      const dot = areaColor(String(r?.area ?? ""))
      const st = String(m.state ?? "")
      const badge =
        st === "done" ? "Realizado" : st === "not_tracked" ? "Não rastreado" : st === "cancelled" ? "Cancelado" : "Registrado"
      const badgeClass =
        st === "done"
          ? "border border-chart-1/30 bg-chart-1/10 text-chart-1"
          : st === "not_tracked"
            ? "border border-border bg-muted text-muted-foreground"
            : "border border-chart-2/30 bg-chart-2/10 text-chart-2"
      const wd = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      const day = d && !Number.isNaN(new Date(d + "T12:00:00").getTime()) ? wd[new Date(d + "T12:00:00").getDay()] ?? "" : ""
      const date = d
        ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
        : "—"
      const rowKey = String(m.id ?? `${d}-${String(m.ritual_id ?? "")}`)
      return { time, name, dot, badge, badgeClass, day, date, rowKey }
    }
    return {
      curRows: inCur.slice(0, 8).map(mapRow),
      nextRows: inNext.slice(0, 8).map(mapRow),
    }
  }, [meetings, rituals, activePeriod, todayIso])

  /** Lançamentos (resultados) de KPI com `period_start` dentro do intervalo do filtro — mesmos dados do detalhe do KPI. */
  const kpiLaunchesInPeriod = useMemo(() => {
    const ref = new Date(`${todayIso}T12:00:00`)
    const { from, to } = calendarPeriodDates(activePeriod, ref)
    type Row = {
      key: string
      kpiId: string
      kpiName: string
      periodLabel: string
      valueStr: string
      dot: string
      sortKey: string
    }
    const out: Row[] = []
    for (const k of cockpitKpis) {
      const unit = (k.unit as string) ?? ""
      const results = (k.results as KpiResultRow[]) ?? []
      const kid = String(k.id ?? "")
      if (!kid) continue
      results.forEach((r, ri) => {
        const ps = r.period_start
        const d = typeof ps === "string" ? ps.slice(0, 10) : null
        if (!d || d < from || d > to) return
        const resultId = r.id != null && String(r.id).length > 0 ? String(r.id) : `idx-${ri}`
        out.push({
          key: `${kid}-result-${resultId}`,
          kpiId: kid,
          kpiName: String(k.name ?? "KPI"),
          periodLabel: String(r.period_label ?? "").trim() || d,
          valueStr: fmtVal(Number(r.value), unit),
          dot: areaColor(String(k.area ?? "")),
          sortKey: d,
        })
      })
    }
    out.sort((a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0))
    return out.slice(0, 8)
  }, [cockpitKpis, activePeriod, todayIso])

  /* Alerts from real counts (escopo = área + período onde aplicável) */
  const alerts = useMemo(
    () => [
      {
        id: "planos-atrasados",
        icon: ClipboardList,
        iconBg: "bg-chart-5/10",
        iconColor: "text-chart-5",
        name: "Planos atrasados",
        meta: `${planCounts.overdue} com prazo no período e ainda em aberto`,
        count: planCounts.overdue,
        countColor: "text-chart-5",
        href: "/cockpit/planos-de-acao?due=overdue",
      },
      {
        id: "kpis-criticos",
        icon: TrendingDown,
        iconBg: "bg-chart-4/10",
        iconColor: "text-chart-4",
        name: "KPIs críticos",
        meta: "Abaixo do limite de desvio configurado por KPI",
        count: kpiCounts.critical,
        countColor: "text-chart-4",
        href: "/cockpit/kpis?status=critical",
      },
      {
        id: "rituais-nao-rastreados",
        icon: AlertTriangle,
        iconBg: "bg-chart-5/10",
        iconColor: "text-chart-5",
        name: "Rituais não rastreados",
        meta: `${notTracked} sessões no período`,
        count: notTracked,
        countColor: "text-chart-5",
        href: "/cockpit/rituais",
      },
    ],
    [planCounts.overdue, kpiCounts.critical, notTracked],
  )

  const totalAlerts = planCounts.overdue + kpiCounts.critical + notTracked

  /* KPI chart rows — group cockpit KPIs into layout rows */
  const row1 = cockpitKpis.slice(0, 2)
  const row2 = cockpitKpis.slice(2, 5)
  const row3 = cockpitKpis.slice(5, 7)
  const row4 = cockpitKpis.slice(7, 9)

  const areas = useMemo(
    () => [
      { key: "all", label: "Todos os setores" as const, dot: undefined as string | undefined },
      ...COCKPIT_AREAS.filter((a) => a.slug !== "PLAY").map((a) => ({ key: a.slug, label: a.name, dot: a.color })),
    ],
    [],
  )
  const periods: { key: PeriodKey; label: string }[] = [
    { key: "week", label: "Semana" },
    { key: "month", label: "Mês" },
    { key: "year", label: "Ano" },
  ]

  const periodSidebarTitles: Record<PeriodKey, [string, string]> = {
    week: ["Esta semana", "Próximos 7 dias"],
    month: ["Este mês", "Próximo mês"],
    year: ["Este ano", "Próximo ano"],
  }

  function periodOverPeriodDelta(kpi: KpiData): number | null {
    const raw = (kpi.results as KpiResultRow[]) ?? []
    const filtered = filterResultsByPeriod(raw, activePeriod, new Date())
    const chrono = filtered.length > 0 ? [...filtered].reverse() : []
    const pts = chrono.slice(-6)
    if (pts.length < 2) return null
    const a = Number(pts[pts.length - 2]?.value ?? 0)
    const b = Number(pts[pts.length - 1]?.value ?? 0)
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null
    if (Math.abs(a) < 1e-9) return null
    return ((b - a) / Math.abs(a)) * 100
  }

  function renderKpiCard(kpi: KpiData, h = 100) {
    const current = kpiCurrent(kpi)
    const goal = kpiGoal(kpi)
    const unit = (kpi.unit as string) ?? ""
    const dev = devPct(current, goal)
    const ok = dev >= 0
    const popDelta = periodOverPeriodDelta(kpi)
    return (
      <Link
        href={`/cockpit/kpis/${String(kpi.id)}`}
        className="block cursor-pointer rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium leading-snug text-foreground">{kpi.name as string}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {areaLabel(String(kpi.area ?? ""))} · {kpiCodeLabel(kpi)}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold tabular-nums tracking-tight text-foreground">{fmtVal(current, unit)}</div>
                <div className={cn("mt-0.5 text-xs font-bold tabular-nums", ok ? "text-chart-1" : "text-chart-5")}>
                  {ok ? "↑" : "↓"} {dev >= 0 ? "+" : ""}{dev.toFixed(1)}% vs meta
                </div>
                {popDelta != null && (
                  <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {popDelta >= 0 ? "+" : ""}{popDelta.toFixed(1)}% vs período anterior
                  </div>
                )}
              </div>
            </div>
            <KpiChart kpi={kpi} height={h} periodKey={activePeriod} sectorFilter={activeArea} />
          </CardContent>
        </Card>
      </Link>
    )
  }

  function exportReportPdf() {
    const params = new URLSearchParams()
    if (activeArea !== "all") params.set("area", activeArea)
    params.set("period", activePeriod)
    window.open(`/api-proxy/cockpit/report/estrategico.pdf?${params.toString()}`, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <Header
        title="Cockpit Estratégico"
        description={loading ? "Carregando…" : "Visão consolidada de performance"}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={loading}
              aria-busy={loading}
              onClick={() => void refreshAll()}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" disabled={loading} onClick={exportReportPdf}>
              <FileDown className="h-3.5 w-3.5" /> Exportar PDF
            </Button>
          </div>
        }
      />
      <main className={COCKPIT_MAIN_CLASS} aria-busy={loading}>

        {/* Filtros: setor (cor dos gráficos = bolinha do setor selecionado) + período */}
        <div
          className="-mx-1 flex max-w-full flex-col gap-2 print:hidden sm:mx-0"
          role="toolbar"
          aria-label="Filtros do cockpit"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground" id="cockpit-filter-sector-label">
              Setor
            </span>
            <div
              className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible"
              role="group"
              aria-labelledby="cockpit-filter-sector-label"
            >
              {areas.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  aria-pressed={activeArea === a.key}
                  onClick={() => setActiveArea(a.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    activeArea === a.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {a.dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.dot }} aria-hidden />}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground" id="cockpit-filter-period-label">
              Período
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5" role="group" aria-labelledby="cockpit-filter-period-label">
              {periods.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={activePeriod === p.key}
                  onClick={() => setActivePeriod(p.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    activePeriod === p.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 hidden print:block">
          <p className="text-sm text-muted-foreground">
            Relatório · {activeArea === "all" ? "Todos os setores" : areaLabel(activeArea)} · {periods.find((p) => p.key === activePeriod)?.label ?? ""} · {new Date().toLocaleDateString("pt-BR")}
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-foreground">
            <li>
              Saúde dos KPIs: {kpiCounts.above} atingindo, {kpiCounts.attention} atenção, {kpiCounts.critical} críticos, {kpiCounts.empty} sem dado (total {kpis.length} no escopo).
            </li>
            <li>
              Alertas: {planCounts.overdue} planos atrasados (prazo no período), {kpiCounts.critical} KPIs críticos, {notTracked} sessões não rastreadas no período.
            </li>
          </ul>
        </div>

        {/* Main grid */}
        <div id="cockpit-strategic-report" className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(220px,232px)]">

          {/* LEFT — KPI Charts */}
          <div className="min-w-0 space-y-4">
            {cockpitKpis.length === 0 && loading && (
              <div className="grid gap-4 lg:grid-cols-2" aria-hidden>
                {[0, 1].map((s) => (
                  <Card key={s} className="border-border bg-card shadow-sm">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="h-4 w-40 max-w-full animate-pulse rounded-md bg-muted" />
                          <div className="h-3 w-28 max-w-full animate-pulse rounded-md bg-muted/80" />
                        </div>
                        <div className="h-8 w-14 shrink-0 animate-pulse rounded-md bg-muted" />
                      </div>
                      <div className="h-[120px] animate-pulse rounded-lg bg-muted/60" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {row1.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                {row1.map((k) => (
                  <Fragment key={kpiReactKey(k)}>
                    {renderKpiCard(k, 130)}
                  </Fragment>
                ))}
              </div>
            )}
            {row2.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-3">
                {row2.map((k) => (
                  <Fragment key={kpiReactKey(k)}>
                    {renderKpiCard(k)}
                  </Fragment>
                ))}
              </div>
            )}
            {row3.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {row3.map((k) => (
                  <Fragment key={kpiReactKey(k)}>
                    {renderKpiCard(k)}
                  </Fragment>
                ))}
              </div>
            )}
            {row4.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {row4.map((k) => (
                  <Fragment key={kpiReactKey(k)}>
                    {renderKpiCard(k)}
                  </Fragment>
                ))}
              </div>
            )}
            {cockpitKpis.length === 0 && !loading && (
              <Card className="border-border bg-card"><CardContent className="p-6 text-center text-sm text-muted-foreground">Nenhum KPI marcado como visível no cockpit.</CardContent></Card>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="min-w-0 space-y-4 xl:max-w-none">

            {/* Saúde */}
            <Card className="gap-0 overflow-visible border-border bg-card py-0 shadow-sm">
              <CardHeader className="items-center border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-semibold leading-none text-foreground">Saúde geral</CardTitle>
                <CardAction>
                  <Badge
                    variant="secondary"
                    className="border border-chart-1/30 bg-chart-1/10 text-xs font-semibold tabular-nums text-chart-1 shadow-none hover:bg-chart-1/15"
                  >
                    {Math.round((kpiCounts.above / Math.max(1, kpis.length)) * 100)}% ok
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <div className="flex w-[80px] shrink-0 justify-center">
                  <HealthDonut above={kpiCounts.above} attention={kpiCounts.attention} critical={kpiCounts.critical} empty={kpiCounts.empty} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  {[
                    { label: "Atingindo", value: kpiCounts.above, dotClass: "bg-chart-1" },
                    { label: "Atenção", value: kpiCounts.attention, dotClass: "bg-chart-4" },
                    { label: "Crítico", value: kpiCounts.critical, dotClass: "bg-chart-5" },
                    { label: "Sem dado", value: kpiCounts.empty, dotClass: "bg-border" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", r.dotClass)} />
                        <span className="truncate">{r.label}</span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Período atual (reuniões no intervalo do filtro) */}
            <Card className="gap-0 border-border bg-card py-0 shadow-sm">
              <CardHeader className="items-center border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-semibold leading-none text-foreground">{periodSidebarTitles[activePeriod][0]}</CardTitle>
                <CardAction>
                  <Badge
                    variant="secondary"
                    className="border border-border bg-muted/60 text-xs font-semibold tabular-nums text-foreground shadow-none hover:bg-muted/80"
                  >
                    {todayLabel}
                  </Badge>
                </CardAction>
              </CardHeader>
              <div className="divide-y divide-border">
                {periodMeetingsSidebar.curRows.length === 0 &&
                  kpiLaunchesInPeriod.length === 0 &&
                  (loading ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">Carregando…</div>
                  ) : (
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      Nenhuma sessão nem lançamento de KPI neste intervalo.
                    </div>
                  ))}
                {periodMeetingsSidebar.curRows.map((r) => (
                  <div key={r.rowKey} className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-muted/40">
                    <span className="min-w-[52px] shrink-0 tabular-nums text-xs text-muted-foreground">
                      {activePeriod === "week" ? r.time : `${r.day} ${r.date}`}
                    </span>
                    <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: r.dot }} aria-hidden />
                    <span className="min-w-0 flex-1 text-xs font-medium text-foreground">{r.name}</span>
                    <span className={cn("shrink-0 rounded-lg border px-1.5 py-0.5 text-xs font-medium", r.badgeClass)}>{r.badge}</span>
                  </div>
                ))}
                {kpiLaunchesInPeriod.length > 0 && (
                  <>
                    <div className="bg-muted/25 px-4 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Lançamentos de KPI</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/90">Registros com período neste intervalo (mesmo do detalhe do indicador).</p>
                    </div>
                    {kpiLaunchesInPeriod.map((row) => (
                      <Link
                        key={row.key}
                        href={`/cockpit/kpis/${row.kpiId}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-muted/40"
                      >
                        <span className="min-w-[52px] shrink-0 tabular-nums text-xs text-muted-foreground">{row.periodLabel}</span>
                        <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: row.dot }} aria-hidden />
                        <span className="min-w-0 flex-1 text-xs font-medium text-foreground">{row.kpiName}</span>
                        <span className="shrink-0 rounded-lg border border-primary/25 bg-primary/5 px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
                          {row.valueStr}
                        </span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </Card>

            {/* Alertas */}
            <Card className="gap-0 border-border bg-card py-0 shadow-sm">
              <CardHeader className="items-center border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-semibold leading-none text-foreground">Alertas</CardTitle>
                <CardAction>
                  <Badge
                    variant="secondary"
                    className="border border-chart-5/30 bg-chart-5/10 text-xs font-semibold tabular-nums text-chart-5 shadow-none hover:bg-chart-5/15"
                  >
                    {totalAlerts} ativos
                  </Badge>
                </CardAction>
              </CardHeader>
              <div className="divide-y divide-border">
                {alerts.map((row) => {
                  const Icon = row.icon
                  return (
                  <Link
                    key={row.id}
                    href={row.href}
                    className="group flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-chart-5/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-5/25 dark:hover:bg-chart-5/15"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-chart-5/15",
                        row.iconBg,
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", row.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.meta}</div>
                    </div>
                    <span className={cn("text-sm font-bold tabular-nums", row.countColor)}>{row.count}</span>
                  </Link>
                  )
                })}
              </div>
            </Card>

            {/* Próximo intervalo (mesma lógica de período) */}
            <Card className="gap-0 border-border bg-card py-0 shadow-sm">
              <CardHeader className="border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-semibold leading-none text-foreground">{periodSidebarTitles[activePeriod][1]}</CardTitle>
              </CardHeader>
              <div className="divide-y divide-border">
                {periodMeetingsSidebar.nextRows.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-foreground">Nenhuma sessão neste próximo intervalo.</div>
                )}
                {periodMeetingsSidebar.nextRows.map((r) => (
                  <div key={r.rowKey} className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-accent/5">
                    <span className="min-w-[52px] shrink-0 tabular-nums text-xs text-muted-foreground">
                      {activePeriod === "week" ? r.time : `${r.day} ${r.date}`}
                    </span>
                    <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: r.dot }} aria-hidden />
                    <span className="min-w-0 flex-1 text-xs font-medium text-foreground">{r.name}</span>
                    <span className={cn("shrink-0 rounded-lg border px-1.5 py-0.5 text-xs font-medium", r.badgeClass)}>{r.badge}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </main>
    </>
  )
}
