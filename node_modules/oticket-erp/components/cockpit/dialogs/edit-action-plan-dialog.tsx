"use client"

import { useEffect, useMemo, useState } from "react"
import type { ActionPlan } from "@/components/cockpit/planos-de-acao/action-plan-card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { COCKPIT_AREAS } from "@/lib/cockpit/constants"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"

const COLLABORATORS = [
  "Evandro",
  "José Pedro",
  "Ricardo",
  "Vinicius",
  "João Pedro",
  "Cairo",
]

export function EditActionPlanDialog({
  open,
  onOpenChange,
  plan,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Record<string, unknown> | null
  onSaved?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [otherPlans, setOtherPlans] = useState<{ id: string; title: string }[]>([])
  const [dependsOn, setDependsOn] = useState<string>("none")

  const [title, setTitle] = useState("")
  const [area, setArea] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high")

  const canEdit = plan != null

  useEffect(() => {
    if (!plan) return
    setTitle((plan.title as string) ?? "")
    setArea((plan.area as string) ?? "")
    setOwnerName((plan.ownerName as string) ?? (plan.owner_name as string) ?? "")
    setDueDate((plan.dueDate as string) ?? (plan.due_date as string) ?? "")
    setPriority(((plan.priority as string) ?? "high") as "high" | "medium" | "low")
    const dep = (plan as ActionPlan).dependsOnPlanId ?? (plan.depends_on_plan_id as string | null)
    setDependsOn(dep ? String(dep) : "none")
  }, [plan])

  useEffect(() => {
    if (!open || !plan) return
    let alive = true
    const cur = String((plan as ActionPlan).id ?? plan.id ?? "")
    void api
      .get("/cockpit/action-plans")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        const rows = list
          .filter((p: { id: string }) => String(p.id) !== cur)
          .map((p: { id: string; title: string }) => ({ id: String(p.id), title: String(p.title ?? "") }))
        if (alive) setOtherPlans(rows)
      })
      .catch(() => {
        if (alive) setOtherPlans([])
      })
    return () => {
      alive = false
    }
  }, [open, plan])

  const priorityOptions = useMemo(
    () => [
      { value: "high" as const, label: "Alta", activeClass: "border-red-500 bg-red-50 text-red-600 font-bold" },
      { value: "medium" as const, label: "Média", activeClass: "border-amber-400 bg-amber-50 text-amber-600 font-bold" },
      { value: "low" as const, label: "Baixa", activeClass: "border-emerald-500 bg-emerald-50 text-emerald-600 font-bold" },
    ],
    []
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!plan) return
    if (!title.trim()) {
      toast.error("Informe o título do plano.")
      return
    }
    if (!area) {
      toast.error("Selecione o setor responsável.")
      return
    }
    if (!ownerName) {
      toast.error("Selecione o responsável.")
      return
    }
    if (!dueDate) {
      toast.error("Informe o prazo de entrega.")
      return
    }
    setSaving(true)
    try {
      await api.put(`/cockpit/action-plans/${plan.id}`, {
        title: title.trim(),
        area,
        owner_name: ownerName,
        due_date: dueDate,
        priority,
        depends_on_plan_id: dependsOn === "none" ? null : dependsOn,
      })
      toast.success("Plano atualizado com sucesso!")
      onOpenChange(false)
      onSaved?.()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao atualizar plano." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 p-0 sm:max-w-[480px] overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Editar Plano de Ação</DialogTitle>
        <DialogDescription className="sr-only">Formulário de edição</DialogDescription>
        <form onSubmit={submit}>
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">
                Editar Plano
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ajuste os dados do plano selecionado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Título do plano
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar automação de emails"
                className="h-11 bg-slate-50 text-sm dark:bg-muted/40"
                maxLength={200}
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Setor responsável
                </label>
                <Select value={area} onValueChange={setArea} disabled={!canEdit}>
                  <SelectTrigger className="h-11 bg-slate-50 text-sm dark:bg-muted/40">
                    <SelectValue placeholder="Selecione o setor" />
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Responsável
                </label>
                <Select value={ownerName} onValueChange={setOwnerName} disabled={!canEdit}>
                  <SelectTrigger className="h-11 bg-slate-50 text-sm dark:bg-muted/40">
                    <SelectValue placeholder="Escolha o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLABORATORS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Depende de (outro plano)
              </label>
              <Select value={dependsOn} onValueChange={setDependsOn} disabled={!canEdit}>
                <SelectTrigger className="h-11 bg-slate-50 text-sm dark:bg-muted/40">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {otherPlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title || p.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400">Opcional — conclua o plano predecessor primeiro.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prazo de entrega
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-11 bg-slate-50 text-sm dark:bg-muted/40"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prioridade
                </label>
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPriority(opt.value)}
                      disabled={!canEdit}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors disabled:opacity-50",
                        priority === opt.value
                          ? opt.activeClass
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-slate-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-border">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 bg-emerald-950 px-6 text-white hover:bg-emerald-900"
              disabled={!canEdit || saving}
            >
              {saving ? "Salvando…" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

