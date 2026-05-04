"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Pencil,
  MoreVertical,
  Trash2,
  Copy,
  Mic,
  MicOff,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Download,
  User,
  Clock,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type AreaKey =
  | "COMERCIAL"
  | "MARKETING"
  | "FINANCEIRO"
  | "TECNOLOGIA"
  | "OPERACIONAL"
  | "ESTRATEGICO"

type FreqKey = "DAILY" | "SEMANAL" | "QUINZENAL" | "MENSAL" | "ESTRATEGICO"

type RecordState = "idle" | "recording" | "generating" | "done"

interface Participant {
  initials: string
  color: string
}

interface RitualCard {
  id: string
  name: string
  freq: FreqKey
  area: AreaKey
  owner: string
  schedule: string
  durationMin: number
  kpiCount: number
  tracked: number
  total: number
  trackingLabel: string
  participants: Participant[]
  extraParticipants: number
  nextLabel: string
  isToday: boolean
  todayTime?: string
  isNotTracked: boolean
  notTrackedDate?: string
  active: boolean
}

// ─── Ata types ────────────────────────────────────────────────────────────────

interface AtaKpi {
  id: number
  name: string
  metric: string
  goal: string
  unit: string
  selected: boolean
}

interface AtaAction {
  id: number
  title: string
  owner: string
  dueDate: string
  selected: boolean
}

interface AtaContent {
  ritualId: number | string
  ritualName: string
  date: string
  duration: string
  participants: string[]
  transcription: string
  topics: string[]
  decisions: string[]
  actions: AtaAction[]
  kpis: AtaKpi[]
}

// ─── Mock people palette ──────────────────────────────────────────────────────

const PEOPLE: Record<string, string> = {
  EV: "#16a34a", AL: "#7c3aed", MA: "#2563eb", PE: "#ea580c",
  CA: "#0d9488", JA: "#1e40af", LE: "#d97706", IN: "#374151",
  VI: "#db2777", FE: "#dc2626", AN: "#6d28d9", RI: "#0369a1", JO: "#15803d",
}
const p = (initials: string): Participant => ({ initials, color: PEOPLE[initials] ?? "#64748b" })

// ─── Area metadata ────────────────────────────────────────────────────────────

const AREA_META: Record<AreaKey, { label: string; dot: string }> = {
  COMERCIAL:   { label: "Comercial",   dot: "#22c55e" },
  MARKETING:   { label: "Marketing",   dot: "#db2777" },
  FINANCEIRO:  { label: "Financeiro",  dot: "#f97316" },
  TECNOLOGIA:  { label: "Tecnologia",  dot: "#7b61ff" },
  OPERACIONAL: { label: "Operações",   dot: "#00d4ff" },
  ESTRATEGICO: { label: "Estratégico", dot: "#0d9488" },
}

const FREQ_LABEL: Record<FreqKey, string> = {
  DAILY: "Daily", SEMANAL: "Semanal", QUINZENAL: "Quinzenal", MENSAL: "Mensal",
  ESTRATEGICO: "Estratégico",
}

// ─── Mock ata generator ───────────────────────────────────────────────────────

function generateAta(ritual: RitualCard): AtaContent {
  const participantNames = ritual.participants.map((pt) => {
    const names: Record<string, string> = {
      EV: "Evandro", AL: "Alexandre", MA: "Mateus", PE: "Pedro",
      CA: "Cairo", JA: "João Arantes", LE: "Leonardo", IN: "Ines",
      VI: "Vinícius", FE: "Felipe", AN: "André", RI: "Ricardo", JO: "José Pedro",
    }
    return names[pt.initials] ?? pt.initials
  })

  return {
    ritualId: ritual.id,
    ritualName: ritual.name,
    date: "27/03/2026",
    duration: `${ritual.durationMin} min`,
    participants: participantNames.slice(0, 4),
    transcription: `[09:02] ${participantNames[0] ?? "Responsável"}: Iniciando a reunião.\n\n[09:10] ${participantNames[1] ?? "Participante"}: Revisão dos indicadores da semana.\n\n[09:25] ${participantNames[0] ?? "Responsável"}: Encaminhamentos definidos. Próxima reunião confirmada.`,
    topics: ["Revisão de indicadores", "Impedimentos e bloqueios", "Próximos passos"],
    decisions: ["Definir responsáveis pelas ações", "Confirmar data da próxima sessão"],
    actions: [
      { id: 1, title: "Acompanhar métricas até próxima reunião", owner: participantNames[0] ?? "Responsável", dueDate: "30/04/2026", selected: true },
    ],
    kpis: [
      { id: 1, name: "Indicador Principal", metric: "Métrica de acompanhamento", goal: "100", unit: "%", selected: true },
    ],
  }
}

