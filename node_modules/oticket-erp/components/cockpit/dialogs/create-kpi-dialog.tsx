"use client"

import { useEffect, useState } from "react"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import api from "@/utils/api"
import { toast } from "sonner"
import { toastApiError } from "@/lib/cockpit/api-error"
import {
  aggregationFromConsolidationLabel,
  buildCreateKpiBody,
} from "@/lib/cockpit/kpi-create-payload"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"

const AREAS   = ["Comercial","Marketing","Financeiro","Tecnologia","Operacional"]
const OWNERS  = ["Evandro","Vinicius","Cairo","Ricardo","José Pedro","João Arantes"]
const FREQS   = ["Semanal","Quinzenal","Mensal"]
const CONSOLIDATIONS = [
  "Soma — soma todos os registros do período",
  "Média — média dos registros do período",
  "Último valor — usa apenas o registro mais recente",
  "Acumulado — soma ao longo do ano",
]
const TYPES = [
  { value: "monetary",   icon: "💰", label: "Monetário" },
  { value: "percentage", icon: "%",  label: "Percentual" },
  { value: "quantity",   icon: "#",  label: "Quantidade" },
  { value: "index",      icon: "⭐", label: "Índice" },
]

/* same border style as RitualFormModal */
const INPUT = [
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
  "placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400",
  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500",
].join(" ")
const STRIG = [
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
  "focus:border-gray-500 focus:ring-1 focus:ring-gray-400",
  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-white [&>span]:text-sm",
].join(" ")
const LABEL = "block text-[13px] font-medium text-foreground"
const HINT  = "text-[11px] text-muted-foreground"
const FIELD = "space-y-1.5"
const SEC   = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground"

type Props = { trigger?: React.ReactNode; onCreated?: () => void }

