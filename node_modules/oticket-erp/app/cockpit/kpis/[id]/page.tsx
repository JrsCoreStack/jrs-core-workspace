"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/utils/api"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { areaColor, areaLabel, normalizeAreaSlug } from "@/lib/cockpit/constants"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts"

/* ─── types ─── */
type KpiDetail = {
  id: string
  code: string
  name: string
  description: string
  area: string
  unit: string
  kpi_type: string
  annual_goal: number
  month_goal: number
  deviation_pct: number
  current_value: number
  status: string
  visibility?: string
  manual_entry?: boolean
  created_at?: string
  owner_name?: string
}

type KpiResult = {
  id: string
  period_label: string
  period_start?: string | null
  value: number
  target: number
  deviation_pct: number
  evidence_url?: string | null
  evidence_note?: string | null
  evidence_file_name?: string | null
  evidence_attachment_path?: string | null
}

type LinkedRitual = {
  id: string
  name: string
  area: string
  frequency?: string
  schedule?: string
}

type MonthlyGoal = {
  month: number
  goal: number
  result?: number | null
}

/* ─── utils ─── */
function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatVal(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—"
  if (unit === "R$") {
    if (Math.abs(value) >= 1_000_000) {
      const v = value / 1_000_000
      const str = v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace(".", ",")
      return `R$ ${str}M`
    }
    if (Math.abs(value) >= 1_000) {
      return `R$ ${(value / 1000).toFixed(0)}k`
    }
    return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
  }
  if (unit === "%") {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
  }
  const nearInt = Math.abs(value - Math.round(value)) < 1e-9
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: nearInt ? 0 : 2,
  })
}

function formatDatePt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return iso
  }
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

/* ─── custom tooltip ─── */
function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[];
  label?: string; unit: string;
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--rf-bg-overlay)", border: "1px solid var(--rf-border-default)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--rf-shadow-md)",
    }}>
      <p style={{ fontSize: 11, color: "var(--rf-text-muted)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {formatVal(p.value, unit)}
        </div>
      ))}
    </div>
  )
}