// ─── API normalizer ───────────────────────────────────────────────────────────

const FREQ_MAP: Record<string, FreqKey> = {
  daily: "DAILY", weekly: "SEMANAL", biweekly: "QUINZENAL",
  monthly: "MENSAL", estrategico: "ESTRATEGICO", strategic: "ESTRATEGICO",
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

function parseScheduleParts(schedule: string, fallbackTime?: string): { dow: number; hour: number; minute: number } | null {
  const sched = (schedule ?? "").trim()
  if (!sched) return null
  const parts = sched.split("·").map((s) => s.trim())
  const dayPart = stripAccents(parts[0] ?? "")
  const timePart = (parts[1] ?? fallbackTime ?? "09:00").trim()
  const dayPrefixes: [string, number][] = [
    ["domingo", 0], ["segunda", 1], ["terca", 2], ["quarta", 3],
    ["quinta", 4], ["sexta", 5], ["sabado", 6],
  ]
  let dow: number | undefined
  for (const [prefix, d] of dayPrefixes) {
    if (dayPart.startsWith(prefix)) { dow = d; break }
  }
  if (dow === undefined) return null
  const tm = timePart.match(/^(\d{1,2}):(\d{2})/)
  return { dow, hour: tm ? parseInt(tm[1], 10) : 9, minute: tm ? parseInt(tm[2], 10) : 0 }
}

function pad2(n: number): string { return String(n).padStart(2, "0") }
function sameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function nextWeeklyOccurrence(dow: number, hour: number, minute: number, now: Date): Date {
  const result = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  let delta = (dow - result.getDay() + 7) % 7
  if (delta === 0 && result.getTime() <= now.getTime()) delta = 7
  result.setDate(result.getDate() + delta)
  return result
}

function nextBusinessMorning(hour: number, minute: number, now: Date): Date {
  for (let add = 0; add < 14; add++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add, hour, minute, 0, 0)
    const day = d.getDay()
    if (day >= 1 && day <= 5 && d.getTime() > now.getTime()) return d
  }
  return nextWeeklyOccurrence(1, hour, minute, now)
}

function nextMonthlyOnWeekday(dow: number, hour: number, minute: number, now: Date): Date {
  const firstDowInMonth = (y: number, mo: number) => {
    const d = new Date(y, mo, 1, hour, minute, 0, 0)
    while (d.getMonth() === mo && d.getDay() !== dow) d.setDate(d.getDate() + 1)
    return d.getMonth() === mo ? d : null
  }
  let y = now.getFullYear(), mo = now.getMonth()
  let c = firstDowInMonth(y, mo)
  if (c && c.getTime() > now.getTime()) return c
  mo += 1
  if (mo > 11) { mo = 0; y += 1 }
  c = firstDowInMonth(y, mo)
  return c ?? nextWeeklyOccurrence(dow, hour, minute, now)
}

function computeNextOccurrenceDate(freq: FreqKey, parsed: { dow: number; hour: number; minute: number }, now: Date): Date | null {
  const { dow, hour, minute } = parsed
  switch (freq) {
    case "DAILY": return nextBusinessMorning(hour, minute, now)
    case "SEMANAL": case "QUINZENAL": return nextWeeklyOccurrence(dow, hour, minute, now)
    case "MENSAL": return nextMonthlyOnWeekday(dow, hour, minute, now)
    default: return nextWeeklyOccurrence(dow, hour, minute, now)
  }
}

function timeDisplayString(parsed: { hour: number; minute: number } | null, startTime?: string): string {
  const t = (startTime ?? "").trim()
  if (/^\d{1,2}:\d{2}/.test(t)) return t.slice(0, 5)
  if (parsed) return `${pad2(parsed.hour)}:${pad2(parsed.minute)}`
  return "09:00"
}

