"use client"

import { Fragment, Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import api from "@/utils/api"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import { buildCreateKpiBody } from "@/lib/cockpit/kpi-create-payload"
import { toastApiError } from "@/lib/cockpit/api-error"
import { COCKPIT_AREAS, areaColor, areaLabel, normalizeAreaSlug } from "@/lib/cockpit/constants"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Download,
  Plus,
  Info,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Eye,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  DollarSign,
  Percent,
  Hash,
  TrendingUp,
  X,
  Paperclip,
  Trash2,
} from "lucide-react"

type KpiStatus = "above" | "attention" | "critical" | "empty"
type KpiTrend = "up" | "down" | "flat"

type KpiRow = {
  id: string
  code: string
  name: string
  area: string
  areaColor: string
  type: string
  aggregation: string
  frequency: string
  ownerName: string
  ownerInitials: string
  ownerColor: string
  result: number
  resultUnit: string
  monthGoal: number
  annualGoal: number
  deviationPct: number
  trend: KpiTrend
  status: KpiStatus
  stalePeriods: number
  isCockpit: boolean
  /** Limite de desvio negativo (ex.: 15 → crítico se &lt; -15% vs meta mês). */
  criticalDeviationThresholdPct: number
  /** Limite da faixa “atenção” (corte independente do crítico quando atenção &lt; crítico). */
  attentionDeviationThresholdPct: number
  ritualId?: string | null
}

type RitualOption = { id: string; name: string }
type KpiDetailApi = {
  results?: Array<{
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
  }>
  linked_rituals?: Array<{ id: string; name: string; area: string }>
  goal_versions?: Array<{ id: string; month_goal: number; annual_goal: number; changed_at: string; changed_by: string | null; note: string | null }>
}

const KPI_STATUS_LABELS: Record<KpiStatus, string> = {
  above: "Atingindo Meta",
  attention: "Em Atenção",
  critical: "Crítico",
  empty: "Sem Atualização",
}

const KPI_TYPES = ["Monetário", "Quantidade", "Percentual", "Índice"]

const OWNER_COLORS: Record<string, string> = {
  Evandro: "#16a34a", Vinícius: "#db2777", Cairo: "#0d9488",
  Ricardo: "#0369a1", "José Pedro": "#15803d", "João Arantes": "#1e40af",
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function normalizeKpi(raw: Record<string, unknown>): KpiRow {
  const ownerName = (raw.owner_name as string) ?? ""
  const ownerInitials = ownerName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "??"
  const rawArea = (raw.area as string) ?? ""
  const area = String(normalizeAreaSlug(rawArea) || rawArea)
  const codeRef = raw.code_ref ?? raw.code
  const type =
    (raw.kpi_type as string) ?? (raw.data_type as string) ?? ""
  const aggregation =
    (raw.aggregation as string) ?? (raw.consolidation as string) ?? ""
  const frequency =
    (raw.input_frequency as string) ?? (raw.frequency as string) ?? ""
  const current =
    raw.current_value ?? raw.current
  const isCockpit = raw.is_cockpit ?? raw.show_in_cockpit
  return {
    id: String(raw.id ?? ""),
    code: typeof codeRef === "string" ? codeRef : codeRef != null ? String(codeRef) : "",
    name: (raw.name as string) ?? "",
    area,
    areaColor: areaColor(area),
    type,
    aggregation,
    frequency,
    ownerName,
    ownerInitials,
    ownerColor: OWNER_COLORS[ownerName] ?? "#64748b",
    result: num(current),
    resultUnit: (raw.unit as string) ?? "",
    monthGoal: num(raw.month_goal),
    annualGoal: num(raw.annual_goal),
    deviationPct: num(raw.deviation_pct),
    trend: (raw.trend as KpiTrend) ?? "flat",
    status: (raw.status as KpiStatus) ?? "empty",
    stalePeriods: num(raw.stale_periods),
    isCockpit: Boolean(isCockpit),
    criticalDeviationThresholdPct: (() => {
      const v = num(raw.critical_deviation_threshold_pct)
      return v > 0 ? v : 15
    })(),
    attentionDeviationThresholdPct: (() => {
      const v = num(raw.attention_deviation_threshold_pct)
      return v > 0 ? v : 5
    })(),
  }
}

const KPI_TYPE_OPTIONS = [
  { value: "Monetário", label: "Monetário", icon: DollarSign },
  { value: "Percentual", label: "Percentual", icon: Percent },
  { value: "Quantidade", label: "Quantidade", icon: Hash },
  { value: "Índice", label: "Índice", icon: TrendingUp },
] as const

const CONSOLIDATION_OPTIONS = ["Soma", "Média", "Último valor", "Máximo"]
const FREQUENCY_OPTIONS = ["Diário", "Semanal", "Quinzenal", "Mensal", "Trimestral"]

/** Exibição única: lista, painel (olho) e formulário de edição — sempre pt-BR. */
function formatVal(value: number, unit: string, compact = false): string {
  if (!Number.isFinite(value)) return "—"
  if (unit === "R$") {
    if (Math.abs(value) >= 1_000_000) {
      const v = value / 1_000_000
      const str = v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace(".", ",")
      return `R$ ${str}M`
    }
    return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
  }
  if (unit === "%") {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
  }
  if (compact && Math.abs(value) >= 1_000) {
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
  }
  const nearInt = Math.abs(value - Math.round(value)) < 1e-9
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: nearInt ? 0 : 2,
  })
}

