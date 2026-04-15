"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import { toast } from "sonner"
import { toastApiError } from "@/lib/cockpit/api-error"
import { Plus } from "lucide-react"

/* ── Options matching index.html ── */
const FREQUENCIES = [
  { value: "daily", label: "Daily — diário (dias úteis)" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "strategic", label: "Estratégico (avulso)" },
]

const AREAS = [
  { value: "COMMERCIAL", label: "Comercial" },
  { value: "MARKETING", label: "Marketing" },
  { value: "FINANCIAL", label: "Financeiro" },
  { value: "TECHNOLOGY", label: "Tecnologia" },
  { value: "OPERATIONAL", label: "Operacional" },
  { value: "STRATEGIC", label: "Estratégico" },
]

const OWNERS = ["Evandro", "Vinicius", "Cairo", "Ricardo", "José Pedro", "João Arantes"]

const WEEKDAYS = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
]

const DURATIONS = ["15 min", "30 min", "45 min", "60 min", "90 min", "120 min"]

const COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#16a34a", "#e8325f", "#1a4a35", "#64748b", "#0d9488"]

const KPIS_OPTIONS = [
  "#206 — TPV",
  "#207 — Leads Qualificados",
  "#337 — Alcance Orgânico",
  "#512 — Faturamento",
  "#513 — Margem Líquida",
]

/* ── Section title ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 border-b border-border pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}

/* ── Color swatch ── */
function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 w-7 shrink-0 rounded-full border-[2.5px] transition-transform hover:scale-110",
        selected ? "scale-110 border-foreground" : "border-transparent"
      )}
      style={{ background: color }}
    />
  )
}

type Props = { trigger?: React.ReactNode; onCreated?: () => void }

export function CreateRitualDialog({ trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  /* form state */
  const [name, setName] = useState("")
  const [frequency, setFrequency] = useState("weekly")
  const [area, setArea] = useState("")
  const [owner, setOwner] = useState("")
  const [weekday, setWeekday] = useState("monday")
  const [startTime, setStartTime] = useState("09:00")
  const [duration, setDuration] = useState("30 min")
  const [startDate, setStartDate] = useState("")
  const [agenda, setAgenda] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [linkedKpi, setLinkedKpi] = useState("")
  const [description, setDescription] = useState("")

  function reset() {
    setName(""); setFrequency("weekly"); setArea(""); setOwner("")
    setWeekday("monday"); setStartTime("09:00"); setDuration("30 min")
    setStartDate(""); setAgenda(""); setColor(COLORS[0])
    setLinkedKpi(""); setDescription("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Informe o nome do ritual.")
      return
    }
    if (!area) {
      toast.error("Selecione a área do ritual.")
      return
    }
    if (!owner) {
      toast.error("Selecione o responsável do ritual.")
      return
    }
    setSaving(true)
    try {
      await api.post("/cockpit/rituals", {
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        area,
        owner_name: owner,
        schedule: `${WEEKDAYS.find((w) => w.value === weekday)?.label ?? weekday} · ${startTime}`,
        start_time: startTime,
        duration_minutes: parseInt(duration) || 30,
        start_date: startDate || undefined,
        default_agenda: agenda.trim() || undefined,
        color,
        is_active: true,
        participants: [],
      })
      toast.success("Ritual criado com sucesso!")
      reset()
      setOpen(false)
      onCreated?.()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao criar ritual. Tente novamente." })
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
            Novo Ritual
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[480px]" showCloseButton={false}>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">

          {/* Header */}
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle className="text-[15px]">Novo Ritual</SheetTitle>
            <SheetDescription className="sr-only">Formulário para criar um novo ritual</SheetDescription>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

            <SectionTitle>Informações Básicas</SectionTitle>

            {/* Nome */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Daily Comercial, Semanal Marketing…"
              />
            </div>

            {/* Frequência + Área */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Frequência <span className="text-destructive">*</span>
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Área <span className="text-destructive">*</span>
                </Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger><SelectValue placeholder="Selecionar…" /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Responsável <span className="text-destructive">*</span>
              </Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue placeholder="Selecionar responsável…" /></SelectTrigger>
                <SelectContent>
                  {OWNERS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                O responsável conduz a sessão e é notificado caso o ritual não seja iniciado
              </p>
            </div>


            <SectionTitle>Agenda</SectionTitle>

            {/* Dia da semana + Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Dia da semana <span className="text-destructive">*</span>
                </Label>
                <Select value={weekday} onValueChange={setWeekday}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Horário <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Duração + Data de início */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Duração estimada</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Data de início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <SectionTitle>Conteúdo e Identidade</SectionTitle>

            {/* Pauta padrão */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Pauta padrão <span className="font-normal text-muted-foreground/60">(perguntas norteadoras)</span>
              </Label>
              <Textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder={"Quais são os números de hoje?\nQuais bloqueios existem?\nQuais foram as entregas desde a última reunião?"}
                rows={3}
              />
              <p className="text-[11px] text-muted-foreground">
                Exibida como guia no início de cada sessão
              </p>
            </div>

            {/* Cor de identificação */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Cor de identificação</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <ColorSwatch key={c} color={c} selected={color === c} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>

            {/* KPIs vinculados */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">KPIs vinculados</Label>
              <Select value={linkedKpi} onValueChange={setLinkedKpi}>
                <SelectTrigger><SelectValue placeholder="Adicionar KPI…" /></SelectTrigger>
                <SelectContent>
                  {KPIS_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                KPIs vinculados são exibidos e podem ser atualizados durante a sessão
              </p>
            </div>

          </div>

          {/* Footer */}
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              {saving ? "Criando…" : "Criar Ritual"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
