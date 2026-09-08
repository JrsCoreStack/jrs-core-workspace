"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import api from "@/utils/api"
import { COCKPIT_AREAS, areaColor, areaLabel, ACTION_PLAN_STATUS_LABELS } from "@/lib/cockpit/constants"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type KpiData      = Record<string, unknown>
type PlanData     = Record<string, unknown>
type RitualData   = Record<string, unknown>
type MeetingData  = Record<string, unknown>
type PeriodKey    = "week" | "month" | "year"

function fmtVal(v: number, unit: string): string {
  if (unit === "R$" || unit === "BRL") {
    if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")}M`
    if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
    return `R$ ${v.toFixed(0)}`
  }
  if (unit === "%") return `${v.toFixed(1).replace(".", ",")}%`
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)
}

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
function devPct(current: number, goal: number): number {
  if (!goal) return 0
  return ((current - goal) / Math.abs(goal)) * 100
}
function progressPct(current: number, goal: number): number {
  if (!goal) return 0
  return Math.min(100, Math.max(0, (current / goal) * 100))
}
function calendarPeriodDates(periodKey: PeriodKey, ref: Date): { from: string; to: string } {
  if (periodKey === "week") {
    const start = new Date(ref); start.setDate(start.getDate() - 6)
    return { from: start.toISOString().slice(0, 10), to: ref.toISOString().slice(0, 10) }
  }
  if (periodKey === "month") {
    const y = ref.getFullYear(), m = ref.getMonth()
    return { from: new Date(y, m, 1).toISOString().slice(0, 10), to: new Date(y, m + 1, 0).toISOString().slice(0, 10) }
  }
  const y = ref.getFullYear()
  return { from: `${y}-01-01`, to: `${y}-12-31` }
}
function nextCalendarPeriodDates(periodKey: PeriodKey, ref: Date): { from: string; to: string } {
  if (periodKey === "week") {
    const start = new Date(ref); start.setDate(start.getDate() + 1)
    const end = new Date(ref); end.setDate(end.getDate() + 7)
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
  }
  if (periodKey === "month") {
    const y = ref.getFullYear(), m = ref.getMonth()
    return { from: new Date(y, m + 1, 1).toISOString().slice(0, 10), to: new Date(y, m + 2, 0).toISOString().slice(0, 10) }
  }
  const y = ref.getFullYear() + 1
  return { from: `${y}-01-01`, to: `${y}-12-31` }
}

function IcDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function IcRefresh({ spin }: { spin?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={spin ? { animation: "cp-spin 1s linear infinite" } : undefined}>
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  )
}
function IcCalendar() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IcCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IcWarn() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function IcCheck2() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function KpiCard({ kpi, highlight }: { kpi: KpiData; highlight?: boolean }) {
  const current  = kpiCurrent(kpi)
  const goal     = kpiGoal(kpi)
  const unit     = (kpi.unit as string) ?? ""
  const dev      = devPct(current, goal)
  const progress = progressPct(current, goal)
  const isUp     = dev >= 0
  const id       = String(kpi.id ?? "")

  return (
    <Link
      href={id ? `/cockpit/kpis/${id}` : "#"}
      className={cn("cp-kpi-card", highlight && "cp-kpi-highlight")}
    >
      <div className="cp-kpi-label">{kpi.name as string}</div>
      <div className="cp-kpi-value">{fmtVal(current, unit)}</div>
      <span className={cn("cp-kpi-delta", isUp ? "cp-delta-up" : "cp-delta-down")}>
        {isUp ? "▲" : "▼"} {Math.abs(dev).toFixed(1)}%
      </span>
      {goal > 0 && (
        <div className="cp-kpi-sub">
          Meta: {fmtVal(goal, unit)}
        </div>
      )}
      <div className="cp-progress-bar">
        <div className="cp-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </Link>
  )
}

