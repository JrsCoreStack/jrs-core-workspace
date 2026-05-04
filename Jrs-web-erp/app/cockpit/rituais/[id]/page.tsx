"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AreaKey = "COMERCIAL" | "MARKETING" | "FINANCEIRO" | "TECNOLOGIA" | "OPERACIONAL" | "ESTRATEGICO"
type FreqKey = "DAILY" | "SEMANAL" | "QUINZENAL" | "MENSAL" | "ESTRATEGICO"

interface Ritual {
  id: number
  name: string
  area: AreaKey
  ownerName: string
  schedule: string
  freq: FreqKey
  nextDate: string
}

interface Kpi {
  id: number
  code: string
  name: string
  area: string
  unit: string
  goal: number
  current: number
  status: string
}

interface Plan {
  id: number
  title: string
  status: string
  owner?: string
  dueDate?: string
}

interface GuiaItem { order: number; text: string; duration?: string; responsible?: string }
interface Meeting { id: number; date: string; status: string; minutes: string }

// ─── Metadata ─────────────────────────────────────────────────────────────────

const AREA_META: Record<AreaKey, { label: string; dot: string }> = {
  COMERCIAL:   { label: "Comercial",   dot: "#22c55e" },
  MARKETING:   { label: "Marketing",   dot: "#db2777" },
  FINANCEIRO:  { label: "Financeiro",  dot: "#f97316" },
  TECNOLOGIA:  { label: "Tecnologia",  dot: "#7b61ff" },
  OPERACIONAL: { label: "Operações",   dot: "#00d4ff" },
  ESTRATEGICO: { label: "Estratégico", dot: "#0d9488" },
}

const FREQ_LABEL: Record<FreqKey, string> = {
  DAILY: "Daily", SEMANAL: "Semanal", QUINZENAL: "Quinzenal", MENSAL: "Mensal", ESTRATEGICO: "Estratégico",
}