function formatDeviationPct(pct: number): string {
  if (!Number.isFinite(pct)) return "—"
  const sign = pct > 0 ? "+" : ""
  return `${sign}${pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function deviationColor(pct: number) {
  if (pct > 0) return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" }
  if (pct < 0) return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" }
  return { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" }
}

function TrendIcon({ trend }: { trend: KpiTrend }) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-500" />
  return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
}

function AreaGroupHeader({
  area,
  color,
  kpis,
  collapsed,
  onToggle,
}: {
  area: string
  color: string
  kpis: KpiRow[]
  collapsed: boolean
  onToggle: () => void
}) {
  const counts = {
    above: kpis.filter((k) => k.status === "above").length,
    attention: kpis.filter((k) => k.status === "attention").length,
    critical: kpis.filter((k) => k.status === "critical").length,
    empty: kpis.filter((k) => k.status === "empty").length,
  }

  return (
    <tr className="cursor-pointer select-none border-b border-border bg-muted/30 hover:bg-muted/50" onClick={onToggle}>
      <td colSpan={8} className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">{areaLabel(area)}</span>
          <div className="flex items-center gap-1.5">
            {counts.above > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-500/20">
                {counts.above}✓
              </span>
            )}
            {counts.attention > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-500/20">
                {counts.attention}△
              </span>
            )}
            {counts.critical > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-red-500/20">
                {counts.critical}✗
              </span>
            )}
            {counts.empty > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground ring-1 ring-border">
                {counts.empty}—
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center">
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

function KpiTableRow({
  kpi,
  onView,
  onEdit,
}: {
  kpi: KpiRow
  onView: () => void
  onEdit: () => void
}) {
  const dev = deviationColor(kpi.deviationPct)
  /** Meta mês = 0: usa meta anual para a barra (evita ficar vazia quando só há meta anual). */
  const progress = (() => {
    const r = kpi.result
    const m = kpi.monthGoal
    const a = kpi.annualGoal
    if (m > 0) return Math.min(100, Math.max(0, (r / m) * 100))
    if (a > 0) return Math.min(100, Math.max(0, (r / a) * 100))
    return 0
  })()
  const barColor =
    kpi.status === "above" ? "#22c55e" : kpi.status === "attention" ? "#f59e0b" : kpi.status === "critical" ? "#ef4444" : "#94a3b8"

  return (
    <tr className="group border-b border-border transition-colors hover:bg-muted/30">
      <td className="w-[36%] px-4 pt-3 pb-0 align-top">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: kpi.areaColor }} />
          <div className="min-w-0 flex-1 pb-3">
            <div className="flex items-start gap-1.5">
              <span className="text-sm font-medium leading-snug text-foreground">{kpi.name}</span>
              <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60" />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{kpi.code}</span>
              <span>·</span>
              <span>{kpi.type}</span>
              <span>·</span>
              <span>{kpi.aggregation}</span>
              <span>·</span>
              <span>{kpi.frequency}</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: barColor }} />
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-right align-middle">
        <div className="text-sm font-bold text-foreground">{formatVal(kpi.result, kpi.resultUnit)}</div>
        <div className="text-[11px] text-muted-foreground">acumulado</div>
      </td>

      <td className="px-4 py-3 text-right align-middle">
        <div className="text-sm text-foreground">{formatVal(kpi.monthGoal, kpi.resultUnit, true)}</div>
        <div className="text-[11px] text-muted-foreground">meta mês</div>
      </td>

      <td className="px-4 py-3 text-right align-middle">
        <div className="text-sm text-foreground">{formatVal(kpi.annualGoal, kpi.resultUnit, true)}</div>
        <div className="text-[11px] text-muted-foreground">meta anual</div>
      </td>

      <td className="px-4 py-3 text-right align-middle">
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums" style={{ backgroundColor: dev.bg, color: dev.text, border: `1px solid ${dev.border}` }}>
          {formatDeviationPct(kpi.deviationPct)}
        </span>
      </td>

      <td className="px-4 py-3 text-center align-middle">
        <TrendIcon trend={kpi.trend} />
      </td>

      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: kpi.ownerColor }}>
            {kpi.ownerInitials}
          </div>
          <span className="text-sm text-foreground">{kpi.ownerName}</span>
        </div>
      </td>

      <td className="px-3 py-3 align-middle">
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={(e) => { e.stopPropagation(); onView() }} title="Ver detalhes" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit() }} title="Editar KPI" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const

function ymToPeriodLabel(year: number, month0: number): string {
  return `${MONTH_SHORT[month0]} ${year}`
}

const HISTORY_FIRST_PAGE = 5

function KpiDetailPanel({
  kpi,
  onClose,
  onResultSaved,
}: {
  kpi: KpiRow | null
  onClose: () => void
  onResultSaved?: () => void
}) {
  const isOpen = !!kpi
  const [registerOpen, setRegisterOpen] = useState(false)
  const now = new Date()
  const [periodYear, setPeriodYear] = useState(now.getFullYear())
  const [periodMonth, setPeriodMonth] = useState(now.getMonth())
  const [resultInput, setResultInput] = useState("")
  const [targetInput, setTargetInput] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [evidenceNote, setEvidenceNote] = useState("")
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [savingResult, setSavingResult] = useState(false)
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [detail, setDetail] = useState<KpiDetailApi | null>(null)
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [detailRefresh, setDetailRefresh] = useState(0)

  useEffect(() => {
    setRegisterOpen(false)
    const d = new Date()
    setPeriodYear(d.getFullYear())
    setPeriodMonth(d.getMonth())
    setResultInput("")
    setTargetInput("")
    setEvidenceUrl("")
    setEvidenceNote("")
    setEvidenceFile(null)
    setHistoryExpanded(false)
    setDeleteConfirmId(null)
  }, [kpi?.id])

  useEffect(() => {
    if (!kpi?.id) {
      setDetail(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/cockpit/kpis/${kpi.id}`)
        if (!cancelled) setDetail((data ?? null) as KpiDetailApi)
      } catch {
        if (!cancelled) setDetail(null)
      }
    })()
    return () => { cancelled = true }
  }, [kpi?.id, savingResult, detailRefresh])

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: 7 }, (_, i) => y - 2 + i)
  }, [])

  async function handleSavePeriodResult() {
    if (!kpi) return
    const value = Number(String(resultInput).replace(",", "."))
    if (!Number.isFinite(value)) {
      toast.error("Informe um resultado numérico válido.")
      return
    }
    const pl = ymToPeriodLabel(periodYear, periodMonth)
    const period_start = `${periodYear}-${String(periodMonth + 1).padStart(2, "0")}-01`
    const duplicateMonth = (detail?.results ?? []).some((r) => {
      const ps = typeof r.period_start === "string" ? r.period_start.slice(0, 10) : ""
      if (ps && ps.length >= 10) {
        return ps.slice(0, 7) === period_start.slice(0, 7)
      }
      return String(r.period_label ?? "").trim().toLowerCase() === pl.trim().toLowerCase()
    })
    if (duplicateMonth) {
      toast.error("Já existe lançamento para este mês. Exclua o registro incorreto antes de criar outro.")
      return
    }
    const targetRaw = targetInput.trim()
    const target =
      targetRaw === "" ? null : Number(String(targetRaw).replace(",", "."))
    if (targetRaw !== "" && !Number.isFinite(target as number)) {
      toast.error("Meta do período inválida.")
      return
    }
    try {
      setSavingResult(true)
      const evU = evidenceUrl.trim().slice(0, 2048)
      const evN = evidenceNote.trim().slice(0, 500)
      const { data: saved } = await api.post(`/cockpit/kpis/${kpi.id}/results`, {
        period_label: pl,
        value,
        target,
        period_start,
        ...(evU ? { evidence_url: evU } : {}),
        ...(evN ? { evidence_note: evN } : {}),
      })
      if (evidenceFile && saved && typeof saved === "object" && "id" in saved && saved.id) {
        const fd = new FormData()
        fd.append("file", evidenceFile)
        await api.post(`/cockpit/kpis/${kpi.id}/results/${String(saved.id)}/attachment`, fd)
      }
      toast.success("Resultado do período registrado.")
      setRegisterOpen(false)
      setResultInput("")
      setTargetInput("")
      setEvidenceUrl("")
      setEvidenceNote("")
      setEvidenceFile(null)
      onResultSaved?.()
    } catch (e: unknown) {
      toastApiError(e, { fallback: "Erro ao registrar resultado." })
    } finally {
      setSavingResult(false)
    }
  }

  function requestDeleteResult(resultId: string) {
    setDeleteConfirmId(resultId)
  }

  async function confirmDeleteResult() {
    const resultId = deleteConfirmId
    if (!kpi?.id || !resultId) return
    try {
      setDeletingResultId(resultId)
      await api.delete(`/cockpit/kpis/${kpi.id}/results/${resultId}`)
      toast.success("Lançamento excluído.")
      setDeleteConfirmId(null)
      setDetailRefresh((n) => n + 1)
      onResultSaved?.()
    } catch (e: unknown) {
      toastApiError(e, { fallback: "Não foi possível excluir o lançamento." })
    } finally {
      setDeletingResultId(null)
    }
  }

  const historyRows = detail?.results ?? []
  const historyVisible = historyExpanded ? historyRows : historyRows.slice(0, HISTORY_FIRST_PAGE)

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/25 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[440px] flex-col overflow-hidden bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>KPIs</span>
            <span>·</span>
            <span className="font-medium" style={{ color: kpi?.areaColor }}>
              {kpi ? kpi.area.charAt(0) + kpi.area.slice(1).toLowerCase() : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            <div>
              <h2 className="mb-2.5 text-lg font-bold leading-snug text-foreground">{kpi?.name}</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-border">
                  {kpi?.code}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-border">
                  {kpi?.type}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-border">
                  {kpi?.aggregation} · {kpi?.frequency}
                </span>
                {kpi?.isCockpit && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                     No cockpit
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resultado Atual</div>
                <div className="text-xl font-bold text-primary">{kpi ? formatVal(kpi.result, kpi.resultUnit) : "—"}</div>
                <div className="text-xs text-muted-foreground">acumulado {new Date().toLocaleDateString("pt-BR", { month: "long" })}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meta do Mês</div>
                <div className="text-xl font-bold text-foreground">{kpi ? formatVal(kpi.monthGoal, kpi.resultUnit) : "—"}</div>
                <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Desvio</div>
                <div className={cn("text-xl font-bold", (kpi?.deviationPct ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                  {kpi ? formatDeviationPct(kpi.deviationPct) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">vs meta mês</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meta Anual</div>
                <div className="text-xl font-bold text-foreground">{kpi ? formatVal(kpi.annualGoal, kpi.resultUnit) : "—"}</div>
                <div className="text-xs text-muted-foreground">2026 · progresso: 26%</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setRegisterOpen((v) => !v)}
                className="w-full rounded-lg border-2 border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
              >
                + Registrar Resultado do Período
              </button>

              {registerOpen && kpi && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Mês</Label>
                      <Select
                        value={String(periodMonth)}
                        onValueChange={(v) => setPeriodMonth(Number(v))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_SHORT.map((m, i) => (
                            <SelectItem key={m} value={String(i)}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ano</Label>
                      <Select
                        value={String(periodYear)}
                        onValueChange={(v) => setPeriodYear(Number(v))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Período: <span className="font-medium text-foreground">{ymToPeriodLabel(periodYear, periodMonth)}</span>
                  </p>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Resultado</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={resultInput}
                      onChange={(e) => setResultInput(e.target.value)}
                      placeholder={kpi.resultUnit === "R$" ? "Ex.: 1250000" : "Ex.: 98,5"}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Meta do período (opcional)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      placeholder="Se vazio, usa a meta do mês do KPI"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Link de evidência (opcional)</Label>
                    <Input
                      type="url"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://… (planilha, drive, print)"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nota / referência (opcional)</Label>
                    <Input
                      value={evidenceNote}
                      onChange={(e) => setEvidenceNote(e.target.value)}
                      placeholder="Ex.: aba Resumo, linha 42"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Arquivo de evidência (opcional)</Label>
                    <Input
                      type="file"
                      className="h-9 cursor-pointer text-sm file:mr-2 file:rounded file:border file:bg-muted"
                      onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRegisterOpen(false)
                        setResultInput("")
                        setTargetInput("")
                        setEvidenceUrl("")
                        setEvidenceNote("")
                        setEvidenceFile(null)
                      }}
                      disabled={savingResult}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSavePeriodResult}
                      disabled={savingResult}
                    >
                      {savingResult ? "Salvando…" : "Registrar"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Histórico de Resultados
              </h3>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Período", "Resultado", "Meta", "Desvio", "Evidência", ""].map((h, i) => (
                        <th
                          key={`${h}-${i}`}
                          className={cn(
                            "px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                            i === 0 || i === 2 ? "text-left" : i === 3 ? "text-center" : "text-right",
                          )}
                        >
                          {h === "" ? " " : h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyVisible.map((row) => {
                      const dc = deviationColor(row.deviation_pct ?? 0)
                      return (
                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 text-sm text-foreground">{row.period_label}</td>
                          <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-foreground">
                            {kpi ? formatVal(row.value, kpi.resultUnit) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-sm tabular-nums text-muted-foreground">
                            {kpi ? formatVal(row.target, kpi.resultUnit) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold tabular-nums"
                              style={{ backgroundColor: dc.bg, color: dc.text }}
                            >
                              {formatDeviationPct(row.deviation_pct ?? 0)}
                            </span>
                          </td>
                          <td className="max-w-[120px] px-3 py-2 text-left align-top">
                            {(row.evidence_url || row.evidence_note || row.evidence_attachment_path) ? (
                              <div className="space-y-0.5">
                                {row.evidence_url ? (
                                  <a
                                    href={row.evidence_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                                  >
                                    <Paperclip className="h-3 w-3 shrink-0" />
                                    Abrir link
                                  </a>
                                ) : null}
                                {row.evidence_attachment_path ? (
                                  <a
                                    href={`/api-proxy${row.evidence_attachment_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                                  >
                                    <Paperclip className="h-3 w-3 shrink-0" />
                                    {row.evidence_file_name ?? "Anexo"}
                                  </a>
                                ) : null}
                                {row.evidence_note ? (
                                  <p className="line-clamp-2 text-xs text-muted-foreground" title={row.evidence_note}>
                                    {row.evidence_note}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="w-10 px-2 py-2 text-center">
                            <button
                              type="button"
                              title="Excluir lançamento"
                              disabled={deletingResultId === row.id}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              onClick={() => requestDeleteResult(row.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {historyRows.length > HISTORY_FIRST_PAGE ? (
                  <div className="border-t border-border bg-muted/20 px-3 py-2 text-center">
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => setHistoryExpanded((e) => !e)}
                    >
                      {historyExpanded ? "Ver menos" : `Ver mais (${historyRows.length - HISTORY_FIRST_PAGE} ocultos)`}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Rituais vinculados */}
            <div>
              <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Rituais Vinculados
              </h3>
              <div className="space-y-2">
                {(detail?.linked_rituals ?? []).map((r, i) => (
                  <div
                    key={r.id ?? i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    />
                    <span className="text-foreground">{r.name} — {r.area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico de metas (versionado) */}
            <div>
              <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Histórico de Metas (Versionado)
              </h3>
              <div className="space-y-2">
                {(detail?.goal_versions ?? []).map((h, i) => (
                  <div
                    key={h.id ?? i}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2.5 text-sm">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: h.note?.includes("alterada") ? "#16a34a" : "#94a3b8" }}
                      />
                      <div className="text-foreground">
                        <span className="font-semibold">{h.note ?? "Meta"}</span>
                        <span className="text-muted-foreground"> mensal {formatVal(h.month_goal, kpi?.resultUnit ?? "")} · anual {formatVal(h.annual_goal, kpi?.resultUnit ?? "")}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <div>{new Date(h.changed_at).toLocaleDateString("pt-BR")}</div>
                      <div>· {h.changed_by ?? "sistema"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Responsável</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: kpi?.ownerColor }}>
                  {kpi?.ownerInitials}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{kpi?.ownerName}</div>
                  <div className="text-xs text-muted-foreground">
                    Líder{" "}
                    {kpi
                      ? kpi.area.charAt(0) + kpi.area.slice(1).toLowerCase()
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro permanece no banco para auditoria (data e responsável pela exclusão).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingResultId !== null}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingResultId !== null}
              onClick={() => void confirmDeleteResult()}
            >
              {deletingResultId ? "Excluindo…" : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function NovoKpiDialog({
  open,
  onClose,
  initial,
  onSubmit,
  rituals,
}: {
  open: boolean
  onClose: () => void
  initial: Partial<KpiRow> | null
  onSubmit: (patch: Partial<KpiRow>) => void | Promise<void>
  rituals: RitualOption[]
}) {
  const DEFAULT_UNITS = useMemo(() => ({
    Monetário: "R$",
    Percentual: "%",
    Quantidade: "un",
    Índice: "pts",
  }), [])

  function parsePtNumber(raw: string): number {
    const s = (raw ?? "").trim()
    if (!s) return 0
    // remove thousands separators and normalize decimal comma
    const cleaned = s.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }

  function formatInputForUnit(raw: string, u: string): string {
    const s = (raw ?? "").trim()
    if (!s) return ""

    // keep only digits (and one comma) for percent/others
    if (u === "%") {
      // allow one comma as decimal separator, max 2 decimals
      const only = s.replace(/[^\d,]/g, "")
      const parts = only.split(",")
      const intPart = parts[0] ?? ""
      const decPart = (parts[1] ?? "").slice(0, 2)
      return decPart ? `${intPart},${decPart}` : intPart
    }

    // Monetary and general numeric: format as pt-BR integer (no decimals)
    const digits = s.replace(/[^\d]/g, "")
    if (!digits) return ""
    const n = Number(digits)
    if (!Number.isFinite(n)) return ""
    return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
  }

  const [selectedType, setSelectedType] = useState(initial?.type ?? "Monetário")
  const [isCockpit, setIsCockpit] = useState(initial?.isCockpit ?? true)
  const [name, setName] = useState(initial?.name ?? "")
  const [code, setCode] = useState(initial?.code ?? "")
  const [area, setArea] = useState(initial?.area ?? "")
  const [unit, setUnit] = useState(initial?.resultUnit ?? "R$")
  const [freq, setFreq] = useState(initial?.frequency ?? "Semanal")
  const [aggregation, setAggregation] = useState(initial?.aggregation ?? "Soma")
  const [owner, setOwner] = useState(initial?.ownerName ?? "")
  const [ritualId, setRitualId] = useState<string | null>(initial?.ritualId ?? null)
  const [annualGoal, setAnnualGoal] = useState(String(initial?.annualGoal ?? 0))
  const [monthGoal, setMonthGoal] = useState(String(initial?.monthGoal ?? 0))
  const [criticalThreshold, setCriticalThreshold] = useState(String(initial?.criticalDeviationThresholdPct ?? 15))
  const [attentionThreshold, setAttentionThreshold] = useState(String(initial?.attentionDeviationThresholdPct ?? 5))
  const [description, setDescription] = useState("")

  /** useState(initial) só roda na 1ª montagem; ao abrir "Editar" precisamos hidratar de novo. */
  useEffect(() => {
    if (!open) return
    const i = initial
    if (!i?.id) {
      setSelectedType("Monetário")
      setIsCockpit(true)
      setName("")
      setCode("")
      setArea("")
      setUnit("R$")
      setFreq("Semanal")
      setAggregation("Soma")
      setOwner("")
      setRitualId(null)
      setAnnualGoal("0")
      setMonthGoal("")
      setCriticalThreshold("15")
      setAttentionThreshold("5")
      setDescription("")
      return
    }
    const u = i.resultUnit?.trim() || "R$"
    setSelectedType(i.type ?? "Monetário")
    setIsCockpit(i.isCockpit ?? true)
    setName(i.name ?? "")
    setCode(i.code ?? "")
    setArea(i.area ?? "")
    setUnit(u)
    setFreq(i.frequency ?? "Semanal")
    setAggregation(i.aggregation ?? "Soma")
    setOwner(i.ownerName ?? "")
    setRitualId(i.ritualId ?? null)
    const ag = i.annualGoal ?? 0
    const mg = i.monthGoal ?? 0
    setAnnualGoal(formatInputForUnit(String(ag).replace(".", ","), u) || (ag === 0 ? "0" : String(ag)))
    setMonthGoal(mg === 0 ? "" : (formatInputForUnit(String(mg).replace(".", ","), u) || String(mg)))
    setCriticalThreshold(String(i.criticalDeviationThresholdPct ?? 15))
    setAttentionThreshold(String(i.attentionDeviationThresholdPct ?? 5))
  }, [open, initial])

  useEffect(() => {
    const suggested = DEFAULT_UNITS[selectedType as keyof typeof DEFAULT_UNITS] ?? ""
    // auto-ajusta somente se o usuário ainda não personalizou a unidade
    const isDefaultish = unit.trim() === "" || Object.values(DEFAULT_UNITS).includes(unit)
    if (suggested && isDefaultish && unit !== suggested) setUnit(suggested)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  const goalsPreview = useMemo(() => {
    const a = parsePtNumber(String(annualGoal))
    const m = parsePtNumber(String(monthGoal))
    const fmt = (v: number) => (Number.isFinite(v) ? formatVal(v, unit) : "—")
    return {
      annual: fmt(a),
      month: monthGoal.trim() ? fmt(m) : null,
    }
  }, [annualGoal, monthGoal, unit])

  const B = "border-gray-300 dark:border-zinc-600"
  const I = `h-8 text-sm ${B}`
  const S = `h-8 text-sm ${B} [&>span]:text-sm`

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <SheetTitle className="sr-only">{initial?.id ? "Editar KPI" : "Novo KPI"}</SheetTitle>
        <SheetDescription className="sr-only">Formulário para criar ou editar um KPI</SheetDescription>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground">
            {initial?.id ? "Editar KPI" : "Novo KPI"}
          </span>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Nome <span className="text-destructive">*</span></label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: TPV — Total de Pagamentos Validados" className={I} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Código de referência</label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="#206" className={`${I} font-mono`} />
                <p className="text-[11px] text-muted-foreground">Ref. numérica da planilha atual</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Área <span className="text-destructive">*</span></label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className={S}><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    {COCKPIT_AREAS.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>{areaLabel(a.slug)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Tipo de dado <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-4 gap-1.5">
                {KPI_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setSelectedType(value)}
                    className={cn("flex flex-col items-center gap-1 rounded-md border py-2 text-[11px] font-semibold transition-all focus:outline-none",
                      selectedType === value ? "border-primary bg-primary/10 text-primary" : "border-gray-300 text-muted-foreground hover:border-primary/40 hover:bg-muted/50 dark:border-zinc-600"
                    )}>
                    <Icon className={cn("h-4 w-4", selectedType === value ? "text-primary" : "text-muted-foreground")} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Unidade <span className="text-destructive">*</span></label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={DEFAULT_UNITS[selectedType as keyof typeof DEFAULT_UNITS] ?? "Ex: R$, %, pts, unidades…"}
                  className={I}
                />
                <p className="text-[11px] text-muted-foreground">
                  Sugestão para {selectedType.toLowerCase()}: <span className="font-semibold text-foreground">{DEFAULT_UNITS[selectedType as keyof typeof DEFAULT_UNITS] ?? "—"}</span>
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Frequência de input <span className="text-destructive">*</span></label>
                <Select value={freq} onValueChange={setFreq}>
                  <SelectTrigger className={S}><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCY_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Lógica de consolidação <span className="text-destructive">*</span></label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger className={S}><SelectValue /></SelectTrigger>
                <SelectContent>{CONSOLIDATION_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Define como o resultado anual é calculado a partir dos registros periódicos</p>
            </div>

            <p className="pt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Metas</p>
            <div className="-mt-2 border-b border-border" />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Meta Anual <span className="text-destructive">*</span></label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={annualGoal}
                  onChange={(e) => setAnnualGoal(formatInputForUnit(e.target.value, unit))}
                  placeholder={unit === "R$" ? "Ex: 48000000" : unit === "%" ? "Ex: 98,5" : "Ex: 1200"}
                  className={`${I} font-mono`}
                />
                <p className="text-[11px] text-muted-foreground">Prévia: <span className="font-semibold text-foreground">{goalsPreview.annual}</span></p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Meta do Mês atual</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={monthGoal}
                  onChange={(e) => setMonthGoal(formatInputForUnit(e.target.value, unit))}
                  placeholder={unit === "R$" ? "Ex: 4000000 (opcional)" : unit === "%" ? "Ex: 8,2 (opcional)" : "Ex: 300 (opcional)"}
                  className={`${I} font-mono`}
                />
                <p className="text-[11px] text-muted-foreground">Opcional — se vazio, calculada pela meta anual</p>
                {goalsPreview.month && (
                  <p className="text-[11px] text-muted-foreground">Prévia: <span className="font-semibold text-foreground">{goalsPreview.month}</span></p>
                )}
              </div>
            </div>

            <p className="pt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Configurações</p>
            <div className="-mt-2 border-b border-border" />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Responsável <span className="text-destructive">*</span></label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Ex: Evandro Silva" className={I} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Rituais vinculados</label>
                <Select value={ritualId ?? "none"} onValueChange={(v) => setRitualId(v === "none" ? null : v)}>
                  <SelectTrigger className={S}><SelectValue placeholder="Selecionar ritual…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {rituals.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label htmlFor="kpi-cockpit" className="flex cursor-pointer items-start gap-2.5 rounded-md border border-gray-300 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40 dark:border-zinc-600">
              <input id="kpi-cockpit" type="checkbox" checked={isCockpit} onChange={(e) => setIsCockpit(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded accent-primary" />
              <div>
                <div className="text-xs font-medium text-foreground">Visível no Cockpit Estratégico</div>
                <div className="text-[11px] text-muted-foreground">KPIs marcados aparecem no painel consolidado dos sócios</div>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Limite atenção (%)</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={attentionThreshold}
                  onChange={(e) => setAttentionThreshold(e.target.value.replace(/[^\d,.]/g, ""))}
                  placeholder="5"
                  className={`${I} font-mono max-w-[120px]`}
                />
                <p className="text-[11px] text-muted-foreground">
                  Corte “leve” (padrão 5%): desvios entre este valor e o crítico entram em atenção; acima disso (ainda negativo) pode contar como ok leve.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Limite crítico (%)</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(e.target.value.replace(/[^\d,.]/g, ""))}
                  placeholder="15"
                  className={`${I} font-mono max-w-[120px]`}
                />
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Crítico</span> se pior que{" "}
                  <span className="font-mono">-{parsePtNumber(criticalThreshold) || 15}%</span> vs meta. Faixas intermediárias usam também o limite de atenção.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Descrição / Metodologia</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="Explique o que este indicador mede, como é calculado e por que é relevante…"
                className="w-full resize-y rounded-md border border-gray-300 bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gray-500 focus:ring-1 focus:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant="default"
            className="gap-1.5"
            onClick={async () => {
              const patch: Partial<KpiRow> = {
                name,
                code,
                area,
                areaColor: areaColor(area),
                type: selectedType,
                aggregation,
                frequency: freq,
                ownerName: owner,
                ownerInitials: (owner.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("") || "??").toUpperCase(),
                ownerColor: initial?.ownerColor ?? "#16a34a",
                resultUnit: unit,
                annualGoal: parsePtNumber(String(annualGoal)),
                monthGoal: parsePtNumber(String(monthGoal)),
                isCockpit,
                criticalDeviationThresholdPct: Math.min(100, Math.max(0.1, parsePtNumber(String(criticalThreshold)) || 15)),
                attentionDeviationThresholdPct: Math.min(
                  100,
                  Math.max(0.1, parsePtNumber(String(attentionThreshold)) || 5),
                ),
                ritualId,
              }
              try {
                await Promise.resolve(onSubmit(patch))
                onClose()
              } catch {
                /* erro tratado no pai */
              }
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {initial?.id ? "Salvar" : "Criar KPI"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function KpisPageInner() {
  const searchParams = useSearchParams()
  const [q, setQ] = useState("")
  const [filterArea, setFilterArea] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState<"all" | KpiStatus>("all")
  const [period, setPeriod] = useState<"mes" | "semana" | "ano">("mes")
  const [onlyCockpit, setOnlyCockpit] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [selectedKpi, setSelectedKpi] = useState<KpiRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<KpiRow | null>(null)
  const [rows, setRows] = useState<KpiRow[]>([])
  const [loading, setLoading] = useState(true)
  const [ritualOptions, setRitualOptions] = useState<RitualOption[]>([])

  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/cockpit/kpis")
      const list = Array.isArray(data) ? data : data?.data ?? []
      setRows(list.map(normalizeKpi))
    } catch (err) {
      console.error("Erro ao carregar KPIs:", err)
      toastApiError(err, { fallback: "Erro ao carregar KPIs." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKpis() }, [fetchKpis])

  useEffect(() => {
    const st = searchParams.get("status")
    if (st === "critical" || st === "attention" || st === "above" || st === "empty") {
      setFilterStatus(st as KpiStatus)
    }
  }, [searchParams])

  /** Mantém o painel lateral alinhado à lista após POST de resultado (fetchKpis atualiza `rows`). */
  useEffect(() => {
    setSelectedKpi((prev) => {
      if (!prev) return prev
      const u = rows.find((r) => r.id === prev.id)
      return u ?? prev
    })
  }, [rows])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/rituals", { params: { status: "active" } })
        const list = Array.isArray(data) ? data : data?.data ?? []
        const mapped: RitualOption[] = list
          .map((r: unknown) => {
            if (!r || typeof r !== "object") return null
            const o = r as Record<string, unknown>
            return { id: String(o.id ?? ""), name: String(o.name ?? "") }
          })
          .filter((r: RitualOption | null): r is RitualOption => r !== null && Boolean(r.id && r.name))
        if (!cancelled) setRitualOptions(mapped)
      } catch {
        if (!cancelled) setRitualOptions([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((k) => {
      if (onlyCockpit && !k.isCockpit) return false
      if (filterArea !== "all" && k.area !== filterArea) return false
      if (filterType !== "all" && k.type !== filterType) return false
      if (filterStatus !== "all" && k.status !== filterStatus) return false
      if (q.trim()) {
        const lq = q.toLowerCase()
        if (!k.name.toLowerCase().includes(lq) && !k.code.toLowerCase().includes(lq)) return false
      }
      return true
    })
  }, [q, filterArea, filterType, filterStatus, onlyCockpit, rows])

  const summary = useMemo(() => ({
    above: filtered.filter((k) => k.status === "above").length,
    attention: filtered.filter((k) => k.status === "attention").length,
    critical: filtered.filter((k) => k.status === "critical").length,
    empty: filtered.filter((k) => k.status === "empty").length,
  }), [filtered])

  const groupedAreas = useMemo(() => {
    const seen: string[] = []
    filtered.forEach((k) => { if (!seen.includes(k.area)) seen.push(k.area) })
    return seen.map((area) => ({
      area,
      color: areaColor(area),
      kpis: filtered.filter((k) => k.area === area),
    }))
  }, [filtered])

  const summaryCards = [
    { label: "ATINGINDO META", value: summary.above, color: "#22c55e", Icon: CheckCircle2 },
    { label: "EM ATENÇÃO", value: summary.attention, color: "#f59e0b", Icon: AlertTriangle },
    { label: "CRÍTICO", value: summary.critical, color: "#ef4444", Icon: XCircle },
    { label: "SEM ATUALIZAÇÃO", value: summary.empty, color: "#94a3b8", Icon: RefreshCw },
  ]

  function toggleArea(area: string) {
    setCollapsed((prev) => ({ ...prev, [area]: !prev[area] }))
  }

  function handleExport() {
    const headers = ["Código", "Nome", "Área", "Tipo", "Resultado", "Meta Mês", "Meta Anual", "Desvio %", "Tendência", "Responsável"]
    const rows = filtered.map((k) => [k.code, `"${k.name}"`, k.area, k.type, k.result, k.monthGoal, k.annualGoal, k.deviationPct, k.trend, k.ownerName])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kpis-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        title="Gestão de KPIs"
        description={`${filtered.length} indicadores ativos em ${groupedAreas.length} áreas`}
        actions={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditing(null)
                setCreateOpen(true)
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Novo KPI
            </Button>
          </div>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {summaryCards.map((c) => (
            <Card key={c.label} className="bg-card border-border">
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

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar KPI por nome ou código..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 text-sm" />
            </div>

            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-full text-sm sm:w-[160px]">
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {COCKPIT_AREAS.map((a) => (
                  <SelectItem key={a.slug} value={a.slug}>
                    {areaLabel(a.slug)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full text-sm sm:w-[150px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {KPI_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as "all" | KpiStatus)}
            >
              <SelectTrigger className="w-full text-sm sm:w-[160px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(KPI_STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
              {(["mes", "semana", "ano"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                    period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "mes" ? "Mês atual" : p === "semana" ? "Semana" : "Ano"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch id="cockpit-toggle" checked={onlyCockpit} onCheckedChange={setOnlyCockpit} />
              <Label htmlFor="cockpit-toggle" className="cursor-pointer text-sm text-muted-foreground">
                Apenas cockpit
              </Label>
            </div>
          </div>
          </CardContent>
        </Card>

        <div className="overflow-x-auto rounded-lg border border-border [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Indicador ↑</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resultado</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Meta Mês</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Meta Anual</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Desvio</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tend.</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Responsável</th>
                <th className="w-[72px] px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="bg-card">
              {groupedAreas.map(({ area, color, kpis }) => (
                <Fragment key={area}>
                  <AreaGroupHeader
                    key={`h-${area}`}
                    area={area}
                    color={color}
                    kpis={kpis}
                    collapsed={!!collapsed[area]}
                    onToggle={() => toggleArea(area)}
                  />
                  {!collapsed[area] && kpis.map((kpi) => (
                    <KpiTableRow
                      key={kpi.id}
                      kpi={kpi}
                      onView={() => setSelectedKpi(kpi)}
                      onEdit={() => { setEditing(kpi); setCreateOpen(true) }}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <KpiDetailPanel
        kpi={selectedKpi}
        onClose={() => setSelectedKpi(null)}
        onResultSaved={fetchKpis}
      />
      <NovoKpiDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditing(null) }}
        initial={editing}
        rituals={ritualOptions}
        onSubmit={async (patch) => {
          const name = patch.name?.trim() ?? ""
          const area = patch.area?.trim() ?? ""
          const ownerName = patch.ownerName?.trim() ?? ""
          if (!name) {
            toast.error("Informe o nome do KPI.")
            throw new Error("validação")
          }
          if (!area) {
            toast.error("Selecione a área do KPI.")
            throw new Error("validação")
          }
          if (!ownerName) {
            toast.error("Informe o responsável do KPI.")
            throw new Error("validação")
          }
          const body = buildCreateKpiBody({
            name,
            code: patch.code?.trim() || null,
            area,
            kpiType: patch.type ?? "Monetário",
            unit: patch.resultUnit ?? "",
            inputFrequency: patch.frequency ?? "Semanal",
            aggregation: patch.aggregation ?? "Soma",
            monthGoal: patch.monthGoal ?? 0,
            annualGoal: patch.annualGoal ?? 0,
            ownerName,
            isCockpit: !!patch.isCockpit,
            ritualId: patch.ritualId ?? null,
            criticalDeviationThresholdPct: patch.criticalDeviationThresholdPct ?? 15,
            attentionDeviationThresholdPct: patch.attentionDeviationThresholdPct ?? 5,
          })
          try {
            if (editing?.id) {
              await api.put(`/cockpit/kpis/${editing.id}`, body)
              toast.success("KPI atualizado.")
            } else {
              await api.post("/cockpit/kpis", body)
              toast.success("KPI criado.")
            }
            await fetchKpis()
            setEditing(null)
          } catch (e: unknown) {
            toastApiError(e, { fallback: "Erro ao salvar KPI." })
            throw e
          }
        }}
      />
    </>
  )
}

export default function KpisPage() {
  return (
    <Suspense fallback={<main className={COCKPIT_MAIN_CLASS}><p className="p-6 text-sm text-muted-foreground">Carregando KPIs…</p></main>}>
      <KpisPageInner />
    </Suspense>
  )
}

