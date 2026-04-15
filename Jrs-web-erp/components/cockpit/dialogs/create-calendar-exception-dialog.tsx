"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Calendar, Check, Clock, Loader2, XCircle } from "lucide-react"

const INPUT = cn(
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm",
  "placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
)
const STRIG = cn(
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-sm",
  "focus:border-ring focus:ring-2 focus:ring-ring/40",
  "[&>span]:text-sm",
)
const LABEL = "text-sm font-medium text-foreground"
const FIELD = "space-y-1.5"

export type CreateCalendarExceptionDialogProps = {
  open: boolean
  onClose: () => void
  rituals: Record<string, unknown>[]
  defaultDate: string
}

export function CreateCalendarExceptionDialog({
  open,
  onClose,
  rituals,
  defaultDate,
}: CreateCalendarExceptionDialogProps) {
  const [ritualId, setRitualId] = useState("")
  const [date, setDate] = useState(defaultDate)
  const [exceptionMode, setExceptionMode] = useState<"cancelado" | "remarcado">("cancelado")
  const [newDate, setNewDate] = useState("")
  const [obs, setObs] = useState("")
  const [notifyParticipants, setNotifyParticipants] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDate(defaultDate)
    setRitualId("")
    setExceptionMode("cancelado")
    setNewDate("")
    setObs("")
    setNotifyParticipants(true)
  }, [open, defaultDate])

  const ritualName = useMemo(() => {
    const r = rituals.find((x) => String(x.id) === ritualId)
    return ((r?.name as string) ?? "").trim() || "—"
  }, [rituals, ritualId])

  const canSave =
    ritualId !== "" &&
    date !== "" &&
    (exceptionMode === "cancelado" || (exceptionMode === "remarcado" && newDate !== ""))

  function buildNotes(): string | undefined {
    const lines: string[] = []
    if (obs.trim()) lines.push(obs.trim())
    if (exceptionMode === "remarcado" && newDate) lines.push(`Reagendamento para: ${newDate}`)
    lines.push(`Notificar participantes: ${notifyParticipants ? "sim" : "não"}`)
    return lines.length ? lines.join("\n\n") : undefined
  }

  function fmtPt(iso: string) {
    if (!iso || iso.length < 10) return "—"
    const [y, m, d] = iso.slice(0, 10).split("-")
    return `${d}/${m}/${y}`
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await api.post("/cockpit/calendar/exceptions", {
        ritual_id: ritualId,
        occurrence_date: date,
        exception_type: exceptionMode,
        notes: buildNotes(),
      })
      toast.success("Exceção registrada.")
      onClose()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao registrar exceção." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-lg",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <DialogHeader>
          <DialogTitle>Criar exceção de data</DialogTitle>
          <DialogDescription>
            Cancele ou reagende uma ocorrência específica do ritual.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className={FIELD}>
            <label className={LABEL}>
              Ritual <span className="text-destructive">*</span>
            </label>
            <Select value={ritualId || undefined} onValueChange={setRitualId}>
              <SelectTrigger className={STRIG}>
                <SelectValue placeholder="Selecionar ritual…" />
              </SelectTrigger>
              <SelectContent>
                {rituals.map((r) => (
                  <SelectItem key={String(r.id)} value={String(r.id)}>
                    {(r.name as string) ?? "Ritual"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={FIELD}>
            <span className={LABEL}>
              Tipo de exceção <span className="text-destructive">*</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setExceptionMode("cancelado")}
                className={cn(
                  "flex gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  exceptionMode === "cancelado"
                    ? "border-primary bg-primary/5 text-foreground ring-2 ring-ring/30"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                    exceptionMode === "cancelado"
                      ? "border-border bg-background text-destructive"
                      : "border-transparent bg-muted/50",
                  )}
                >
                  <XCircle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="font-medium">Cancelamento</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    Esta sessão não ocorrerá. O ritual segue nas próximas datas.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setExceptionMode("remarcado")}
                className={cn(
                  "flex gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  exceptionMode === "remarcado"
                    ? "border-primary bg-primary/5 text-foreground ring-2 ring-ring/30"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                    exceptionMode === "remarcado"
                      ? "border-border bg-background text-foreground"
                      : "border-transparent bg-muted/50",
                  )}
                >
                  <Calendar className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="font-medium">Reagendamento</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    Mover esta sessão para uma nova data e horário.
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={FIELD}>
              <Label htmlFor="exc-date-original">
                Data original <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exc-date-original"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT}
              />
              <p className="text-xs text-muted-foreground">Ocorrência a ser afetada</p>
            </div>
            <div className={FIELD}>
              <Label
                htmlFor="exc-date-new"
                className={exceptionMode === "remarcado" ? undefined : "text-muted-foreground"}
              >
                Nova data{" "}
                {exceptionMode === "remarcado" ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="font-normal text-muted-foreground">(se reagendamento)</span>
                )}
              </Label>
              <Input
                id="exc-date-new"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                disabled={exceptionMode === "cancelado"}
                className={cn(INPUT, exceptionMode === "cancelado" && "cursor-not-allowed opacity-50")}
              />
              <p className="text-xs text-muted-foreground">Informe para reagendamento</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-foreground">Impacto desta exceção</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {exceptionMode === "cancelado" ? (
                <>
                  A ocorrência de <span className="font-medium text-foreground">&apos;{ritualName}&apos;</span> em{" "}
                  {fmtPt(date)} será marcada como cancelada. Os participantes serão notificados se a opção abaixo
                  estiver ativa.
                </>
              ) : (
                <>
                  A ocorrência de <span className="font-medium text-foreground">&apos;{ritualName}&apos;</span> em{" "}
                  {fmtPt(date)} será reagendada
                  {newDate ? ` para ${fmtPt(newDate)}` : ""}. Os participantes serão notificados se a opção abaixo
                  estiver ativa.
                </>
              )}
            </p>
          </div>

          <div className={FIELD}>
            <Label htmlFor="exc-notes">Motivo (opcional)</Label>
            <Textarea
              id="exc-notes"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: Feriado nacional, viagem da equipe, indisponibilidade do espaço…"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Ficará registrado no histórico do ritual e será exibido para os participantes.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={notifyParticipants}
                onCheckedChange={(v) => setNotifyParticipants(v === true)}
                className="mt-0.5"
              />
              <span className="space-y-0.5">
                <span className={LABEL}>Notificar participantes</span>
                <span className="block text-xs text-muted-foreground">
                  Envia e-mail automático informando o cancelamento ou nova data.
                </span>
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" />
            Afeta apenas esta ocorrência
          </div>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!canSave || saving}
              variant={exceptionMode === "cancelado" ? "destructive" : "default"}
              className="gap-1.5"
              onClick={handleSave}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving
                ? "Salvando…"
                : exceptionMode === "cancelado"
                  ? "Confirmar cancelamento"
                  : "Confirmar reagendamento"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
