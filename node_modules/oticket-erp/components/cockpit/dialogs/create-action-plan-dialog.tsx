"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/utils/api"
import { toast } from "sonner"
import { toastApiError } from "@/lib/cockpit/api-error"
import { cn } from "@/lib/utils"
import { Calendar, Info, Loader2, Plus, X } from "lucide-react"
import { COCKPIT_AREAS, OWNERS } from "@/lib/cockpit/constants"

const LABEL = "text-sm font-medium text-foreground"
const FIELD = "space-y-1.5"

type Priority = "high" | "medium" | "low"
type Props = { trigger?: React.ReactNode; onCreated?: () => void }

export function CreateActionPlanDialog({ trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ritualOptions, setRitualOptions] = useState<{ id: string; name: string }[]>([])

  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [owner, setOwner] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [areaSlug, setAreaSlug] = useState("")
  const [ritualId, setRitualId] = useState<string>("__none__")
  const [notes, setNotes] = useState("")

  const canSave =
    title.trim() !== "" && owner !== "" && dueDate !== "" && areaSlug !== ""

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/rituals", { params: { status: "all" } })
        const list = Array.isArray(data) ? data : data?.data ?? []
        const mapped = list
          .map((r: unknown) => {
            if (!r || typeof r !== "object") return null
            const o = r as Record<string, unknown>
            const id = String(o.id ?? "")
            const name = String(o.name ?? "")
            return id && name ? { id, name } : null
          })
          .filter((x: { id: string; name: string } | null): x is { id: string; name: string } => x !== null)
        if (!cancelled) setRitualOptions(mapped)
      } catch {
        if (!cancelled) setRitualOptions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  const reset = useCallback(() => {
    setTitle("")
    setPriority("medium")
    setOwner("")
    setDueDate("")
    setAreaSlug("")
    setRitualId("__none__")
    setNotes("")
  }, [])

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Informe o título do plano.")
      return
    }
    if (!owner) {
      toast.error("Selecione o responsável.")
      return
    }
    if (!dueDate) {
      toast.error("Informe o prazo.")
      return
    }
    if (!areaSlug) {
      toast.error("Selecione a área.")
      return
    }
    setSaving(true)
    try {
      await api.post("/cockpit/action-plans", {
        title: title.trim(),
        status: "planned",
        area: areaSlug,
        owner_name: owner,
        due_date: dueDate,
        priority,
        description: notes.trim() || null,
        ritual_id: ritualId !== "__none__" ? ritualId : null,
      })
      toast.success("Plano criado com sucesso!")
      reset()
      setOpen(false)
      onCreated?.()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao criar plano." })
    } finally {
      setSaving(false)
    }
  }

  /** Pontos semânticos; seleção usa tokens do tema (primary) */
  const PRIO: { value: Priority; label: string; dot: string }[] = [
    { value: "high", label: "Alta", dot: "#dc2626" },
    { value: "medium", label: "Média", dot: "#ea580c" },
    { value: "low", label: "Baixa", dot: "#16a34a" },
  ]

  const selectTriggerClass = cn(
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-sm",
    "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
    "[&>span]:text-sm [&>span]:text-foreground",
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button type="button">
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 overflow-hidden border-border bg-background p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Novo plano de ação</SheetTitle>
          <SheetDescription>Defina o que será feito, quem responde e até quando.</SheetDescription>
        </SheetHeader>

        <div className="relative shrink-0 border-b border-border px-5 py-4 pr-12">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Novo plano de ação</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Defina o que será feito, quem responde e até quando.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
            <div className={FIELD}>
              <label className={LABEL}>
                Título <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                  placeholder="Ex.: Revisar SLA de atendimento com o time"
                  maxLength={200}
                  className={cn(
                    "min-h-[44px] w-full rounded-lg border border-border bg-background pb-7 pl-3 pr-3 pt-2.5 text-sm text-foreground shadow-sm",
                    "placeholder:text-muted-foreground",
                    "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
                  )}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums text-muted-foreground">
                  {title.length}/200
                </span>
              </div>
            </div>

            <div className={FIELD}>
              <span className={LABEL}>Prioridade</span>
              <div className="grid grid-cols-3 gap-2">
                {PRIO.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-colors",
                      priority === p.value
                        ? "border-primary bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-background"
                      style={{ backgroundColor: p.dot }}
                      aria-hidden
                    />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD}>
                <label className={LABEL}>
                  Responsável <span className="text-destructive">*</span>
                </label>
                <Select value={owner === "" ? undefined : owner} onValueChange={setOwner}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Selecionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>
                  Prazo <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-lg border border-border bg-background pl-3 pr-10 text-sm text-foreground shadow-sm",
                      "scheme-light focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
                      "dark:scheme-dark",
                    )}
                  />
                  <Calendar
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
              <span>Responsável e prazo são obrigatórios (RN-01 e RN-02).</span>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD}>
                <label className={LABEL}>
                  Área <span className="text-destructive">*</span>
                </label>
                <Select value={areaSlug === "" ? undefined : areaSlug} onValueChange={setAreaSlug}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Selecionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COCKPIT_AREAS.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Ritual de origem</label>
                <Select value={ritualId} onValueChange={setRitualId}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {ritualOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={FIELD}>
              <label className={LABEL}>Observações</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Contexto, links ou critérios de conclusão…"
                className="min-h-[100px] resize-y rounded-lg border-border bg-background text-sm placeholder:text-muted-foreground focus-visible:ring-ring/40"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background px-5 py-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" size="sm" disabled={!canSave || saving} onClick={handleSave} className="min-w-[132px]">
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Criando…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Criar plano
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