function taskAreaBadgeClass(area: string): string {
  const color = areaColor(area)
  const map: Record<string, string> = {
    "#2563eb": "cp-tb-accent",
    "#16a34a": "cp-tb-cyan",
    "#ca8a04": "cp-tb-warning",
    "#db2777": "cp-tb-accent",
    "#7c3aed": "cp-tb-accent",
    "#0f766e": "cp-tb-cyan",
  }
  return map[color] ?? "cp-tb-accent"
}

function PlanCard({ plan }: { plan: PlanData }) {
  const status   = String(plan.status ?? "")
  const area     = String(plan.area ?? "")
  const dueDate  = String(plan.due_date ?? "")
  const name     = String(plan.name ?? "Sem título")
  const isDone   = status === "delivered"
  const isLate   = !isDone && dueDate < new Date().toISOString().slice(0, 10)
  const progress = typeof plan.completion_percentage === "number" ? plan.completion_percentage : null
  const initials = String(plan.responsible_name ?? plan.owner ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()

  const fmtDue = dueDate
    ? new Date(dueDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : ""

  return (
    <div className="cp-task-card">
      {area && (
        <span className={cn("cp-task-badge", taskAreaBadgeClass(area))}>
          {areaLabel(area)}
        </span>
      )}
      <div className={cn("cp-task-title", isDone && "cp-done-title")}>{name}</div>
      {progress != null && status === "in_progress" && (
        <div className="cp-task-progress">
          <div className="cp-task-progress-label">Progresso · {Math.round(progress)}%</div>
          <div className="cp-task-progress-bar">
            <div className="cp-task-progress-fill" style={{ width: `${progress}%`, background: progress >= 80 ? "var(--rf-success)" : "var(--rf-warning)" }} />
          </div>
        </div>
      )}
      <div className="cp-task-meta">
        {isDone ? (
          <span className="cp-task-date" style={{ color: "var(--rf-success)" }}>
            <IcCheck /> Entregue
          </span>
        ) : isLate ? (
          <span className="cp-task-date" style={{ color: "var(--rf-danger)" }}>
            <IcWarn /> Atrasado
          </span>
        ) : fmtDue ? (
          <span className="cp-task-date"><IcCalendar /> {fmtDue}</span>
        ) : <span />}
        {initials && (
          <div className="cp-task-avatar" title={String(plan.responsible_name ?? plan.owner ?? "")}>
            {initials.slice(0, 2)}
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCol({
  title, count, countClass, plans,
}: {
  title: string; count: number; countClass: string; plans: PlanData[]
}) {
  return (
    <div className="cp-kanban-col">
      <div className="cp-kanban-col-hd">
        <span className="cp-kanban-col-title">{title}</span>
        <span className={cn("cp-kanban-count", countClass)}>{count}</span>
      </div>
      {plans.length === 0 && (
        <div style={{ fontSize: 11, color: "var(--rf-text-muted)", padding: "8px 0" }}>Nenhum plano</div>
      )}
      {plans.map((p, i) => (
        <PlanCard key={String(p.id ?? i)} plan={p} />
      ))}
    </div>
  )
}

function RitualItem({ meeting, ritual }: { meeting: MeetingData; ritual?: RitualData }) {
  const state    = String(meeting.state ?? "")
  const raw      = String(meeting.occurred_at ?? "")
  const t        = raw ? new Date(raw) : null
  const time     = t && !Number.isNaN(t.getTime()) ? t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"
  const dur      = String(ritual?.duration_minutes ?? ritual?.frequency_minutes ?? "")
  const durLabel = dur ? `${dur} min` : ""
  const name     = String(ritual?.name ?? meeting.ritual_name ?? "Sessão")
  const desc     = String(ritual?.description ?? meeting.notes ?? "")
  const isDone   = state === "done"
  const isActive = state === "in_progress"
  const barClass = isDone ? "cp-rb-done" : isActive ? "cp-rb-active" : "cp-rb-next"

  return (
    <div className={cn("cp-ritual-item", isActive && "cp-ritual-active")}>
      <div className="cp-ritual-time">
        <div className={cn("cp-rt-time", isActive && "cp-rt-active")}>{time}</div>
        {durLabel && <div className="cp-rt-dur">{durLabel}</div>}
      </div>
      <div className={cn("cp-ritual-bar", barClass)} />
      <div className="cp-ritual-body">
        <div className="cp-ritual-name">{name}</div>
        {desc && <div className="cp-ritual-desc">{desc}</div>}
        <div className="cp-ritual-footer">
          <div className="cp-ritual-avatars">
            {[1, 2, 3].map((n) => (
              <div key={n} className="cp-r-avatar">{String.fromCharCode(64 + n)}</div>
            ))}
          </div>
          {isDone && (
            <span className="cp-badge-status cp-bs-done">
              <IcCheck2 /> Realizado
            </span>
          )}
          {isActive && (
            <Button size="xs">Entrar na Sala →</Button>
          )}
          {!isDone && !isActive && (
            <span style={{ fontSize: 11, color: "var(--rf-text-muted)" }}>
              {raw ? `às ${time}` : "Agendado"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "week",  label: "Esta semana" },
  { key: "month", label: "Este mês" },
  { key: "year",  label: "Este ano" },
]

const AREAS = [
  { key: "all", label: "Todas as Áreas" },
  ...COCKPIT_AREAS.filter((a) => a.slug !== "PLAY").map((a) => ({ key: a.slug, label: a.name })),
]

export default function CockpitPage() {
  const [loading,      setLoading]    = useState(true)
  const [kpis,         setKpis]       = useState<KpiData[]>([])
  const [plans,        setPlans]      = useState<PlanData[]>([])
  const [rituals,      setRituals]    = useState<RitualData[]>([])
  const [meetings,     setMeetings]   = useState<MeetingData[]>([])
  const [activeArea,   setActiveArea]  = useState("all")
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("month")

  const todayIso   = new Date().toISOString().slice(0, 10)
  const todayLabel = new Date(`${todayIso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "short",
  })

  async function refreshAll() {
    setLoading(true)
    try {
      const areaParams = activeArea !== "all" ? { area: activeArea } : {}
      const ref  = new Date()
      const cur  = calendarPeriodDates(activePeriod, ref)
      const next = nextCalendarPeriodDates(activePeriod, ref)
      const meetingParams = {
        ...areaParams,
        occurred_from: `${cur.from}T00:00:00.000Z`,
        occurred_to:   `${next.to}T23:59:59.999Z`,
      }
      const [kR, rR, pR, mR] = await Promise.all([
        api.get("/cockpit/kpis",          { params: areaParams }),
        api.get("/cockpit/rituals",        { params: { status: "active", ...areaParams } }),
        api.get("/cockpit/action-plans",   { params: { today: todayIso, ...areaParams } }),
        api.get("/cockpit/meetings",       { params: meetingParams }),
      ])
      setKpis(kR.data ?? [])
      setRituals(rR.data ?? [])
      setPlans(pR.data ?? [])
      setMeetings(mR.data ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { void refreshAll() }, [activeArea, activePeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  const cockpitKpis = useMemo(() => kpis.filter(kpiShowsInCockpit), [kpis])
  const todoPlans   = useMemo(() => plans.filter((p) => ["planned", "todo"].includes(String(p.status ?? ""))), [plans])
  const doingPlans  = useMemo(() => plans.filter((p) => ["in_progress", "blocked"].includes(String(p.status ?? ""))), [plans])
  const donePlans   = useMemo(() => plans.filter((p) => ["delivered", "done"].includes(String(p.status ?? ""))), [plans])
  const ritualById  = useMemo(() => new Map(rituals.map((r) => [String(r.id ?? ""), r])), [rituals])
  const todayMeetings = useMemo(
    () => meetings
      .filter((m) => String(m.occurred_at ?? "").startsWith(todayIso))
      .sort((a, b) => String(a.occurred_at ?? "").localeCompare(String(b.occurred_at ?? ""))),
    [meetings, todayIso],
  )

  return (
    <>
      <style>{`
        @keyframes cp-spin { to { transform: rotate(360deg); } }

        .cp-page {
          display: flex; flex-direction: column;
          height: 100%; overflow-y: auto; overflow-x: hidden;
          background: var(--rf-bg-base);
          font-family: var(--rf-font-body, 'DM Sans', sans-serif);
          color: var(--rf-text-primary);
        }

        .cp-topbar {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          padding: 18px 20px 14px;
          background: var(--rf-bg-surface);
          border-bottom: 1px solid var(--rf-border-subtle);
          flex-wrap: wrap;
        }
        .cp-topbar-left  { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
        .cp-page-title   {
          font-family: var(--rf-font-display, 'Syne', sans-serif);
          font-size: 20px; font-weight: 800;
          color: var(--rf-text-primary); letter-spacing: -0.3px; line-height: 1.2;
        }
        .cp-page-sub     { font-size: 12px; color: var(--rf-text-secondary); margin-top: 3px; }
        .cp-topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; flex-shrink: 0; }

        .cp-filter-row {
          display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
          padding: 12px 20px; background: var(--rf-bg-surface);
          border-bottom: 1px solid var(--rf-border-subtle); flex-wrap: wrap;
        }
        .cp-filter-row::-webkit-scrollbar { display: none; }
        .cp-chip {
          flex-shrink: 0; padding: 6px 14px; border-radius: 9999px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-secondary);
          cursor: pointer; transition: all var(--rf-transition); white-space: nowrap;
        }
        .cp-chip:hover { border-color: var(--rf-border-strong); color: var(--rf-text-primary); }
        .cp-chip-active { background: var(--rf-accent-soft); color: var(--rf-accent); border-color: var(--rf-accent-border); }

        .cp-content { padding: 20px; display: flex; flex-direction: column; gap: 24px; flex: 1; }

        .cp-sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .cp-sec-title { font-family: var(--rf-font-display, 'Syne', sans-serif); font-size: 14px; font-weight: 700; color: var(--rf-text-primary); }
        .cp-sec-link  { font-size: 12px; color: var(--rf-accent); font-weight: 600; cursor: pointer; text-decoration: none; }
        .cp-sec-meta  { font-size: 11px; color: var(--rf-text-muted); font-family: monospace; }

        .cp-divider { height: 1px; background: var(--rf-border-subtle); }

        .cp-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .cp-kpi-grid { grid-template-columns: 1fr; } }
        .cp-kpi-card {
          background: var(--rf-bg-surface); border: 1px solid var(--rf-border-default);
          border-radius: 16px; padding: 16px;
          transition: all var(--rf-transition); cursor: pointer;
          display: block; text-decoration: none; color: inherit;
        }
        .cp-kpi-card:hover { box-shadow: var(--rf-shadow-md); border-color: var(--rf-border-strong); }
        .cp-kpi-highlight {
          border-color: var(--rf-accent-border);
          box-shadow: 0 0 0 1px var(--rf-accent-border), 0 4px 20px rgba(123,97,255,0.15);
        }
        .cp-kpi-label { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--rf-text-muted); margin-bottom: 10px; }
        .cp-kpi-value {
          font-family: var(--rf-font-display, 'Syne', sans-serif);
          font-size: 24px; font-weight: 800; color: var(--rf-text-primary);
          letter-spacing: -0.5px; line-height: 1; margin-bottom: 8px;
        }
        .cp-kpi-highlight .cp-kpi-value { color: var(--rf-accent); }
        .cp-kpi-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; }
        .cp-delta-up   { background: rgba(34,197,94,0.10);  color: #22c55e; }
        .cp-delta-down { background: rgba(239,68,68,0.10); color: #ef4444; }
        .cp-kpi-sub { font-size: 11px; color: var(--rf-text-muted); margin-top: 6px; }
        .cp-progress-bar  { height: 3px; border-radius: 9999px; background: var(--rf-border-subtle); overflow: hidden; margin-top: 10px; }
        .cp-progress-fill { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, var(--rf-accent), #00d4ff); transition: width 0.6s ease; }
        .cp-kpi-highlight .cp-progress-fill { background: var(--rf-accent); }
        .cp-kpi-skeleton { background: var(--rf-bg-surface); border: 1px solid var(--rf-border-subtle); border-radius: 16px; padding: 16px; }
        .cp-skeleton-bar { border-radius: 4px; background: var(--rf-border-subtle); animation: cp-shimmer 1.4s ease-in-out infinite; }
        @keyframes cp-shimmer { 0%,100%{opacity:1}50%{opacity:0.5} }

        .cp-kanban-wrap { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .cp-kanban-wrap::-webkit-scrollbar { display: none; }
        .cp-kanban-col {
          flex-shrink: 0; width: 210px;
          background: var(--rf-bg-surface); border: 1px solid var(--rf-border-subtle);
          border-radius: 16px; padding: 14px;
        }
        .cp-kanban-col-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .cp-kanban-col-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rf-text-muted); }
        .cp-kanban-count { font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 9999px; }
        .cp-cnt-todo  { background: var(--rf-bg-overlay);           color: var(--rf-text-secondary); }
        .cp-cnt-doing { background: rgba(245,158,11,0.10); color: #f59e0b; }
        .cp-cnt-done  { background: rgba(34,197,94,0.10);  color: #22c55e; }
        .cp-task-card {
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-subtle);
          border-radius: 12px; padding: 12px; margin-bottom: 8px;
          cursor: pointer; transition: all var(--rf-transition);
        }
        .cp-task-card:hover { border-color: var(--rf-accent-border); }
        .cp-task-card:last-child { margin-bottom: 0; }
        .cp-task-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px; }
        .cp-tb-accent  { background: var(--rf-accent-soft); color: var(--rf-accent); }
        .cp-tb-cyan    { background: rgba(0,212,255,0.10);  color: #00d4ff; }
        .cp-tb-warning { background: rgba(245,158,11,0.10); color: #f59e0b; }
        .cp-task-title { font-size: 12px; font-weight: 500; color: var(--rf-text-primary); line-height: 1.4; margin-bottom: 8px; }
        .cp-done-title { text-decoration: line-through; color: var(--rf-text-muted); }
        .cp-task-meta  { display: flex; align-items: center; justify-content: space-between; }
        .cp-task-date  { font-size: 10px; color: var(--rf-text-muted); display: flex; align-items: center; gap: 3px; }
        .cp-task-avatar {
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, var(--rf-accent), #00d4ff);
          display: grid; place-items: center;
          font-size: 7px; font-weight: 700; color: #fff;
          font-family: var(--rf-font-display, 'Syne', sans-serif);
        }
        .cp-task-progress       { margin-top: 8px; }
        .cp-task-progress-label { font-size: 10px; color: var(--rf-text-muted); margin-bottom: 4px; }
        .cp-task-progress-bar   { height: 2px; border-radius: 9999px; background: var(--rf-border-subtle); overflow: hidden; }
        .cp-task-progress-fill  { height: 100%; border-radius: 9999px; }

        .cp-ritual-list { display: flex; flex-direction: column; gap: 10px; }
        .cp-ritual-item {
          background: var(--rf-bg-surface); border: 1px solid var(--rf-border-subtle);
          border-radius: 16px; padding: 14px 16px;
          display: flex; gap: 14px; align-items: flex-start;
          transition: all var(--rf-transition);
        }
        .cp-ritual-active { border-color: var(--rf-accent-border); background: var(--rf-accent-soft); }
        .cp-ritual-time { text-align: right; flex-shrink: 0; min-width: 46px; }
        .cp-rt-time   { font-family: monospace; font-size: 13px; font-weight: 500; color: var(--rf-text-primary); }
        .cp-rt-active { color: var(--rf-accent); }
        .cp-rt-dur    { font-size: 10px; color: var(--rf-text-muted); margin-top: 2px; }
        .cp-ritual-bar  { width: 2px; border-radius: 2px; align-self: stretch; flex-shrink: 0; }
        .cp-rb-done     { background: #22c55e; }
        .cp-rb-active   { background: var(--rf-accent); }
        .cp-rb-next     { background: var(--rf-border-strong); }
        .cp-ritual-body { flex: 1; min-width: 0; }
        .cp-ritual-name { font-size: 13px; font-weight: 600; color: var(--rf-text-primary); margin-bottom: 3px; }
        .cp-ritual-desc { font-size: 11.5px; color: var(--rf-text-secondary); margin-bottom: 8px; }
        .cp-ritual-footer  { display: flex; align-items: center; justify-content: space-between; }
        .cp-ritual-avatars { display: flex; }
        .cp-r-avatar {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--rf-bg-surface);
          background: linear-gradient(135deg, var(--rf-accent), #00d4ff);
          display: grid; place-items: center;
          font-size: 7px; font-weight: 700; color: #fff;
          margin-right: -6px;
        }
        .cp-badge-status { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 9999px; }
        .cp-bs-done { background: rgba(34,197,94,0.10); color: #22c55e; }

        .cp-empty {
          background: var(--rf-bg-surface); border: 1px dashed var(--rf-border-strong);
          border-radius: 16px; padding: 48px 28px; text-align: center;
        }
        .cp-empty-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          display: grid; place-items: center; margin: 0 auto 16px;
          color: var(--rf-text-muted);
        }
        .cp-empty-title { font-family: var(--rf-font-display, 'Syne', sans-serif); font-size: 15px; font-weight: 700; color: var(--rf-text-primary); margin-bottom: 6px; }
        .cp-empty-desc  { font-size: 13px; color: var(--rf-text-secondary); line-height: 1.5; margin-bottom: 22px; }

        .cp-kpi-ghost { opacity: 0.45; cursor: default; pointer-events: none; }
        .cp-kpi-ghost .cp-kpi-value { color: var(--rf-text-muted); font-size: 20px; }
        .cp-kpi-ghost-wide { grid-column: 1 / -1; }
      `}</style>

      <div className="cp-page">

        {/* Topbar */}
        <div className="cp-topbar">
          <div className="cp-topbar-left">
            <SidebarTrigger style={{ marginTop: 2 }} />
            <div>
              <div className="cp-page-title">Cockpit Estratégico</div>
              <div className="cp-page-sub">Acompanhamento de metas e execução tática.</div>
            </div>
          </div>
          <div className="cp-topbar-actions">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                const params = new URLSearchParams({ period: activePeriod })
                if (activeArea !== "all") params.set("area", activeArea)
                window.open(`/api-proxy/cockpit/report/estrategico.pdf?${params}`, "_blank", "noopener,noreferrer")
              }}
            >
              <IcDownload /> PDF
            </Button>
            <Button size="sm" disabled={loading} onClick={() => void refreshAll()}>
              <IcRefresh spin={loading} /> Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="cp-filter-row">
          {AREAS.map((a) => (
            <button
              key={a.key}
              className={cn("cp-chip", activeArea === a.key && "cp-chip-active")}
              onClick={() => setActiveArea(a.key)}
            >
              {a.label}
            </button>
          ))}
          <div style={{ width: 1, background: "var(--rf-border-subtle)", margin: "0 4px", alignSelf: "stretch" }} />
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={cn("cp-chip", activePeriod === p.key && "cp-chip-active")}
              onClick={() => setActivePeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="cp-content">

          {/* KPIs */}
          <section>
            <div className="cp-sec-header">
              <span className="cp-sec-title">Indicadores</span>
              <Link href="/cockpit/kpis" className="cp-sec-link">Ver todos →</Link>
            </div>
            {loading && cockpitKpis.length === 0 ? (
              <div className="cp-kpi-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="cp-kpi-skeleton">
                    <div className="cp-skeleton-bar" style={{ height: 10, width: "60%", marginBottom: 12 }} />
                    <div className="cp-skeleton-bar" style={{ height: 28, width: "45%", marginBottom: 10 }} />
                    <div className="cp-skeleton-bar" style={{ height: 8,  width: "30%", marginBottom: 12 }} />
                    <div className="cp-skeleton-bar" style={{ height: 3,  width: "100%" }} />
                  </div>
                ))}
              </div>
            ) : cockpitKpis.length === 0 ? (
              <div className="cp-kpi-grid">
                {[
                  { label: "Receita Recorrente" },
                  { label: "Churn Rate" },
                  { label: "Planos Concluídos", wide: true },
                ].map((ghost, i) => (
                  <div key={i} className={cn("cp-kpi-card cp-kpi-ghost", ghost.wide && "cp-kpi-ghost-wide")}>
                    <div className="cp-kpi-label">{ghost.label}</div>
                    <div className="cp-kpi-value">—</div>
                    <div className="cp-kpi-sub">Nenhum dado</div>
                    <div className="cp-progress-bar"><div className="cp-progress-fill" style={{ width: "0%" }} /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cp-kpi-grid">
                {cockpitKpis.slice(0, 4).map((k, i) => (
                  <KpiCard key={String(k.id ?? i)} kpi={k} highlight={i === cockpitKpis.length - 1 && i > 0} />
                ))}
              </div>
            )}
          </section>

          <div className="cp-divider" />

          {/* Planos de Ação */}
          <section>
            <div className="cp-sec-header">
              <span className="cp-sec-title">Planos de Ação</span>
              <Link href="/cockpit/planos-de-acao" className="cp-sec-link">Ver todos →</Link>
            </div>
            {plans.length === 0 && !loading ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div className="cp-empty-title">Nenhum plano criado ainda</div>
                <div className="cp-empty-desc">Crie seu primeiro plano de ação para começar a acompanhar a execução tática da sua equipe.</div>
                <Button asChild>
                  <Link href="/cockpit/planos-de-acao">+ Criar primeiro plano</Link>
                </Button>
              </div>
            ) : (
              <div className="cp-kanban-wrap">
                <KanbanCol title="A Fazer"       countClass="cp-cnt-todo"  count={todoPlans.length}  plans={todoPlans.slice(0, 5)} />
                <KanbanCol title="Em Andamento"  countClass="cp-cnt-doing" count={doingPlans.length} plans={doingPlans.slice(0, 5)} />
                <KanbanCol title="Concluído"     countClass="cp-cnt-done"  count={donePlans.length}  plans={donePlans.slice(0, 5)} />
              </div>
            )}
          </section>

          <div className="cp-divider" />

          {/* Rituais do Dia */}
          <section>
            <div className="cp-sec-header">
              <span className="cp-sec-title">Rituais do Dia</span>
              <span className="cp-sec-meta">{todayLabel}</span>
            </div>
            {todayMeetings.length === 0 && !loading ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/>
                  </svg>
                </div>
                <div className="cp-empty-title">Nenhum ritual agendado</div>
                <div className="cp-empty-desc">Configure os rituais da sua equipe para sincronizar alinhamentos, revisões e tomadas de decisão.</div>
                <Button asChild>
                  <Link href="/cockpit/rituais">+ Configurar rituais</Link>
                </Button>
              </div>
            ) : (
              <div className="cp-ritual-list">
                {todayMeetings.map((m) => (
                  <RitualItem
                    key={String(m.id ?? Math.random())}
                    meeting={m}
                    ritual={ritualById.get(String(m.ritual_id ?? ""))}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  )
}
