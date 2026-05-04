"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AreaKey = "COMERCIAL" | "MARKETING" | "FINANCEIRO" | "TECNOLOGIA" | "OPERACIONAL" | "ESTRATEGICO"

interface Ritual { id: string; name: string; area: AreaKey; ownerName: string; schedule: string }
interface Meeting { id: string; ritualId: string; date: string; status: string; minutes: string }
interface Kpi { id: number; code: string; name: string; area: string; unit: string; goal: number; current: number }
interface Plan { id: string; title: string; status: string }
interface Participant { name: string; present: boolean | null }

// ─── Metadata ─────────────────────────────────────────────────────────────────

const AREA_META: Record<AreaKey, { label: string; dot: string }> = {
  COMERCIAL:   { label: "Comercial",   dot: "#22c55e" },
  MARKETING:   { label: "Marketing",   dot: "#db2777" },
  FINANCEIRO:  { label: "Financeiro",  dot: "#f97316" },
  TECNOLOGIA:  { label: "Tecnologia",  dot: "#7b61ff" },
  OPERACIONAL: { label: "Operações",   dot: "#00d4ff" },
  ESTRATEGICO: { label: "Estratégico", dot: "#0d9488" },
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeRitual(r: Record<string, unknown>): Ritual {
  const area = r.area as Record<string, unknown> | undefined
  const areaKey = ((area?.slug ?? area?.name ?? r.area_slug ?? r.area ?? "COMERCIAL") as string).toUpperCase() as AreaKey
  return {
    id: String(r.id ?? ""),
    name: (r.name as string) ?? "",
    area: areaKey in AREA_META ? areaKey : "COMERCIAL",
    ownerName: (r.owner_name as string) ?? (r.ownerName as string) ?? "",
    schedule: (r.schedule as string) ?? "",
  }
}

function normalizeMeeting(m: Record<string, unknown>): Meeting {
  const ata = m.ata as { minutes?: string } | null | undefined
  return {
    id: String(m.id ?? ""),
    ritualId: String(m.ritual_id ?? m.ritualId ?? ""),
    date: ((m.occurred_at ?? m.date ?? "") as string).slice(0, 10),
    status: String(m.state ?? m.status ?? "in_progress"),
    minutes: ata?.minutes ?? (m.minutes as string) ?? "",
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
  }
}

function normalizePlan(p: Record<string, unknown>): Plan {
  return {
    id: String(p.id ?? ""),
    title: (p.title as string) ?? "",
    status: (p.status as string) ?? "planned",
  }
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

export default function SessaoPage() {
  const params = useParams()
  const ritualIdStr  = typeof params?.id        === "string" ? params.id        : ""
  const meetingIdStr = typeof params?.meetingId === "string" ? params.meetingId : ""

  const [ritual,  setRitual]  = useState<Ritual | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [kpis,    setKpis]    = useState<Kpi[]>([])
  const [plans,   setPlans]   = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const [elapsed,  setElapsed]  = useState(0)
  const [minutes,  setMinutes]  = useState("")
  const [kpiVals,  setKpiVals]  = useState<Record<number, string>>({})
  const [activeTab, setActiveTab] = useState<"presenca" | "kpis" | "guia" | "ata" | "planos">("presenca")
  const [presenca, setPresenca] = useState<Participant[]>([
    { name: "Carlos Silva",  present: true  },
    { name: "Luís Ferreira", present: true  },
    { name: "Marina Rocha",  present: null  },
    { name: "João Souza",    present: false },
  ])

  useEffect(() => {
    if (!ritualIdStr || !meetingIdStr) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      try {
        const [ritualRes, meetingRes, plansRes] = await Promise.all([
          api.get(`/cockpit/rituals/${ritualIdStr}`),
          api.get(`/cockpit/meetings/${meetingIdStr}`),
          api.get("/cockpit/action-plans", { params: { ritual_id: ritualIdStr } }),
        ])
        if (cancelled) return
        const r = normalizeRitual(ritualRes.data)
        setRitual(r)
        const m = normalizeMeeting(meetingRes.data)
        setMeeting(m)
        setMinutes(m.minutes)
        setPlans(((plansRes.data ?? []) as Record<string, unknown>[]).map(normalizePlan))
        // fetch KPIs
        try {
          const kpiRef = await api.get(`/cockpit/rituals/${ritualIdStr}/kpis`)
          const ids: string[] = Array.isArray(kpiRef.data?.kpi_ids) ? kpiRef.data.kpi_ids.map(String) : []
          if (ids.length > 0) {
            const allKpis = await api.get("/cockpit/kpis")
            const list = (Array.isArray(allKpis.data) ? allKpis.data : allKpis.data?.data ?? []) as Record<string, unknown>[]
            const linked = list.filter((k) => ids.includes(String(k.id))).map(normalizeKpi)
            if (!cancelled) setKpis(linked)
          }
        } catch { /* no kpis */ }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [ritualIdStr, meetingIdStr])

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const ss = String(elapsed % 60).padStart(2, "0")

  async function handleEncerrar() {
    if (!ritual || !meeting) return
    try {
      await api.patch(`/cockpit/meetings/${meeting.id}`, { state: "done", minutes })
      toast.success("Reunião encerrada!")
    } catch { /* ignore */ }
  }

  function togglePresenca(name: string) {
    setPresenca((prev) => prev.map((p) =>
      p.name === name
        ? { ...p, present: p.present === true ? false : p.present === false ? null : true }
        : p
    ))
  }

  const presentCount = presenca.filter((p) => p.present === true).length

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--rf-text-muted)" }} />
      </div>
    )
  }

  const area = ritual ? (AREA_META[ritual.area] ?? AREA_META.COMERCIAL) : AREA_META.COMERCIAL
  const schedParts = (ritual?.schedule ?? "").split("·").map((s) => s.trim())
  const schedDisplay = schedParts[0] ? `${schedParts[0]}${schedParts[1] ? `, ${schedParts[1]}` : ""}` : "—"

  return (
    <>
      <style>{`
        /* ── Session topbar ── */
        .ss-topbar {
          background: var(--rf-bg-surface, #fff);
          border-bottom: 1px solid var(--rf-border-subtle);
          padding: 14px 20px;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .ss-back-btn {
          width: 32px; height: 32px; border-radius: 12px;
          background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--rf-text-secondary); flex-shrink: 0;
          transition: all 0.18s ease; text-decoration: none;
        }
        .ss-back-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
        .ss-header { flex: 1; min-width: 0; }
        .ss-area-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .ss-area-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ss-area-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--rf-text-muted);
        }
        .ss-live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 9999px;
          background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.25);
          font-size: 11px; font-weight: 700; color: #22c55e; margin-left: 4px;
        }
        .ss-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: ss-pulse 1.4s infinite; flex-shrink: 0;
        }
        @keyframes ss-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .ss-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px; font-weight: 800;
          color: var(--rf-text-primary); letter-spacing: -0.3px; margin-bottom: 4px;
        }
        .ss-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ss-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: var(--rf-text-secondary);
        }
        .ss-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
        .ss-timer {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-strong);
          border-radius: 12px;
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 15px; font-weight: 500;
          color: var(--rf-text-primary);
        }
        .ss-timer-icon { color: var(--rf-text-muted); }
        .ss-btn-encerrar {
          padding: 9px 16px;
          background: #ef4444; color: #fff; border: none;
          border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          box-shadow: 0 2px 10px rgba(239,68,68,0.3);
          transition: all 0.18s ease;
        }
        .ss-btn-encerrar:hover { background: #dc2626; }
        .ss-btn-encerrar:active { transform: scale(0.97); }

        /* ── Body ── */
        .ss-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Detail card ── */
        .ss-card {
          background: var(--rf-bg-surface, #fff);
          border: 1px solid var(--rf-border-default);
          border-radius: 16px; padding: 16px;
        }
        .ss-card-title {
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--rf-text-muted); margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── Tabs ── */
        .ss-tabs {
          display: flex; gap: 2px;
          background: var(--rf-bg-overlay);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px;
          padding: 3px;
          overflow-x: auto; scrollbar-width: none;
        }
        .ss-tabs::-webkit-scrollbar { display: none; }
        .ss-tab {
          flex-shrink: 0;
          padding: 8px 14px; border-radius: 10px;
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-muted); cursor: pointer;
          transition: all 0.18s ease;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap; border: none; background: transparent;
        }
        .ss-tab.active {
          background: var(--rf-bg-surface, #fff);
          color: var(--rf-text-primary);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ss-tab-badge {
          font-size: 10px; font-weight: 700; padding: 1px 6px;
          border-radius: 9999px;
          background: var(--rf-accent-soft); color: var(--rf-accent);
        }
        .ss-tab.active .ss-tab-badge { background: var(--rf-accent); color: #fff; }

        /* ── Presença ── */
        .ss-presenca-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .ss-pchip {
          padding: 7px 14px; border-radius: 9999px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          font-size: 13px; font-weight: 500;
          color: var(--rf-text-primary);
          cursor: pointer; transition: all 0.18s ease;
        }
        .ss-pchip.presente {
          background: rgba(34,197,94,0.10); border-color: rgba(34,197,94,0.25); color: #22c55e;
        }
        .ss-pchip.ausente {
          background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.25); color: #ef4444;
        }

        /* ── KPI Table ── */
        .ss-kpi-table { width: 100%; border-collapse: collapse; }
        .ss-kpi-table th {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--rf-text-muted); padding: 8px 10px; text-align: left;
          border-bottom: 1px solid var(--rf-border-subtle);
        }
        .ss-kpi-table td { padding: 12px 10px; border-bottom: 1px solid var(--rf-border-subtle); vertical-align: middle; }
        .ss-kpi-table tr:last-child td { border-bottom: none; }
        .ss-kpi-name { font-size: 13px; font-weight: 600; color: var(--rf-text-primary); }
        .ss-kpi-area { font-size: 10px; color: var(--rf-text-muted); margin-top: 2px; }
        .ss-kpi-input {
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 6px; padding: 7px 10px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 13px; width: 100%; outline: none;
          transition: all 0.18s ease; min-width: 90px;
        }
        .ss-kpi-input:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 2px var(--rf-accent-soft); }
        .ss-pct-good { color: #22c55e; font-weight: 700; font-size: 13px; }
        .ss-pct-bad  { color: #ef4444; font-weight: 700; font-size: 13px; }
        .ss-pct-empty { color: var(--rf-text-muted); font-size: 13px; }

        /* ── Ata ── */
        .ss-ata-textarea {
          width: 100%;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px; padding: 12px 14px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px; line-height: 1.6;
          resize: none; min-height: 100px; outline: none;
          transition: all 0.18s ease;
        }
        .ss-ata-textarea:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft); }

        /* ── Footer actions ── */
        .ss-footer-btns { display: flex; gap: 10px; }
        .ss-btn-ghost {
          flex: 1; padding: 12px;
          background: transparent; color: var(--rf-text-secondary);
          border: 1px solid var(--rf-border-default); border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.18s ease;
        }
        .ss-btn-ghost:hover { background: var(--rf-bg-hover); }
        .ss-btn-encerrar-full {
          flex: 1; padding: 12px;
          background: #ef4444; color: #fff; border: none; border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 2px 10px rgba(239,68,68,0.3);
          transition: all 0.18s ease;
        }
        .ss-btn-encerrar-full:hover { background: #dc2626; }

        /* ── Hint ── */
        .ss-hint {
          text-align: center; padding: 20px 0;
          color: var(--rf-text-muted); font-size: 13px;
        }

        /* ── Guia ── */
        .ss-guia-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 12px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-subtle);
          border-radius: 12px; margin-bottom: 8px;
        }
        .ss-guia-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--rf-accent-soft);
          border: 1px solid rgba(123,97,255,0.28);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: var(--rf-accent);
          flex-shrink: 0; margin-top: 1px;
        }
        .ss-guia-text { font-size: 13px; color: var(--rf-text-primary); line-height: 1.5; }
      `}</style>

      {/* Topbar */}
      <div className="ss-topbar">
        <Link href={`/cockpit/rituais/${ritualIdStr}`} className="ss-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>

        <div className="ss-header">
          <div className="ss-area-row">
            <span className="ss-area-dot" style={{ background: area.dot }} />
            <span className="ss-area-label">{area.label}</span>
            <span className="ss-live-badge"><span className="ss-live-dot" />Em andamento</span>
          </div>
          <div className="ss-title">{ritual?.name ?? "Sessão"}</div>
          <div className="ss-meta">
            {schedDisplay !== "—" && (
              <div className="ss-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {schedDisplay}
              </div>
            )}
            {ritual?.ownerName && (
              <div className="ss-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Resp: {ritual.ownerName}
              </div>
            )}
          </div>
        </div>

        <div className="ss-actions">
          <div className="ss-timer">
            <svg className="ss-timer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {mm}:{ss}
          </div>
          <button className="ss-btn-encerrar" onClick={() => void handleEncerrar()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            Encerrar Reunião
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="ss-body">

        {/* Presença */}
        <div className="ss-card">
          <div className="ss-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Presença ({presentCount}/{presenca.length})
          </div>
          <div className="ss-presenca-chips">
            {presenca.map((p) => (
              <button
                key={p.name}
                type="button"
                className={cn(
                  "ss-pchip",
                  p.present === true && "presente",
                  p.present === false && "ausente",
                )}
                onClick={() => togglePresenca(p.name)}
              >
                {p.present === true ? "✓ " : p.present === false ? "✗ " : ""}{p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="ss-tabs">
          <button className={cn("ss-tab", activeTab === "presenca" && "active")} onClick={() => setActiveTab("presenca")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            Presença
          </button>
          <button className={cn("ss-tab", activeTab === "kpis" && "active")} onClick={() => setActiveTab("kpis")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            KPIs {kpis.length > 0 && <span className="ss-tab-badge">{kpis.length}</span>}
          </button>
          <button className={cn("ss-tab", activeTab === "guia" && "active")} onClick={() => setActiveTab("guia")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Guia
          </button>
          <button className={cn("ss-tab", activeTab === "ata" && "active")} onClick={() => setActiveTab("ata")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            </svg>
            Ata
          </button>
          <button className={cn("ss-tab", activeTab === "planos" && "active")} onClick={() => setActiveTab("planos")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
            </svg>
            Planos {plans.length > 0 && <span className="ss-tab-badge">{plans.length}</span>}
          </button>
        </div>

        {/* Tab: Presença (hint) */}
        {activeTab === "presenca" && (
          <div className="ss-hint">
            Selecione uma aba acima para preencher os dados da sessão →
            <br />
            <span style={{ fontSize: 11, marginTop: 6, display: "block" }}>
              Clique em <strong style={{ color: "var(--rf-accent)" }}>KPIs</strong> para ir à tela de preenchimento
            </span>
          </div>
        )}

        {/* Tab: KPIs */}
        {activeTab === "kpis" && (
          <>
            <div className="ss-card" style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="ss-card-title" style={{ marginBottom: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  KPIs da Sessão
                </div>
                {kpis.length > 0 && (
                  <span style={{ fontSize: 11, color: "var(--rf-text-muted)", fontFamily: "var(--font-dm-mono, monospace)" }}>
                    {Object.keys(kpiVals).filter((id) => kpiVals[Number(id)]).length}/{kpis.length} preenchidos
                  </span>
                )}
              </div>
              {kpis.length === 0 ? (
                <div style={{ color: "var(--rf-text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  Nenhum KPI vinculado a este ritual.
                </div>
              ) : (
                <table className="ss-kpi-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>KPI</th><th>Descrição</th><th>Meta</th><th>Resultado</th><th>% Atingido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k) => {
                      const val = kpiVals[k.id] ?? ""
                      const numVal = parseFloat(val.replace(",", "."))
                      const pct = k.goal && !isNaN(numVal) ? (numVal / k.goal) * 100 : null
                      return (
                        <tr key={k.id}>
                          <td style={{ fontFamily: "var(--font-dm-mono, monospace)", fontSize: 12, color: "var(--rf-text-muted)" }}>
                            {k.code || k.id}
                          </td>
                          <td>
                            <div className="ss-kpi-name">{k.name}</div>
                            {k.area && <div className="ss-kpi-area">{k.area}</div>}
                          </td>
                          <td style={{ fontSize: 12, color: "var(--rf-text-secondary)" }}>{k.name}</td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)" }}>{fmtNum(k.goal, k.unit)}</td>
                          <td>
                            <input
                              className="ss-kpi-input"
                              type="text"
                              value={val}
                              placeholder="Preencher..."
                              onChange={(e) => setKpiVals((prev) => ({ ...prev, [k.id]: e.target.value }))}
                            />
                          </td>
                          <td>
                            {pct === null ? (
                              <span className="ss-pct-empty">—</span>
                            ) : pct >= 100 ? (
                              <span className="ss-pct-good">{pct.toFixed(0)}%</span>
                            ) : (
                              <span className="ss-pct-bad">{pct.toFixed(0)}%</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="ss-card">
              <div className="ss-card-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                </svg>
                Ata rápida
              </div>
              <textarea
                className="ss-ata-textarea"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Registre decisões, encaminhamentos e observações da sessão..."
                style={{ minHeight: 80 }}
              />
            </div>
            <div className="ss-footer-btns">
              <button type="button" className="ss-btn-ghost" onClick={() => toast.success("Rascunho salvo!")}>
                Salvar rascunho
              </button>
              <button type="button" className="ss-btn-encerrar-full" onClick={() => void handleEncerrar()}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Encerrar Reunião
              </button>
            </div>
          </>
        )}

        {/* Tab: Guia */}
        {activeTab === "guia" && (
          <div className="ss-card">
            <div className="ss-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Pauta da Reunião
            </div>
            {[
              { n: 1, text: "Revisão dos KPIs da sessão", sub: "15 min" },
              { n: 2, text: "Impedimentos e bloqueios", sub: "10 min · Todos" },
              { n: 3, text: "Encaminhamentos e próximos passos", sub: "5 min" },
            ].map((item) => (
              <div key={item.n} className="ss-guia-item">
                <div className="ss-guia-num">{item.n}</div>
                <div>
                  <div className="ss-guia-text">{item.text}</div>
                  <div style={{ fontSize: 11, color: "var(--rf-text-muted)", marginTop: 3 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Ata */}
        {activeTab === "ata" && (
          <div className="ss-card">
            <div className="ss-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              </svg>
              Ata da Sessão
            </div>
            <textarea
              className="ss-ata-textarea"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Registre decisões, encaminhamentos e observações da sessão..."
              style={{ minHeight: 200 }}
            />
          </div>
        )}

        {/* Tab: Planos */}
        {activeTab === "planos" && (
          <div className="ss-card">
            <div className="ss-card-title">Planos de Ação</div>
            {plans.length === 0 ? (
              <div style={{ color: "var(--rf-text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                Nenhum plano vinculado.
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--rf-bg-elevated)", border: "1px solid var(--rf-border-subtle)", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)" }}>{plan.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "var(--rf-accent-soft)", color: "var(--rf-accent)" }}>
                    {plan.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </>
  )
}
