"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MEETING_STATUS_LABELS } from "@/lib/cockpit/constants"
import api from "@/utils/api"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

type Ritual = { id: string; name: string }
type Meeting = {
  id: string
  ritualId: string
  date: string
  status: string
  minutes: string
  topics: string[]
}

type Plan = { id: string; title: string; ownerName: string; dueDate: string }

function normalizeRitual(r: Record<string, unknown>): Ritual {
  return { id: String(r.id ?? ""), name: (r.name as string) ?? "" }
}

function normalizeMeeting(m: Record<string, unknown>): Meeting {
  const ata = m.ata as { minutes?: string } | null | undefined
  const occurred = m.occurred_at as string | Date | undefined
  const dateStr =
    occurred != null
      ? typeof occurred === "string"
        ? occurred.slice(0, 10)
        : new Date(occurred).toISOString().slice(0, 10)
      : ""
  return {
    id: String(m.id ?? ""),
    ritualId: String(m.ritual_id ?? m.ritualId ?? ""),
    date: dateStr,
    status: String(m.state ?? m.status ?? "scheduled"),
    minutes: ata?.minutes ?? (typeof m.minutes === "string" ? m.minutes : ""),
    topics: Array.isArray(m.topics) ? (m.topics as string[]) : [],
  }
}

function normalizePlan(p: Record<string, unknown>): Plan {
  return {
    id: String(p.id ?? ""),
    title: (p.title as string) ?? "",
    ownerName: (p.owner_name as string) ?? (p.ownerName as string) ?? "",
    dueDate: (p.due_date as string) ?? (p.dueDate as string) ?? "",
  }
}

export default function ReuniaoDetailPage() {
  const params = useParams()
  const rawR = params?.id
  const rawM = params?.meetingId
  const ritualId = typeof rawR === "string" ? rawR.trim() : ""
  const meetingId = typeof rawM === "string" ? rawM.trim() : ""

  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("scheduled")
  const [minutes, setMinutes] = useState("")

  useEffect(() => {
    if (!ritualId || !meetingId) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [ritualRes, meetingRes, plansRes] = await Promise.all([
          api.get(`/cockpit/rituals/${ritualId}`),
          api.get(`/cockpit/meetings/${meetingId}`),
          api.get("/cockpit/action-plans", { params: { meeting_id: meetingId } }),
        ])
        if (cancelled) return
        const r = normalizeRitual(ritualRes.data)
        const m = normalizeMeeting(meetingRes.data)
        setRitual(r)
        setMeeting(m)
        setStatus(m.status)
        setMinutes(m.minutes)
        setPlans(((plansRes.data ?? []) as Record<string, unknown>[]).map(normalizePlan))
      } catch { /* not found */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [ritualId, meetingId])

  if (loading) {
    return (
      <>
        <Header title="Carregando reunião..." />
        <main className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (!ritual || !meeting || meeting.ritualId !== ritual.id) {
    return (
      <>
        <Header title="Reunião não encontrada" />
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro não encontrado</CardTitle>
              <CardDescription>Verifique o ritual e o ID da reunião.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/cockpit/rituais">Voltar aos rituais</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const handleSaveMinutes = async () => {
    try {
      await api.post(`/cockpit/meetings/${meeting.id}/ata`, { minutes })
      toast.success("Ata salva com sucesso")
    } catch {
      toast.error("Erro ao salvar ata")
    }
  }

  return (
    <>
      <Header
        title={`Reunião · ${ritual.name}`}
        description={new Date(meeting.date + "T12:00:00").toLocaleDateString("pt-BR")}
      />
      <main className={COCKPIT_MAIN_CLASS}>
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href={`/cockpit/rituais/${ritual.id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao ritual
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="done">Encerrada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="not_tracked">Não rastreada</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Atual: {MEETING_STATUS_LABELS[meeting.status] ?? meeting.status} (servidor)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tópicos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {meeting.topics?.length
                  ? meeting.topics.map((t) => <li key={t}>{t}</li>)
                  : "—"}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Ata</CardTitle>
              <CardDescription>Última versão.</CardDescription>
            </div>
            <Button size="sm" onClick={handleSaveMinutes}>
              Salvar ata
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[220px]"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planos de ação desta reunião</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum plano vinculado.</p>
            ) : (
              plans.map((p) => (
                <div key={p.id} className="rounded-lg border px-3 py-2 text-sm">
                  <span className="font-medium">{p.title}</span>
                  <p className="text-muted-foreground">{p.ownerName} · {p.dueDate}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