const PLAN_STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  planned:      { label: "A Fazer",      color: "#7e8a9e", bg: "rgba(126,138,158,0.12)" },
  in_progress:  { label: "Em andamento", color: "#7b61ff", bg: "rgba(123,97,255,0.12)" },
  delivered:    { label: "Concluído",    color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  blocked:      { label: "Atrasado",     color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeRitual(r: Record<string, unknown>): Ritual {
  const area = r.area as Record<string, unknown> | undefined
  const areaKey = (area?.slug as string ?? area?.name as string ?? r.area_slug as string ?? "COMERCIAL").toUpperCase() as AreaKey
  const freqRaw = ((r.freq ?? r.frequency ?? "SEMANAL") as string).toUpperCase()
  const FREQ_MAP: Record<string, FreqKey> = {
    DAILY: "DAILY", DIARIO: "DAILY", WEEKLY: "SEMANAL", SEMANAL: "SEMANAL",
    BIWEEKLY: "QUINZENAL", QUINZENAL: "QUINZENAL", MONTHLY: "MENSAL", MENSAL: "MENSAL",
    ESTRATEGICO: "ESTRATEGICO",
  }
  return {
    id: r.id as number,
    name: (r.name as string) ?? "",
    area: areaKey in AREA_META ? areaKey : "COMERCIAL",
    ownerName: (r.owner_name as string) ?? (r.ownerName as string) ?? "",
    schedule: (r.schedule as string) ?? "",
    freq: FREQ_MAP[freqRaw] ?? "SEMANAL",
    nextDate: (r.next_date as string) ?? "",
  }
}

function normalizeKpi(k: Record<string, unknown>): Kpi {
  return {
    id: k.id as number,
    code: (k.code_ref as string) ?? (k.code as string) ?? "",
    name: (k.name as string) ?? "",
    area: (k.area as string) ?? "",
    unit: (k.unit as string) ?? "",
    goal: (k.goal as number) ?? 0,
    current: (k.current_value as number) ?? (k.current as number) ?? 0,
    status: (k.status as string) ?? "empty",
  }
}

function normalizePlan(p: Record<string, unknown>): Plan {
  const dueRaw = (p.due_date as string) ?? (p.dueDate as string) ?? ""
  const dueFmt = dueRaw ? new Date(dueRaw + "T12:00:00").toLocaleDateString("pt-BR") : ""
  return {
    id: p.id as number,
    title: (p.title as string) ?? "",
    status: (p.status as string) ?? "planned",
    owner: (p.owner_name as string) ?? (p.responsible as string) ?? "",
    dueDate: dueFmt,
  }
}

function normalizeMeeting(m: Record<string, unknown>): Meeting {
  const ata = m.ata as { minutes?: string } | null | undefined
  return {
    id: m.id as number,
    date: (m.occurred_at as string ?? m.date as string ?? "").slice(0, 10),
    status: (m.state as string) ?? (m.status as string) ?? "scheduled",
    minutes: ata?.minutes ?? (m.minutes as string) ?? "",
  }
}

function kpiPct(k: Kpi): number | null {
  if (!k.goal || k.current === 0) return null
  return (k.current / k.goal) * 100
}

function fmtNum(v: number, unit: string): string {
  if (unit === "R$") {
    if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
    return `R$ ${v.toFixed(0)}`
  }
  if (unit === "%") return `${v.toFixed(1)}%`
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RitualDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === "string" ? Number(params.id) : NaN

  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [kpis, setKpis] = useState<Kpi[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [kpiValues, setKpiValues] = useState<Record<number, string>>({})
  const [ataText, setAtaText] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"kpis" | "guia" | "ata" | "planos">("kpis")

  const [guia] = useState<GuiaItem[]>([
    { order: 1, text: "Revisão dos KPIs da semana", duration: "15 min", responsible: "" },
    { order: 2, text: "Análise de impedimentos e bloqueios", duration: "10 min", responsible: "Todos" },
    { order: 3, text: "Impedimentos e bloqueios", duration: "10 min", responsible: "Todos" },
    { order: 4, text: "Próximos passos e encaminhamentos", duration: "5 min", responsible: "" },
  ])

  const fetchData = useCallback(async () => {
    if (!Number.isFinite(id)) return
    setLoading(true)
    try {
      const [ritualRes, meetingsRes, plansRes] = await Promise.all([
        api.get(`/cockpit/rituals/${id}`),
        api.get("/cockpit/meetings", { params: { ritual_id: id } }),
        api.get("/cockpit/action-plans", { params: { ritual_id: id } }),
      ])
      const r = normalizeRitual(ritualRes.data)
      setRitual(r)
      const mList = ((meetingsRes.data ?? []) as Record<string, unknown>[])
        .map(normalizeMeeting)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      setMeetings(mList)
      if (mList[0]?.minutes) setAtaText(mList[0].minutes)
      setPlans(((plansRes.data ?? []) as Record<string, unknown>[]).map(normalizePlan))
      // fetch KPIs
      try {
        const kpiRes = await api.get(`/cockpit/rituals/${id}/kpis`)
        const kpiIds: string[] = Array.isArray(kpiRes.data?.kpi_ids) ? kpiRes.data.kpi_ids.map(String) : []
        if (kpiIds.length > 0) {
          const allKpis = await api.get("/cockpit/kpis")
          const list = (Array.isArray(allKpis.data) ? allKpis.data : allKpis.data?.data ?? []) as Record<string, unknown>[]
          setKpis(list.filter((k) => kpiIds.includes(String(k.id))).map(normalizeKpi))
        }
      } catch { /* no kpis linked */ }
    } catch {
      toast.error("Ritual não encontrado")
      router.replace("/cockpit/rituais")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (!Number.isFinite(id)) {
      toast.error("Ritual não encontrado")
      router.replace("/cockpit/rituais")
      return
    }
    void fetchData()
  }, [id, fetchData, router])

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--rf-text-muted)" }} />
      </div>
    )
  }

  if (!ritual) return null

  const area = AREA_META[ritual.area] ?? AREA_META.COMERCIAL
  const latestMeeting = meetings[0]

  const schedParts = ritual.schedule.split("·").map((s) => s.trim())
  const schedDisplay = schedParts[0] ? `${schedParts[0]}${schedParts[1] ? `, ${schedParts[1]}` : ""}` : "—"
  const nextDateDisplay = ritual.nextDate
    ? new Date(ritual.nextDate + "T12:00:00").toLocaleDateString("pt-BR")
    : latestMeeting?.date
      ? new Date(latestMeeting.date + "T12:00:00").toLocaleDateString("pt-BR")
      : "—"

  return (
    <>
      <style>{`
        /* ── Detail topbar ── */
        .dt-topbar {
          background: var(--rf-bg-surface, #fff);
          border-bottom: 1px solid var(--rf-border-subtle, rgba(0,0,0,0.05));
          padding: 14px 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .dt-back-btn {
          width: 32px; height: 32px; border-radius: 12px;
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--rf-text-secondary); flex-shrink: 0;
          transition: all 0.18s ease; text-decoration: none;
        }
        .dt-back-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
        .dt-header-info { flex: 1; min-width: 0; }
        .dt-area-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .dt-area-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dt-area-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--rf-text-muted);
        }
        .dt-freq-badge {
          padding: 3px 10px; border-radius: 9999px;
          font-size: 11px; font-weight: 600;
          background: var(--rf-bg-overlay); color: var(--rf-text-secondary);
          border: 1px solid var(--rf-border-subtle);
          margin-left: 4px;
        }
        .dt-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 20px; font-weight: 800;
          color: var(--rf-text-primary); letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .dt-meta-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .dt-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: var(--rf-text-secondary);
        }
        .dt-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: flex-start; }
        .dt-btn-ghost {
          padding: 7px 14px;
          background: var(--rf-bg-elevated);
          color: var(--rf-text-secondary);
          border: 1px solid var(--rf-border-default);
          border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.18s ease;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .dt-btn-ghost:hover { background: var(--rf-bg-hover); }
        .dt-btn-primary {
          padding: 7px 14px;
          background: var(--rf-accent, #7b61ff); color: #fff;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.18s ease;
          display: inline-flex; align-items: center; gap: 5px;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(123,97,255,0.3);
        }
        .dt-btn-primary:hover { background: var(--rf-accent-hover, #9178ff); }
        .dt-btn-primary:active { transform: scale(0.97); }

        /* ── Body ── */
        .dt-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Tabs ── */
        .dt-tabs {
          display: flex; gap: 2px;
          background: var(--rf-bg-overlay);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
          padding: 3px;
          overflow-x: auto; scrollbar-width: none;
        }
        .dt-tabs::-webkit-scrollbar { display: none; }
        .dt-tab {
          flex-shrink: 0;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-muted);
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap; border: none; background: transparent;
        }
        .dt-tab.active {
          background: var(--rf-bg-surface, #fff);
          color: var(--rf-text-primary);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .dt-tab-badge {
          font-size: 10px; font-weight: 700;
          padding: 1px 6px; border-radius: 9999px;
          background: var(--rf-accent-soft);
          color: var(--rf-accent);
        }
        .dt-tab.active .dt-tab-badge {
          background: var(--rf-accent); color: #fff;
        }

        /* ── Detail card ── */
        .dt-card {
          background: var(--rf-bg-surface, #fff);
          border: 1px solid var(--rf-border-default);
          border-radius: 16px;
          padding: 16px;
        }
        .dt-card-title {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--rf-text-muted);
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── KPI Table ── */
        .dt-kpi-table { width: 100%; border-collapse: collapse; }
        .dt-kpi-table th {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--rf-text-muted); padding: 8px 10px; text-align: left;
          border-bottom: 1px solid var(--rf-border-subtle);
        }
        .dt-kpi-table td {
          padding: 12px 10px;
          border-bottom: 1px solid var(--rf-border-subtle);
          vertical-align: middle;
        }
        .dt-kpi-table tr:last-child td { border-bottom: none; }
        .dt-kpi-name { font-size: 13px; font-weight: 600; color: var(--rf-text-primary); }
        .dt-kpi-area { font-size: 10px; color: var(--rf-text-muted); margin-top: 2px; }
        .dt-kpi-input {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 6px;
          padding: 7px 10px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 13px;
          width: 100%; outline: none;
          transition: all 0.18s ease;
          min-width: 90px;
        }
        .dt-kpi-input:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 2px var(--rf-accent-soft); }
        .dt-pct-good { color: #22c55e; font-weight: 700; font-size: 13px; }
        .dt-pct-bad  { color: #ef4444; font-weight: 700; font-size: 13px; }
        .dt-pct-empty { color: var(--rf-text-muted); font-size: 13px; }

        /* ── Guia ── */
        .dt-guia-list { display: flex; flex-direction: column; gap: 8px; }
        .dt-guia-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 12px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
        }
        .dt-guia-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--rf-accent-soft);
          border: 1px solid rgba(123,97,255,0.28);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: var(--rf-accent);
          flex-shrink: 0; margin-top: 1px;
        }
        .dt-guia-text { font-size: 13px; color: var(--rf-text-primary); line-height: 1.5; }
        .dt-guia-sub { font-size: 11px; color: var(--rf-text-muted); margin-top: 3px; }

        /* ── Ata ── */
        .dt-ata-textarea {
          width: 100%;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px;
          padding: 12px 14px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px; line-height: 1.6;
          resize: none; min-height: 120px; outline: none;
          transition: all 0.18s ease;
        }
        .dt-ata-textarea:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft); }

        /* ── Plans ── */
        .dt-plan-item {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
          padding: 12px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px;
        }
        .dt-plan-title { font-size: 13px; font-weight: 600; color: var(--rf-text-primary); }
        .dt-plan-sub { font-size: 11px; color: var(--rf-text-muted); margin-top: 3px; }
        .dt-plan-badge {
          font-size: 10px; font-weight: 700;
          padding: 2px 8px; border-radius: 9999px; white-space: nowrap;
        }

        /* ── Empty state ── */
        .dt-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 40px 24px; text-align: center;
          color: var(--rf-text-muted); font-size: 13px; gap: 8px;
        }
      `}</style>

      {/* Topbar */}
      <div className="dt-topbar">
        <SidebarTrigger className="h-8 w-8" />
        <Link href="/cockpit/rituais" className="dt-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>

        <div className="dt-header-info">
          <div className="dt-area-row">
            <span className="dt-area-dot" style={{ background: area.dot }} />
            <span className="dt-area-label">{area.label}</span>
            <span className="dt-freq-badge">{FREQ_LABEL[ritual.freq]}</span>
          </div>
          <div className="dt-title">{ritual.name}</div>
          <div className="dt-meta-row">
            {schedDisplay !== "—" && (
              <div className="dt-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {schedDisplay}
              </div>
            )}
            {ritual.ownerName && (
              <div className="dt-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Resp: {ritual.ownerName}
              </div>
            )}
            <div className="dt-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Próxima: {nextDateDisplay}
            </div>
          </div>
        </div>

        <div className="dt-actions">
          <Link href={`/cockpit/rituais/novo?edit=${ritual.id}`} className="dt-btn-ghost">Editar</Link>
          <Link
            href={latestMeeting ? `/cockpit/rituais/${ritual.id}/reunioes/${latestMeeting.id}/sessao` : "#"}
            className="dt-btn-primary"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Iniciar
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="dt-body">

        {/* Tabs */}
        <div className="dt-tabs">
          <button
            className={cn("dt-tab", activeTab === "kpis" && "active")}
            onClick={() => setActiveTab("kpis")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            KPIs
            {kpis.length > 0 && <span className="dt-tab-badge">{kpis.length}</span>}
          </button>
          <button
            className={cn("dt-tab", activeTab === "guia" && "active")}
            onClick={() => setActiveTab("guia")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Guia
            <span className="dt-tab-badge">{guia.length}</span>
          </button>
          <button
            className={cn("dt-tab", activeTab === "ata" && "active")}
            onClick={() => setActiveTab("ata")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Ata
          </button>
          <button
            className={cn("dt-tab", activeTab === "planos" && "active")}
            onClick={() => setActiveTab("planos")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            Planos de Ação
            {plans.length > 0 && <span className="dt-tab-badge">{plans.length}</span>}
          </button>
        </div>

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div className="dt-card" style={{ overflowX: "auto" }}>
            {kpis.length === 0 ? (
              <div className="dt-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <div>Nenhum KPI vinculado a este ritual.</div>
                <Link href="/cockpit/kpis" style={{ color: "var(--rf-accent)", fontSize: 12, fontWeight: 600 }}>
                  Ir para KPIs →
                </Link>
              </div>
            ) : (
              <table className="dt-kpi-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>KPI</th>
                    <th>Meta</th>
                    <th>Resultado</th>
                    <th>% Atingido</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((k) => {
                    const pct = kpiPct(k)
                    const val = kpiValues[k.id] ?? String(k.current || "")
                    return (
                      <tr key={k.id}>
                        <td style={{ fontFamily: "var(--font-dm-mono, monospace)", fontSize: 12, color: "var(--rf-text-muted)" }}>
                          {k.code || k.id}
                        </td>
                        <td>
                          <div className="dt-kpi-name">{k.name}</div>
                          {k.area && <div className="dt-kpi-area">{k.area}</div>}
                        </td>
                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)" }}>
                            {fmtNum(k.goal, k.unit)}
                          </span>
                        </td>
                        <td>
                          <input
                            className="dt-kpi-input"
                            type="text"
                            value={val}
                            placeholder="—"
                            onChange={(e) => setKpiValues((prev) => ({ ...prev, [k.id]: e.target.value }))}
                          />
                        </td>
                        <td>
                          {pct === null ? (
                            <span className="dt-pct-empty">—</span>
                          ) : pct >= 100 ? (
                            <span className="dt-pct-good">{pct.toFixed(0)}%</span>
                          ) : (
                            <span className="dt-pct-bad">{pct.toFixed(0)}%</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Guia Tab */}
        {activeTab === "guia" && (
          <div className="dt-card">
            <div className="dt-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Pauta da Reunião
            </div>
            <div className="dt-guia-list">
              {guia.map((item) => (
                <div key={item.order} className="dt-guia-item">
                  <div className="dt-guia-num">{item.order}</div>
                  <div>
                    <div className="dt-guia-text">{item.text}</div>
                    {(item.duration || item.responsible) && (
                      <div className="dt-guia-sub">
                        {[item.duration, item.responsible ? `Resp: ${item.responsible}` : null].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ata Tab */}
        {activeTab === "ata" && (
          <div className="dt-card">
            <div className="dt-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Ata da Última Sessão
              {latestMeeting?.date && (
                <span style={{ fontSize: 11, color: "var(--rf-text-muted)", fontFamily: "var(--font-dm-mono, monospace)", fontWeight: 400, marginLeft: 4 }}>
                  {new Date(latestMeeting.date + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
            <textarea
              className="dt-ata-textarea"
              value={ataText}
              onChange={(e) => setAtaText(e.target.value)}
              placeholder="Nenhuma ata registrada para esta sessão..."
            />
          </div>
        )}

        {/* Planos Tab */}
        {activeTab === "planos" && (
          <div className="dt-card">
            <div className="dt-card-title">Planos de Ação vinculados</div>
            {plans.length === 0 ? (
              <div className="dt-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <div>Nenhum plano vinculado a este ritual.</div>
                <Link href="/cockpit/planos-de-acao" style={{ color: "var(--rf-accent)", fontSize: 12, fontWeight: 600 }}>
                  Ver todos os planos →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plans.map((plan) => {
                  const statusMeta = PLAN_STATUS_LABEL[plan.status] ?? PLAN_STATUS_LABEL.planned
                  return (
                    <div key={plan.id} className="dt-plan-item">
                      <div>
                        <div className="dt-plan-title">{plan.title}</div>
                        {(plan.owner || plan.dueDate) && (
                          <div className="dt-plan-sub">
                            {[plan.owner ? `Resp: ${plan.owner}` : null, plan.dueDate ? `Prazo: ${plan.dueDate}` : null].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <span
                        className="dt-plan-badge"
                        style={{ color: statusMeta.color, background: statusMeta.bg }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}