function normalizeRitual(raw: Record<string, unknown>): RitualCard {
  const participants = (Array.isArray(raw.participants) ? raw.participants : []) as Participant[]
  const freq = FREQ_MAP[(raw.freq as string)?.toLowerCase()] ?? FREQ_MAP[(raw.frequency as string)?.toLowerCase()] ?? (raw.freq as FreqKey) ?? "SEMANAL"
  const nextDateRaw = raw.next_date as string | undefined
  const startTime = raw.start_time as string | undefined
  const scheduleStr = (raw.schedule as string) ?? ""
  const parsed = parseScheduleParts(scheduleStr, startTime)
  let effectiveNext: Date | null = null
  if (nextDateRaw) {
    const d = new Date(nextDateRaw)
    if (!Number.isNaN(d.getTime())) effectiveNext = d
  }
  if (!effectiveNext && parsed) effectiveNext = computeNextOccurrenceDate(freq, parsed, new Date())
  const timeDisp = timeDisplayString(parsed, startTime)
  let nextLabel = "—"
  let isTodayFlag = false
  if (effectiveNext) {
    isTodayFlag = sameCalendarDay(effectiveNext, new Date())
    if (isTodayFlag) {
      nextLabel = `Hoje ${timeDisp}`
    } else {
      nextLabel = `Próx: ${pad2(effectiveNext.getDate())}/${pad2(effectiveNext.getMonth() + 1)}`
      if (effectiveNext.getFullYear() !== new Date().getFullYear()) nextLabel += `/${effectiveNext.getFullYear()}`
    }
  } else if (!parsed) {
    nextLabel = freq === "ESTRATEGICO" ? "Sob demanda" : "—"
  }
  const tracked = (raw.tracked_sessions as number) ?? (raw.tracked_count as number) ?? 0
  const total = (raw.total_sessions as number) ?? (raw.total_count as number) ?? 0
  const refDate = effectiveNext ?? (nextDateRaw ? new Date(nextDateRaw) : undefined)
  return {
    id: String(raw.id ?? ""),
    name: (raw.name as string) ?? "",
    freq,
    area: (raw.area as AreaKey) ?? "COMERCIAL",
    owner: (raw.owner_name as string) ?? "",
    schedule: scheduleStr,
    durationMin: (raw.duration_min as number) ?? (raw.duration_minutes as number) ?? 60,
    kpiCount: (raw.kpi_count as number) ?? 0,
    tracked, total, trackingLabel: "rastreadas",
    participants,
    extraParticipants: Math.max(0, participants.length - 4),
    nextLabel, isToday: isTodayFlag,
    todayTime: isTodayFlag ? timeDisp : undefined,
    isNotTracked: tracked === 0 && total > 0,
    notTrackedDate: tracked === 0 && total > 0 && refDate && !Number.isNaN(refDate.getTime())
      ? `${pad2(refDate.getDate())}/${pad2(refDate.getMonth() + 1)}`
      : undefined,
    active: (raw.is_active as boolean) ?? true,
  }
}

// ─── Area tabs ────────────────────────────────────────────────────────────────