export function CreateKpiDialog({ trigger, onCreated }: Props) {
  const DEFAULT_UNITS: Record<string, string> = {
    monetary: "R$",
    percentage: "%",
    quantity: "un",
    index: "pts",
  }

  function parsePtNumber(raw: string): number {
    const s = (raw ?? "").trim()
    if (!s) return 0
    const cleaned = s.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }

  function formatInputForUnit(raw: string, u: string): string {
    const s = (raw ?? "").trim()
    if (!s) return ""
    if (u === "%") {
      const only = s.replace(/[^\d,]/g, "")
      const parts = only.split(",")
      const intPart = parts[0] ?? ""
      const decPart = (parts[1] ?? "").slice(0, 2)
      return decPart ? `${intPart},${decPart}` : intPart
    }
    const digits = s.replace(/[^\d]/g, "")
    if (!digits) return ""
    const n = Number(digits)
    if (!Number.isFinite(n)) return ""
    return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
  }

  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [rituals, setRituals] = useState<{ id: string; name: string }[]>([])

  const [name,          setName]          = useState("")
  const [code,          setCode]          = useState("")
  const [area,          setArea]          = useState("")
  const [dataType,      setDataType]      = useState("monetary")
  const [unit,          setUnit]          = useState("")
  const [frequency,     setFrequency]     = useState("Mensal")
  const [consolidation, setConsolidation] = useState(CONSOLIDATIONS[0])
  const [annualGoal,    setAnnualGoal]    = useState("")
  const [monthGoal,     setMonthGoal]     = useState("")
  const [owner,         setOwner]         = useState("")
  const [ritualId,      setRitualId]      = useState<string | null>(null)
  const [cockpit,       setCockpit]       = useState(true)
  const [criticalThreshold, setCriticalThreshold] = useState("15")
  const [attentionThreshold, setAttentionThreshold] = useState("5")
  const [description,   setDescription]   = useState("")

  const canSave = name.trim() !== "" && area !== "" && owner !== "" && annualGoal !== ""

  useEffect(() => {
    const suggested = DEFAULT_UNITS[dataType] ?? ""
    const isDefaultish = unit.trim() === "" || Object.values(DEFAULT_UNITS).includes(unit)
    if (suggested && isDefaultish && unit !== suggested) setUnit(suggested)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataType])

  function reset() {
    setName(""); setCode(""); setArea(""); setDataType("monetary")
    setUnit(""); setFrequency("Mensal"); setConsolidation(CONSOLIDATIONS[0])
    setAnnualGoal(""); setMonthGoal(""); setOwner(""); setRitualId(null)
    setCockpit(true); setCriticalThreshold("15"); setAttentionThreshold("5"); setDescription("")
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/rituals", { params: { status: "active" } })
        const list = Array.isArray(data) ? data : data?.data ?? []
        const mapped = list
          .map((r: unknown) => {
            if (!r || typeof r !== "object") return null
            const obj = r as Record<string, unknown>
            const id = String(obj.id ?? "")
            const name = String(obj.name ?? "")
            return id && name ? { id, name } : null
          })
          .filter((r: { id: string; name: string } | null): r is { id: string; name: string } => !!r)
        if (!cancelled) setRituals(mapped)
      } catch {
        if (!cancelled) setRituals([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const ct = parsePtNumber(criticalThreshold)
      const at = parsePtNumber(attentionThreshold)
      const payload = buildCreateKpiBody({
        name: name.trim(),
        code: code.trim() || null,
        area,
        kpiType: dataType,
        unit: unit.trim(),
        inputFrequency: frequency,
        aggregation: aggregationFromConsolidationLabel(consolidation),
        monthGoal: monthGoal ? parsePtNumber(monthGoal) : 0,
        annualGoal: parsePtNumber(annualGoal),
        ownerName: owner,
        isCockpit: cockpit,
        ritualId,
        criticalDeviationThresholdPct: Number.isFinite(ct) && ct > 0 ? Math.min(100, Math.max(0.1, ct)) : 15,
        attentionDeviationThresholdPct: (() => {
          const c = Number.isFinite(ct) && ct > 0 ? Math.min(100, Math.max(0.1, ct)) : 15
          const a = Number.isFinite(at) && at > 0 ? Math.min(100, Math.max(0.1, at)) : 5
          return Math.min(c, a)
        })(),
      })
      await api.post("/cockpit/kpis", payload)
      toast.success("KPI criado com sucesso!")
      reset(); setOpen(false); onCreated?.()
    } catch (e: unknown) {
      toastApiError(e, { fallback: "Erro ao criar KPI." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button type="button">
            <Plus className="mr-1 h-4 w-4" />
            Novo KPI
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Novo KPI</SheetTitle>
          <SheetDescription>Formulário para criar um novo KPI</SheetDescription>
        </SheetHeader>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground">Novo KPI</span>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">

            {/* ── IDENTIFICAÇÃO ── */}
            <p className={SEC}>Identificação</p>

            <div className={FIELD}>
              <label className={LABEL}>Nome <span className="text-destructive">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: TPV — Total de Pagamentos Validados"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Código de referência</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="#206"
                  className={cn(INPUT, "font-mono")}
                />
                <p className={HINT}>Ref. numérica da planilha atual</p>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Área <span className="text-destructive">*</span></label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className={STRIG}><SelectValue placeholder="Selecionar…" /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de dado */}
            <div className={FIELD}>
              <label className={LABEL}>Tipo de dado <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setDataType(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border py-2.5 text-center transition-colors",
                      dataType === t.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                    )}
                  >
                    <span className="text-lg leading-none">{t.icon}</span>
                    <span className="text-[11px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Unidade <span className="text-destructive">*</span></label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder={DEFAULT_UNITS[dataType] ?? "R$, %, pts, unidades…"}
                  className={INPUT}
                />
                <p className={HINT}>
                  Sugestão: <span className="font-semibold text-foreground">{DEFAULT_UNITS[dataType] ?? "—"}</span>
                </p>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Frequência de input <span className="text-destructive">*</span></label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className={STRIG}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={FIELD}>
              <label className={LABEL}>Lógica de consolidação <span className="text-destructive">*</span></label>
              <Select value={consolidation} onValueChange={setConsolidation}>
                <SelectTrigger className={STRIG}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONSOLIDATIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className={HINT}>Define como o resultado anual é calculado a partir dos registros periódicos</p>
            </div>

            {/* ── METAS ── */}
            <p className={SEC}>Metas</p>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Meta Anual <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={annualGoal}
                  onChange={(e) => setAnnualGoal(formatInputForUnit(e.target.value, unit))}
                  placeholder={unit === "R$" ? "Ex: 48000000" : unit === "%" ? "Ex: 98,5" : "Ex: 1200"}
                  className={cn(INPUT, "font-mono")}
                />
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Meta do Mês atual</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={monthGoal}
                  onChange={(e) => setMonthGoal(formatInputForUnit(e.target.value, unit))}
                  placeholder="Calculada automaticamente"
                  className={cn(INPUT, "font-mono")}
                />
                <p className={HINT}>Opcional — se vazio, calculada pela meta anual</p>
              </div>
            </div>

            {/* ── CONFIGURAÇÕES ── */}
            <p className={SEC}>Configurações</p>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Responsável <span className="text-destructive">*</span></label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className={STRIG}><SelectValue placeholder="Selecionar…" /></SelectTrigger>
                  <SelectContent>
                    {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Rituais vinculados</label>
                <Select value={ritualId ?? "none"} onValueChange={(v) => setRitualId(v === "none" ? null : v)}>
                  <SelectTrigger className={STRIG}><SelectValue placeholder="Selecionar ritual…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {rituals.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkbox cockpit */}
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-900">
              <input
                type="checkbox"
                checked={cockpit}
                onChange={(e) => setCockpit(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-700"
              />
              <div>
                <p className="text-[13px] font-medium text-foreground">Visível no Cockpit Estratégico</p>
                <p className={HINT}>KPIs marcados aparecem no painel consolidado dos sócios</p>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Limite atenção (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={attentionThreshold}
                  onChange={(e) => setAttentionThreshold(e.target.value.replace(/[^\d,.]/g, ""))}
                  placeholder="5"
                  className={cn(INPUT, "font-mono max-w-[120px]")}
                />
                <p className={HINT}>≤ limite crítico. Padrão 5.</p>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Limite crítico (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(e.target.value.replace(/[^\d,.]/g, ""))}
                  placeholder="15"
                  className={cn(INPUT, "font-mono max-w-[120px]")}
                />
                <p className={HINT}>
                  Crítico se o desvio for pior que o negativo deste valor (padrão 15 = &lt; -15%).
                </p>
              </div>
            </div>

            {/* Descrição */}
            <div className={FIELD}>
              <label className={LABEL}>Descrição / Metodologia</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Explique o que este indicador mede, como é calculado e por que é relevante…"
                className={cn(INPUT, "h-auto resize-y py-2.5")}
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background px-6 py-4">
          <Button variant="outline" onClick={() => { reset(); setOpen(false) }}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={handleSave} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {saving ? "Criando…" : "Criar KPI"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