/* ─── main page ─── */
export default function KpiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const idStr = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] ?? "" : ""

  const [kpi, setKpi] = useState<KpiDetail | null>(null)
  const [results, setResults] = useState<KpiResult[]>([])
  const [rituals, setRituals] = useState<LinkedRitual[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState<"3M" | "6M" | "12M">("6M")
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regValue, setRegValue] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!idStr) { setLoading(false); return }
    try {
      setLoading(true)
      const { data } = await api.get(`/cockpit/kpis/${idStr}`)
      const raw = data as Record<string, unknown>

      setKpi({
        id: String(raw.id ?? ""),
        code: String(raw.code_ref ?? raw.code ?? ""),
        name: String(raw.name ?? ""),
        description: String(raw.description ?? ""),
        area: String(normalizeAreaSlug(String(raw.area ?? "")) ?? raw.area ?? ""),
        unit: String(raw.unit ?? ""),
        kpi_type: String(raw.kpi_type ?? raw.data_type ?? ""),
        annual_goal: num(raw.annual_goal),
        month_goal: num(raw.month_goal),
        deviation_pct: num(raw.deviation_pct),
        current_value: num(raw.current_value ?? raw.current),
        status: String(raw.status ?? "empty"),
        visibility: String(raw.visibility ?? ""),
        manual_entry: Boolean(raw.allow_manual_entry ?? true),
        created_at: String(raw.created_at ?? ""),
        owner_name: String(raw.owner_name ?? ""),
      })

      const rawResults = Array.isArray(raw.results) ? raw.results as KpiResult[] : []
      setResults(rawResults)

      const rawRituals = Array.isArray(raw.linked_rituals) ? raw.linked_rituals as LinkedRitual[] : []
      setRituals(rawRituals)

      // build monthly goals
      const monthlyMap: MonthlyGoal[] = MONTHS.map((_, i) => ({
        month: i + 1,
        goal: num(raw.annual_goal) / 12,
        result: null,
      }))
      rawResults.forEach((r) => {
        if (r.period_start) {
          const m = new Date(r.period_start).getMonth()
          if (monthlyMap[m]) {
            monthlyMap[m].result = r.value
            if (r.target) monthlyMap[m].goal = r.target
          }
        }
      })
      setMonthlyGoals(monthlyMap)
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao carregar KPI." })
    } finally {
      setLoading(false)
    }
  }, [idStr])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRegister() {
    if (!kpi) return
    const v = Number(String(regValue).replace(",", "."))
    if (!Number.isFinite(v)) { toast.error("Informe um valor numérico válido."); return }
    try {
      setSaving(true)
      const now = new Date()
      await api.post(`/cockpit/kpis/${kpi.id}/results`, {
        period_label: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
        value: v,
        period_start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
      })
      toast.success("Resultado registrado com sucesso.")
      setRegisterOpen(false)
      setRegValue("")
      await fetchData()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao registrar resultado." })
    } finally {
      setSaving(false)
    }
  }

  /* chart data */
  const rangeN = chartRange === "3M" ? 3 : chartRange === "6M" ? 6 : 12
  const chartData = results.slice(-rangeN).map((r) => ({
    label: r.period_label,
    Realizado: r.value,
    Meta: r.target || (kpi?.month_goal ?? 0),
  }))

  /* computed */
  const pct = kpi ? (kpi.annual_goal > 0 ? (kpi.current_value / kpi.annual_goal) * 100 : 0) : 0
  const pctStr = pct > 0 ? `${pct.toFixed(1)}%` : "—"
  const aColor = kpi ? areaColor(kpi.area) : "#7b61ff"
  const aLabel = kpi ? areaLabel(kpi.area) : ""
  const currentMonth = new Date().getMonth()

  const statusColor = kpi?.status === "above" ? "var(--rf-success)"
    : kpi?.status === "attention" ? "var(--rf-warning)"
    : kpi?.status === "critical" ? "var(--rf-danger)"
    : "var(--rf-text-muted)"

  const fillClass = kpi?.status === "above" ? "fill-good"
    : kpi?.status === "critical" ? "fill-bad"
    : "fill-warn"

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--rf-text-muted)", fontSize: 14 }}>
        Carregando KPI…
      </div>
    )
  }

  if (!kpi) {
    return (
      <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--rf-text-primary)" }}>KPI não encontrado</div>
        <button
          onClick={() => router.push("/cockpit/kpis")}
          style={{
            padding: "8px 20px", background: "var(--rf-accent)", color: "#fff",
            border: "none", borderRadius: "var(--rf-radius-md)", cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Voltar para lista
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .kpi-dt-stat-card { background: var(--rf-bg-surface); border: 1px solid var(--rf-border-default); border-radius: var(--rf-radius-lg); padding: 14px 16px; }
        .kpi-dt-stat-label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--rf-text-muted); margin-bottom: 10px; }
        .kpi-dt-stat-value { font-family: var(--rf-font-display); font-size: 22px; font-weight: 800; color: var(--rf-text-primary); letter-spacing: -0.4px; line-height: 1; }
        .kpi-dt-stat-note { font-size: 11px; color: var(--rf-text-muted); margin-top: 5px; }
        .kpi-dt-card { background: var(--rf-bg-surface); border: 1px solid var(--rf-border-default); border-radius: var(--rf-radius-lg); padding: 16px; margin-bottom: 14px; }
        .kpi-dt-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .kpi-dt-card-title { font-size: 13px; font-weight: 600; color: var(--rf-text-primary); display: flex; align-items: center; gap: 6px; }
        .kpi-pct-badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
        .pct-badge-bad { background: var(--rf-danger-soft); color: var(--rf-danger); border: 1px solid rgba(239,68,68,0.25); }
        .pct-badge-good { background: var(--rf-success-soft); color: var(--rf-success); border: 1px solid rgba(34,197,94,0.25); }
        .pct-badge-warn { background: rgba(245,158,11,0.10); color: var(--rf-warning); }
        .pct-badge-empty { background: var(--rf-bg-elevated); color: var(--rf-text-muted); }
        .progress-track { height: 8px; border-radius: 9999px; background: var(--rf-border-subtle); overflow: hidden; margin-bottom: 8px; }
        .progress-fill { height: 100%; border-radius: 9999px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        .fill-bad { background: var(--rf-danger); }
        .fill-good { background: linear-gradient(90deg, var(--rf-accent), var(--rf-success)); }
        .fill-warn { background: var(--rf-warning); }
        .month-cell { background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-subtle); border-radius: var(--rf-radius-md); padding: 10px 12px; text-align: center; }
        .month-cell.current { border-color: var(--rf-accent-border); background: var(--rf-accent-soft); }
        .hist-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--rf-border-subtle); }
        .hist-item:last-child { border-bottom: none; padding-bottom: 0; }
        .ritual-link-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-subtle); border-radius: var(--rf-radius-md); margin-bottom: 8px; cursor: pointer; transition: all var(--rf-transition); }
        .ritual-link-item:last-child { margin-bottom: 0; }
        .ritual-link-item:hover { border-color: var(--rf-border-strong); }
        .back-btn { width: 32px; height: 32px; border-radius: var(--rf-radius-md); background: var(--rf-bg-elevated); border: 1px solid var(--rf-border-default); display: grid; place-items: center; cursor: pointer; color: var(--rf-text-secondary); flex-shrink: 0; transition: all var(--rf-transition); }
        .back-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }
        .kpi-dt-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--rf-radius-md); font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--rf-transition); border: none; white-space: nowrap; font-family: var(--rf-font-body); }
        .btn-ghost-sm { background: var(--rf-bg-elevated); color: var(--rf-text-secondary); border: 1px solid var(--rf-border-default) !important; }
        .btn-primary-sm { background: var(--rf-accent); color: #fff; box-shadow: 0 2px 10px rgba(123,97,255,0.35); }
        .chart-filter-btn { padding: 4px 10px; border-radius: 9999px; border: 1px solid var(--rf-border-default); background: var(--rf-bg-elevated); font-size: 11px; font-weight: 600; color: var(--rf-text-muted); cursor: pointer; transition: all var(--rf-transition); }
        .chart-filter-btn.active { background: var(--rf-accent-soft); color: var(--rf-accent); border-color: var(--rf-accent-border); }
        .register-modal { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .register-modal-box { background: var(--rf-bg-surface); border: 1px solid var(--rf-border-default); border-radius: var(--rf-radius-xl); padding: 24px; width: 100%; max-width: 400px; box-shadow: var(--rf-shadow-lg); }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        background: "var(--rf-bg-surface)", borderBottom: "1px solid var(--rf-border-subtle)",
        padding: "14px 20px", display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <SidebarTrigger />
        <button className="back-btn" onClick={() => router.push("/cockpit/kpis")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: aColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rf-text-muted)" }}>{aLabel}</span>
            <span style={{ fontFamily: "var(--rf-font-mono)", fontSize: 12, color: "var(--rf-text-muted)" }}>#{kpi.code}</span>
          </div>
          <div style={{ fontFamily: "var(--rf-font-display)", fontSize: 22, fontWeight: 800, color: "var(--rf-text-primary)", letterSpacing: "-0.4px", marginBottom: 4 }}>
            {kpi.name}
          </div>
          {kpi.description && (
            <div style={{ fontSize: 13, color: "var(--rf-text-secondary)" }}>{kpi.description}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            className="kpi-dt-btn btn-ghost-sm"
            onClick={() => router.push(`/cockpit/kpis/novo?edit=${kpi.id}`)}
          >
            Editar
          </button>
          <button
            className="kpi-dt-btn btn-primary-sm"
            onClick={() => setRegisterOpen(true)}
          >
            + Registrar
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px 20px", paddingBottom: 60 }}>

        {/* 4 STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div className="kpi-dt-stat-card">
            <div className="kpi-dt-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
              </svg>
              Meta Anual
            </div>
            <div className="kpi-dt-stat-value">{formatVal(kpi.annual_goal, kpi.unit)}</div>
            <div className="kpi-dt-stat-note">{kpi.kpi_type} · {kpi.unit}</div>
          </div>
          <div className="kpi-dt-stat-card">
            <div className="kpi-dt-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Resultado Atual
            </div>
            <div className="kpi-dt-stat-value">
              {kpi.status === "empty" ? "—" : formatVal(kpi.current_value, kpi.unit)}
            </div>
            <div className="kpi-dt-stat-note">
              {results.length > 0 ? `Último: ${formatDatePt(results[results.length - 1]?.period_start ?? "")}` : "Nenhum registro"}
            </div>
          </div>
          <div className="kpi-dt-stat-card">
            <div className="kpi-dt-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              % Atingido
            </div>
            <div className="kpi-dt-stat-value" style={{ color: statusColor }}>
              {pctStr}
            </div>
            <div className="kpi-dt-stat-note">
              {kpi.status === "above" ? "Acima da meta" : kpi.status === "critical" ? "Abaixo da meta" : kpi.status === "attention" ? "Em atenção" : "Sem dados"}
            </div>
          </div>
          <div className="kpi-dt-stat-card">
            <div className="kpi-dt-stat-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Registros
            </div>
            <div className="kpi-dt-stat-value">{results.length}</div>
            <div className="kpi-dt-stat-note">em reuniões</div>
          </div>
        </div>

        {/* PROGRESSO META ANUAL */}
        <div className="kpi-dt-card">
          <div className="kpi-dt-card-hd">
            <div className="kpi-dt-card-title">Progresso da Meta Anual</div>
            <span className={`kpi-pct-badge ${pct === 0 ? "pct-badge-empty" : pct >= 100 ? "pct-badge-good" : pct >= 50 ? "pct-badge-warn" : "pct-badge-bad"}`}>
              {pctStr}
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${fillClass}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--rf-text-muted)", fontFamily: "var(--rf-font-mono)" }}>
            <span>0</span>
            <span>{formatVal(kpi.annual_goal, kpi.unit)}</span>
          </div>
        </div>

        {/* METAS MENSAIS */}
        <div className="kpi-dt-card">
          <div className="kpi-dt-card-hd">
            <div className="kpi-dt-card-title">
              Metas Mensais — {new Date().getFullYear()}
            </div>
            <button
              className="kpi-dt-btn btn-ghost-sm"
              onClick={() => router.push(`/cockpit/kpis/novo?edit=${kpi.id}`)}
              style={{ fontSize: 12, padding: "5px 10px" }}
            >
              Editar metas
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {monthlyGoals.slice(0, 8).map((mg, i) => (
              <div
                key={mg.month}
                className={`month-cell${i === currentMonth ? " current" : ""}`}
                style={{ opacity: i > currentMonth && mg.result == null ? 0.45 : 1 }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: i === currentMonth ? "var(--rf-accent)" : "var(--rf-text-muted)", marginBottom: 6 }}>
                  {MONTHS[i]}
                </div>
                <div style={{ fontFamily: "var(--rf-font-mono)", fontSize: 12, fontWeight: 500, color: "var(--rf-text-primary)", marginBottom: 3 }}>
                  {mg.result != null ? formatVal(mg.result, kpi.unit) : "—"}
                </div>
                <div style={{ fontSize: 10, color: "var(--rf-text-muted)" }}>
                  Meta: {formatVal(mg.goal, kpi.unit)}
                </div>
                {mg.result != null && mg.goal > 0 && (
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: mg.result >= mg.goal ? "var(--rf-success)" : mg.result >= mg.goal * 0.8 ? "var(--rf-warning)" : "var(--rf-danger)",
                  }}>
                    {((mg.result / mg.goal) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO */}
        <div className="kpi-dt-card">
          <div className="kpi-dt-card-hd">
            <div className="kpi-dt-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
              Evolução ao Longo do Tempo
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["3M", "6M", "12M"] as const).map((r) => (
                  <button
                    key={r}
                    className={`chart-filter-btn${chartRange === r ? " active" : ""}`}
                    onClick={() => setChartRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--rf-text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rf-accent)" }} />
                  Realizado
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--rf-text-secondary)" }}>
                  <div style={{ width: 12, height: 2, background: "var(--rf-danger)", borderRadius: 1 }} />
                  Meta
                </div>
              </div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rf-border-subtle)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--rf-text-muted)" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--rf-text-muted)" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => formatVal(v, kpi.unit)}
                  />
                  <Tooltip content={<CustomTooltip unit={kpi.unit} />} />
                  <Line
                    type="monotone" dataKey="Realizado"
                    stroke="var(--rf-accent)" strokeWidth={2.5}
                    dot={{ fill: "var(--rf-accent)", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone" dataKey="Meta"
                    stroke="var(--rf-danger)" strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={{ fill: "var(--rf-danger)", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{
              height: 200, display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--rf-text-muted)", fontSize: 13, fontStyle: "italic",
            }}>
              Nenhum registro para exibir no gráfico
            </div>
          )}
        </div>

        {/* HISTÓRICO DE REGISTROS */}
        <div className="kpi-dt-card">
          <div className="kpi-dt-card-hd">
            <div className="kpi-dt-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Histórico de Registros
              <span style={{ fontFamily: "var(--rf-font-mono)", fontSize: 12, color: "var(--rf-text-muted)", fontWeight: 400 }}>
                ({results.length})
              </span>
            </div>
          </div>
          {results.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--rf-text-muted)", padding: "12px 0" }}>
              Nenhum registro encontrado.
            </div>
          ) : (
            <div>
              {[...results].reverse().map((r) => {
                const devColor = r.deviation_pct > 0 ? "var(--rf-success)"
                  : r.deviation_pct < -15 ? "var(--rf-danger)"
                  : r.deviation_pct < 0 ? "var(--rf-warning)"
                  : "var(--rf-text-muted)"
                return (
                  <div key={r.id} className="hist-item">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--rf-text-primary)" }}>
                        {r.period_start ? formatDatePt(r.period_start) : r.period_label}
                      </div>
                      {r.evidence_note && (
                        <div style={{ fontSize: 11, color: "var(--rf-text-secondary)", marginTop: 2 }}>
                          {r.evidence_note}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--rf-font-display)", fontSize: 14, fontWeight: 700, color: "var(--rf-text-primary)" }}>
                        {formatVal(r.value, kpi.unit)}
                      </div>
                      {r.deviation_pct !== 0 && (
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: devColor }}>
                          {r.deviation_pct > 0 ? "+" : ""}{r.deviation_pct.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RITUAIS VINCULADOS */}
        {rituals.length > 0 && (
          <div className="kpi-dt-card">
            <div className="kpi-dt-card-hd">
              <div className="kpi-dt-card-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M6.5 20v-1.5a5.5 5.5 0 0111 0V20"/>
                </svg>
                Rituais que acompanham este KPI ({rituals.length})
              </div>
            </div>
            {rituals.map((r) => (
              <div
                key={r.id}
                className="ritual-link-item"
                onClick={() => router.push(`/cockpit/rituais/${r.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rf-success)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-text-primary)" }}>{r.name}</div>
                    {r.schedule && (
                      <div style={{ fontSize: 11, color: "var(--rf-text-secondary)", marginTop: 2 }}>{r.schedule}</div>
                    )}
                  </div>
                </div>
                {r.frequency && (
                  <span style={{
                    padding: "3px 10px", borderRadius: 9999, background: "var(--rf-bg-overlay)",
                    border: "1px solid var(--rf-border-subtle)", fontSize: 11, fontWeight: 600,
                    color: "var(--rf-text-secondary)",
                  }}>
                    {r.frequency}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* META INFO */}
        <div style={{
          background: "var(--rf-bg-elevated)", border: "1px solid var(--rf-border-subtle)",
          borderRadius: "var(--rf-radius-md)", padding: 14, marginBottom: 14,
        }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Tipo", value: kpi.kpi_type || "—" },
              { label: "Unidade", value: kpi.unit || "—" },
              { label: "Visibilidade", value: kpi.visibility || "—" },
              { label: "Registro manual", value: kpi.manual_entry ? "Permitido" : "Apenas via ritual" },
              { label: "Responsável", value: kpi.owner_name || "—" },
              { label: "Criado em", value: kpi.created_at ? new Date(kpi.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "—" },
            ].map((item) => (
              <div key={item.label}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--rf-text-primary)" }}>{item.label}:</span>
                <span style={{ fontSize: 12, color: "var(--rf-text-secondary)", marginLeft: 4 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR */}
      {registerOpen && (
        <div className="register-modal" onClick={() => setRegisterOpen(false)}>
          <div className="register-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--rf-font-display)", fontSize: 17, fontWeight: 700, color: "var(--rf-text-primary)", marginBottom: 4 }}>
                Registrar Resultado
              </div>
              <div style={{ fontSize: 12, color: "var(--rf-text-secondary)" }}>
                {kpi.name} — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rf-text-secondary)", marginBottom: 6 }}>
                Resultado ({kpi.unit || "valor"})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={regValue}
                onChange={(e) => setRegValue(e.target.value)}
                placeholder={kpi.unit === "R$" ? "Ex: 1250000" : kpi.unit === "%" ? "Ex: 98,5" : "Ex: 100"}
                style={{
                  width: "100%", background: "var(--rf-bg-elevated)", border: "1px solid var(--rf-border-default)",
                  borderRadius: "var(--rf-radius-md)", padding: "11px 14px", color: "var(--rf-text-primary)",
                  fontFamily: "var(--rf-font-body)", fontSize: 14, outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setRegisterOpen(false)}
                style={{
                  flex: 1, padding: 12, background: "transparent", color: "var(--rf-text-secondary)",
                  border: "1px solid var(--rf-border-default)", borderRadius: "var(--rf-radius-md)",
                  fontFamily: "var(--rf-font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                disabled={saving}
                style={{
                  flex: 1, padding: 12, background: "var(--rf-accent)", color: "#fff", border: "none",
                  borderRadius: "var(--rf-radius-md)", fontFamily: "var(--rf-font-body)",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(123,97,255,0.35)", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Salvando…" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