const AREA_TABS: { key: AreaKey | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "COMERCIAL", label: "Comercial" },
  { key: "OPERACIONAL", label: "Operações" },
  { key: "FINANCEIRO", label: "Financeiro" },
  { key: "MARKETING", label: "Marketing" },
  { key: "TECNOLOGIA", label: "Tecnologia" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RituaisPage() {
  const [rituals, setRituals] = useState<RitualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeArea, setActiveArea] = useState<AreaKey | "ALL">("ALL")

  const [recordStates, setRecordStates] = useState<Record<string, RecordState>>({})
  const [atas, setAtas] = useState<Record<string, AtaContent>>({})
  const [openAtaId, setOpenAtaId] = useState<string | number | null>(null)

  const fetchRituals = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/cockpit/rituals", { params: { status: "all" } })
      const list = Array.isArray(data) ? data : data?.data ?? []
      setRituals(list.map(normalizeRitual))
    } catch (err) {
      console.error("Erro ao carregar rituais:", err)
      toastApiError(err, { fallback: "Erro ao carregar rituais." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRituals() }, [fetchRituals])

  const filtered = useMemo(() => {
    return rituals.filter((r) => {
      const bySearch = search.trim() === "" || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase())
      const byArea = activeArea === "ALL" || r.area === activeArea
      return bySearch && byArea && r.active
    })
  }, [rituals, search, activeArea])

  const liveCount = rituals.filter((r) => r.isToday && r.active).length

  function startRecording(id: string) {
    setRecordStates((s) => ({ ...s, [id]: "recording" }))
  }
  function stopRecording(id: string, ritual: RitualCard) {
    setRecordStates((s) => ({ ...s, [id]: "generating" }))
    setTimeout(() => {
      const ata = generateAta(ritual)
      setAtas((a) => ({ ...a, [id]: ata }))
      setRecordStates((s) => ({ ...s, [id]: "done" }))
    }, 2200)
  }

  async function duplicate(ritual: RitualCard) {
    try {
      await api.post(`/cockpit/rituals/${ritual.id}/duplicate`)
      toast.success("Ritual duplicado.")
      void fetchRituals()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao duplicar ritual." })
    }
  }

  async function toggleActive(r: RitualCard) {
    try {
      if (r.active) await api.patch(`/cockpit/rituals/${r.id}/archive`)
      else await api.patch(`/cockpit/rituals/${r.id}/reactivate`)
      toast.success(r.active ? "Ritual arquivado." : "Ritual reativado.")
      void fetchRituals()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao alterar status do ritual." })
    }
  }

  return (
    <>
      <style>{`
        /* ── Topbar ── */
        .rt-topbar {
          background: var(--rf-bg-surface, #fff);
          border-bottom: 1px solid var(--rf-border-subtle, rgba(0,0,0,0.05));
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .rt-topbar-left { display: flex; align-items: center; gap: 12px; }
        .rt-page-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px;
          font-weight: 600;
          color: var(--rf-text-primary, #0d0f14);
          letter-spacing: -0.2px;
        }
        .rt-page-sub { font-size: 12px; color: var(--rf-text-secondary, #5a6478); margin-top: 3px; }
        .rt-btn-new {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 12px;
          background: var(--rf-accent, #7b61ff);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(123,97,255,0.35);
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .rt-btn-new:hover { background: var(--rf-accent-hover, #9178ff); }
        .rt-btn-new:active { transform: scale(0.97); }

        /* ── Search bar ── */
        .rt-search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--rf-border-subtle, rgba(0,0,0,0.05));
          background: var(--rf-bg-surface, #fff);
        }
        .rt-search-wrap { flex: 1; position: relative; }
        .rt-search-input {
          width: 100%;
          background: var(--rf-bg-elevated, #f8f9fb);
          border: 1px solid var(--rf-border-default, rgba(0,0,0,0.09));
          border-radius: 12px;
          padding: 10px 14px 10px 38px;
          color: var(--rf-text-primary);
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 14px;
          outline: none;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        .rt-search-input:focus { border-color: var(--rf-accent); box-shadow: 0 0 0 3px var(--rf-accent-soft, rgba(123,97,255,0.12)); }
        .rt-search-input::placeholder { color: var(--rf-text-muted); }
        .rt-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--rf-text-muted); pointer-events: none;
        }
        .rt-filter-chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
        .rt-filter-chips::-webkit-scrollbar { display: none; }
        .rt-fchip {
          flex-shrink: 0;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          font-size: 12px;
          font-weight: 600;
          color: var(--rf-text-secondary);
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        .rt-fchip.active, .rt-fchip:hover {
          background: var(--rf-accent-soft, rgba(123,97,255,0.12));
          color: var(--rf-accent, #7b61ff);
          border-color: var(--rf-accent-border, rgba(123,97,255,0.28));
        }
        .rt-fchip.active { background: var(--rf-accent-soft); }

        /* ── Content ── */
        .rt-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .rt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .rt-grid { grid-template-columns: 1fr; } }

        /* ── Card ── */
        .rt-card {
          background: var(--rf-bg-surface, #fff);
          border: 1px solid var(--rf-border-default, rgba(0,0,0,0.09));
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .rt-card:hover {
          border-color: var(--rf-border-strong, rgba(0,0,0,0.15));
          transform: translateY(-1px);
          box-shadow: var(--rf-shadow-md, 0 4px 20px rgba(0,0,0,0.08));
        }
        .rt-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--rt-bar, var(--rf-accent));
        }
        .rt-card-live {
          border-color: rgba(123,97,255,0.28);
          box-shadow: 0 0 0 1px rgba(123,97,255,0.28), var(--rf-shadow-md, 0 4px 20px rgba(0,0,0,0.08));
        }
        .rt-card-inactive { opacity: 0.55; }

        /* Card header */
        .rt-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .rt-area {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--rf-text-muted, #aab0bd);
        }
        .rt-area-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .rt-freq {
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          background: var(--rf-bg-overlay, #eceef2);
          color: var(--rf-text-secondary, #5a6478);
          border: 1px solid var(--rf-border-subtle);
        }
        .rt-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 9999px;
          background: rgba(34,197,94,0.10);
          border: 1px solid rgba(34,197,94,0.25);
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
        }
        .rt-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: rt-pulse 1.4s infinite;
          flex-shrink: 0;
        }
        @keyframes rt-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        /* Card title */
        .rt-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 16px;
          font-weight: 700;
          color: var(--rf-text-primary, #0d0f14);
          margin-bottom: 12px;
          line-height: 1.2;
        }

        /* Card meta */
        .rt-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; flex: 1; }
        .rt-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--rf-text-secondary, #5a6478);
        }
        .rt-meta-icon { color: var(--rf-text-muted); flex-shrink: 0; }

        /* Card footer */
        .rt-footer { display: flex; gap: 8px; }
        .rt-btn-iniciar {
          flex: 1;
          padding: 10px;
          background: var(--rf-accent, #7b61ff);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 8px rgba(123,97,255,0.3);
          text-decoration: none;
        }
        .rt-btn-iniciar:hover { background: var(--rf-accent-hover, #9178ff); }
        .rt-btn-iniciar:active { transform: scale(0.97); }
        .rt-btn-ver {
          padding: 10px 14px;
          background: var(--rf-bg-elevated, #f8f9fb);
          color: var(--rf-text-secondary, #5a6478);
          border: 1px solid var(--rf-border-default);
          border-radius: 12px;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        .rt-btn-ver:hover { background: var(--rf-bg-hover); border-color: var(--rf-border-strong); }

        /* More button */
        .rt-more-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--rf-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s ease;
          z-index: 2;
        }
        .rt-more-btn:hover { background: var(--rf-bg-hover); color: var(--rf-text-primary); }

        /* Add card */
        .rt-add-card {
          border: 1px dashed var(--rf-border-strong, rgba(0,0,0,0.15)) !important;
          background: transparent !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 32px 18px !important;
          gap: 10px !important;
          min-height: 200px;
          cursor: pointer;
        }
        .rt-add-card::before { display: none; }
        .rt-add-card:hover {
          border-color: rgba(123,97,255,0.28) !important;
          background: rgba(123,97,255,0.06) !important;
          transform: none !important;
        }
        .rt-add-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--rf-text-muted);
          transition: all 0.18s ease;
        }
        .rt-add-card:hover .rt-add-icon {
          background: rgba(123,97,255,0.12);
          border-color: rgba(123,97,255,0.28);
          color: var(--rf-accent, #7b61ff);
        }
        .rt-add-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--rf-text-muted, #aab0bd);
          transition: color 0.18s ease;
        }
        .rt-add-card:hover .rt-add-label { color: var(--rf-accent, #7b61ff); }

        .rt-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          text-align: center;
        }
        .rt-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 22px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: var(--rf-text-muted);
        }
        .rt-empty-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--rf-text-primary);
          margin-bottom: 8px;
        }
        .rt-empty-desc {
          font-size: 13px;
          color: var(--rf-text-secondary);
          line-height: 1.6;
          max-width: 320px;
          margin-bottom: 24px;
        }

        /* Loading skeleton */
        .rt-skeleton {
          animation: rt-skeleton-pulse 1.5s ease-in-out infinite;
          border-radius: 8px;
          background: var(--rf-bg-overlay);
        }
        @keyframes rt-skeleton-pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="rf-cockpit-fill h-full min-h-0">
      {/* Topbar */}
      <div className="rt-topbar">
        <div className="rt-topbar-left">
          <div>
            <h1 className="rt-page-title">Rituais</h1>
            <p className="rt-page-sub">
              {loading
                ? "Carregando..."
                : rituals.length === 0
                  ? "Nenhum ritual configurado ainda."
                  : `${rituals.filter((r) => r.active).length} rituais configurados${liveCount > 0 ? ` · ${liveCount} em andamento agora` : ""}`
              }
            </p>
          </div>
        </div>
        <Link href="/cockpit/rituais/novo" className="rt-btn-new">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Ritual
        </Link>
      </div>

      {/* Search bar */}
      <div className="rt-search-bar">
        <div className="rt-search-wrap">
          <svg className="rt-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="rt-search-input"
            type="text"
            placeholder="Buscar rituais, KPIs, ações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="rt-filter-chips">
          {AREA_TABS.map((tab) => (
            <button
              key={tab.key}
              className={cn("rt-fchip", activeArea === tab.key && "active")}
              onClick={() => setActiveArea(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="rt-content">
        {loading ? (
          <div className="rt-grid flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rt-card" style={{ minHeight: 240 }}>
                <div className="rt-skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
                <div className="rt-skeleton" style={{ height: 20, width: "70%", marginBottom: 14 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  <div className="rt-skeleton" style={{ height: 12, width: "60%" }} />
                  <div className="rt-skeleton" style={{ height: 12, width: "80%" }} />
                  <div className="rt-skeleton" style={{ height: 12, width: "50%" }} />
                </div>
                <div className="rt-skeleton" style={{ height: 38, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ) : rituals.filter((r) => r.active).length === 0 ? (
          <div className="rf-empty-viewport">
            <div className="rf-empty-card">
              <div className="rt-empty">
                <div className="rt-empty-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M6.5 20v-1.5a5.5 5.5 0 0111 0V20"/>
                    <circle cx="18.5" cy="6.5" r="2.5"/><path d="M21 18v-1a3.5 3.5 0 00-2.5-3.35"/>
                  </svg>
                </div>
                <div className="rt-empty-title">Nenhum ritual ainda</div>
                <div className="rt-empty-desc">
                  Configure os rituais da sua equipe para sincronizar alinhamentos, revisar KPIs e registrar decisões.
                </div>
                <Link href="/cockpit/rituais/novo" className="rt-btn-new">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Criar primeiro ritual
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rt-grid flex-1 overflow-auto">
            {filtered.map((r) => (
              <RitualCardItem
                key={r.id}
                ritual={r}
                recordState={recordStates[r.id] ?? "idle"}
                onStartRecord={() => startRecording(r.id)}
                onStopRecord={() => stopRecording(r.id, r)}
                onOpenAta={() => setOpenAtaId(r.id)}
                onDuplicate={() => void duplicate(r)}
                onToggleActive={() => void toggleActive(r)}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--rf-text-muted)", fontSize: 13 }}>
                Nenhum ritual encontrado para este filtro.
              </div>
            )}
            <Link href="/cockpit/rituais/novo" className="rt-card rt-add-card">
              <div className="rt-add-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div className="rt-add-label">Criar novo ritual</div>
            </Link>
          </div>
        )}
      </div>

      {/* Ata Modal */}
      {openAtaId !== null && atas[String(openAtaId)] && (
        <AtaModal
          ata={atas[String(openAtaId)]}
          onClose={() => setOpenAtaId(null)}
          onUpdateAta={(updated) => setAtas((prev) => ({ ...prev, [String(openAtaId)]: updated }))}
        />
      )}
      </div>
    </>
  )
}

// ─── RitualCardItem ───────────────────────────────────────────────────────────

function RitualCardItem({
  ritual: r, recordState, onStartRecord, onStopRecord, onOpenAta, onDuplicate, onToggleActive,
}: {
  ritual: RitualCard; recordState: RecordState
  onStartRecord: () => void; onStopRecord: () => void; onOpenAta: () => void
  onDuplicate: () => void; onToggleActive: () => void
}) {
  const area = AREA_META[r.area]
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (recordState === "recording") {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [recordState])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
  const isLive = r.isToday

  return (
    <div
      className={cn("rt-card", isLive && "rt-card-live", !r.active && "rt-card-inactive")}
      style={{ "--rt-bar": area.dot } as React.CSSProperties}
    >
      {/* Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rt-more-btn" title="Mais opções">
            <MoreVertical width={15} height={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/cockpit/rituais/${r.id}`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-3.5 w-3.5" />Duplicar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleActive} className="text-amber-600 focus:text-amber-600">
            <Trash2 className="mr-2 h-3.5 w-3.5" />{r.active ? "Arquivar ritual" : "Reativar ritual"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Header */}
      <div className="rt-card-header">
        <div className="rt-area">
          <span className="rt-area-dot" style={{ background: area.dot }} />
          {area.label.toUpperCase()}
        </div>
        {isLive ? (
          <div className="rt-live-badge">
            <span className="rt-live-dot" />
            Em andamento
          </div>
        ) : (
          <div className="rt-freq">{FREQ_LABEL[r.freq]}</div>
        )}
      </div>

      {/* Title */}
      <div className="rt-title">{r.name}</div>

      {/* Meta */}
      <div className="rt-meta">
        {r.schedule && (
          <div className="rt-meta-row">
            <svg className="rt-meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {r.schedule}{r.durationMin > 0 && `, ${r.durationMin}min`}
          </div>
        )}
        <div className="rt-meta-row">
          <svg className="rt-meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          {r.participants.length > 0 ? `${r.participants.length} participante${r.participants.length !== 1 ? "s" : ""}` : "Sem participantes"}{r.owner ? ` — Resp: ${r.owner}` : ""}
        </div>
        <div className="rt-meta-row">
          <svg className="rt-meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {r.isToday ? `Hoje ${r.todayTime ?? ""}` : r.nextLabel}
        </div>
      </div>

      {/* Footer */}
      <div className="rt-footer">
        {isLive && recordState === "idle" && (
          <Link href={`/cockpit/rituais/${r.id}`} className="rt-btn-iniciar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Entrar na Sessão
          </Link>
        )}
        {isLive && recordState === "recording" && (
          <button onClick={onStopRecord} className="rt-btn-iniciar" style={{ background: "#ef4444", boxShadow: "0 2px 8px rgba(239,68,68,0.3)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            {formatTime(elapsed)} — Parar
          </button>
        )}
        {isLive && recordState === "generating" && (
          <button className="rt-btn-iniciar" disabled style={{ opacity: 0.7, cursor: "not-allowed" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Gerando ata...
          </button>
        )}
        {isLive && recordState === "done" && (
          <button onClick={onOpenAta} className="rt-btn-iniciar">
            <FileText className="h-3.5 w-3.5" />
            Ver Ata
          </button>
        )}
        {!isLive && (
          <>
            <Link href={`/cockpit/rituais/${r.id}`} className="rt-btn-iniciar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Iniciar Reunião
            </Link>
            <Link href={`/cockpit/rituais/${r.id}`} className="rt-btn-ver">Ver</Link>
          </>
        )}
        {isLive && recordState === "idle" && (
          <button onClick={onStartRecord} className="rt-btn-ver" title="Gravar reunião">
            <Mic className="h-3.5 w-3.5" />
          </button>
        )}
        {isLive && recordState === "recording" && (
          <button onClick={onStartRecord} className="rt-btn-ver" title="Microfone ativo">
            <MicOff className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── AtaModal ─────────────────────────────────────────────────────────────────

function AtaModal({ ata, onClose, onUpdateAta }: { ata: AtaContent; onClose: () => void; onUpdateAta: (a: AtaContent) => void }) {
  const [openSection, setOpenSection] = useState<string | null>("transcricao")
  const [kpisSaved, setKpisSaved] = useState(false)
  const [actionsSaved, setActionsSaved] = useState(false)

  function toggleSection(s: string) { setOpenSection((o) => (o === s ? null : s)) }
  function toggleKpi(id: number) {
    onUpdateAta({ ...ata, kpis: ata.kpis.map((k) => k.id === id ? { ...k, selected: !k.selected } : k) })
  }
  function toggleAction(id: number) {
    onUpdateAta({ ...ata, actions: ata.actions.map((a) => a.id === id ? { ...a, selected: !a.selected } : a) })
  }

  const selectedKpis = ata.kpis.filter((k) => k.selected)
  const selectedActions = ata.actions.filter((a) => a.selected)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl p-0">
        <div className="shrink-0 bg-primary px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-primary-foreground">Ata da Reunião</DialogTitle>
              </DialogHeader>
              <p className="mt-1 text-xs text-primary-foreground/70">{ata.ritualName} · {ata.date} · {ata.duration}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ata.participants.map((pt) => (
                  <span key={pt} className="rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-medium text-primary-foreground/80">{pt}</span>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-0.5 h-7 w-7 p-0 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AtaSection icon={<Mic className="h-4 w-4" />} title="Transcrição" open={openSection === "transcricao"} onToggle={() => toggleSection("transcricao")} badge={null}>
            <div className="rounded-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-line">{ata.transcription}</div>
          </AtaSection>
          <AtaSection icon={<ClipboardList className="h-4 w-4" />} title="Tópicos Discutidos" open={openSection === "topicos"} onToggle={() => toggleSection("topicos")} badge={`${ata.topics.length}`}>
            <ul className="space-y-2">
              {ata.topics.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{t}
                </li>
              ))}
            </ul>
          </AtaSection>
          <AtaSection icon={<CheckCircle2 className="h-4 w-4" />} title="Decisões Tomadas" open={openSection === "decisoes"} onToggle={() => toggleSection("decisoes")} badge={`${ata.decisions.length}`}>
            <ul className="space-y-2">
              {ata.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{d}
                </li>
              ))}
            </ul>
          </AtaSection>
          <AtaSection icon={<ClipboardList className="h-4 w-4 text-sky-600" />} title="Planos de Ação" open={openSection === "acoes"} onToggle={() => toggleSection("acoes")} badge={`${selectedActions.length}/${ata.actions.length}`}>
            <div className="space-y-2">
              {ata.actions.map((action) => (
                <label key={action.id} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors", action.selected ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/50")}>
                  <input type="checkbox" checked={action.selected} onChange={() => toggleAction(action.id)} className="mt-0.5 h-4 w-4 rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{action.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{action.owner}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{action.dueDate}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {!actionsSaved ? (
              <Button variant="default" className="mt-3 w-full" onClick={() => setActionsSaved(true)}>
                Criar {selectedActions.length} Plano{selectedActions.length !== 1 ? "s" : ""} de Ação
              </Button>
            ) : (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />{selectedActions.length} plano{selectedActions.length !== 1 ? "s" : ""} criado{selectedActions.length !== 1 ? "s" : ""} com sucesso!
              </div>
            )}
          </AtaSection>
          <AtaSection icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} title="KPIs Sugeridos pela IA" open={openSection === "kpis"} onToggle={() => toggleSection("kpis")} badge={`${selectedKpis.length}/${ata.kpis.length}`}>
            <div className="space-y-2">
              {ata.kpis.map((kpi) => (
                <label key={kpi.id} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors", kpi.selected ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/50")}>
                  <input type="checkbox" checked={kpi.selected} onChange={() => toggleKpi(kpi.id)} className="mt-0.5 h-4 w-4 rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{kpi.name}</span>
                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Meta: {kpi.goal} {kpi.unit}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{kpi.metric}</div>
                  </div>
                </label>
              ))}
            </div>
            {!kpisSaved ? (
              <Button variant="default" className="mt-3 w-full gap-2" onClick={() => setKpisSaved(true)}>
                <Sparkles className="h-4 w-4" />Criar {selectedKpis.length} KPI{selectedKpis.length !== 1 ? "s" : ""} selecionado{selectedKpis.length !== 1 ? "s" : ""}
              </Button>
            ) : (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />{selectedKpis.length} KPI{selectedKpis.length !== 1 ? "s" : ""} criado{selectedKpis.length !== 1 ? "s" : ""} com sucesso!
              </div>
            )}
          </AtaSection>
        </div>
        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AtaSection({ icon, title, open, onToggle, badge, children }: {
  icon: React.ReactNode; title: string; open: boolean; onToggle: () => void
  badge: string | null; children: React.ReactNode
}) {
  return (
    <div className="border-b border-border">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-muted-foreground">{icon}</span>{title}
          {badge && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{badge}</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}

// keep p usage to avoid lint warning
void p
