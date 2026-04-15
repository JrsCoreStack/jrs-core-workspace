"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/utils/api"
import { toast } from "sonner"
import { toastApiError } from "@/lib/cockpit/api-error"
import { CalendarPlus } from "lucide-react"

type Props = {
  ritualId: string | number
  trigger?: React.ReactNode
  onCreated?: () => void
}

export function CreateMeetingDialog({ ritualId, trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState("")
  const [minutes, setMinutes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) {
      toast.error("Informe a data da reunião.")
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post("/cockpit/meetings", {
        ritual_id: String(ritualId),
        date,
        minutes: minutes.trim() || undefined,
        topics: [],
      })
      const created = res.data
      toast.success(`Reunião #${created?.id ?? ""} agendada`)
      setDate("")
      setMinutes("")
      setOpen(false)
      onCreated?.()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao agendar reunião." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <CalendarPlus className="mr-1 h-4 w-4" />
            Agendar reunião
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Nova reunião</DialogTitle>
            <DialogDescription>Cria uma instância do ritual na data escolhida.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cm-date">Data</Label>
              <Input
                id="cm-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cm-notes">Notas iniciais (opcional)</Label>
              <Textarea
                id="cm-notes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                rows={3}
                placeholder="Pauta ou contexto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
