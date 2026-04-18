"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateActionPlanDialog } from "@/components/cockpit/dialogs/create-action-plan-dialog"
import api from "@/utils/api"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Clock, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Ritual = { id: string; name: string }
type Meeting = { id: string; ritualId: string; date: string; status: string; minutes: string }
type Plan = { id: string; title: string; status: string; ritualId: string | null }

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
  }
}

function normalizePlan(p: Record<string, unknown>): Plan {
  const rid = p.ritual_id ?? p.ritualId
  return {
    id: String(p.id ?? ""),
    title: (p.title as string) ?? "",
    status: (p.status as string) ?? "planned",
    ritualId: rid != null && rid !== "" ? String(rid) : null,
  }
}

export default function SessaoReuniaoPage() {
  const params = useParams()
  const rawR = params?.id
  const rawM = params?.meetingId
  const ritualIdStr = typeof rawR === "string" ? rawR.trim() : ""
  const meetingIdStr = typeof rawM === "string" ? rawM.trim() : ""

  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [minutes, setMinutes] = useState("")
  const [kpiVal, setKpiVal] = useState("1150000")

  useEffect(() => {
    if (!ritualIdStr || !meetingIdStr) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [ritualRes, meetingRes, plansRes] = await Promise.all([
          api.get(`/cockpit/rituals/${ritualIdStr}`),
          api.get(`/cockpit/meetings/${meetingIdStr}`),
          api.get("/cockpit/action-plans", { params: { ritual_id: ritualIdStr } }),
        ])
        if (cancelled) return
        setRitual(normalizeRitual(ritualRes.data))
        const m = normalizeMeeting(meetingRes.data)
        setMeeting(m)
        setMinutes(m.minutes)
        setPlans(((plansRes.data ?? []) as Record<string, unknown>[]).map(normalizePlan))
      } catch { /* not found */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [ritualIdStr, meetingIdStr])

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  if (loading) {
    return (
      <>
        <Header title="Carregando sessão..." />
        <main className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (!ritual || !meeting || meeting.ritualId !== ritual.id) {
    return (
      <>
        <Header title="Sessão não encontrada" />
        <main className="p-6">
          <Button asChild variant="secondary">
            <Link href="/cockpit/rituais">Voltar</Link>
          </Button>
        </main>
      </>
    )
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const ss = String(elapsed % 60).padStart(2, "0")

  return (
    <>
      <Header
        title={`Sessão ao vivo · ${ritual.name}`}
        description="Layout otimizado para reunião."
      />
      <main className={COCKPIT_MAIN_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/cockpit/rituais/${ritual.id}/reunioes/${meeting.id}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Sair da sessão
              </Link>
            </Button>
            <Badge variant="default" className="uppercase">
              Em andamento
            </Badge>
          </div>
          <div className="flex items-center gap-2 font-mono text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {mm}:{ss}
          </div>
          <Button
            onClick={() => toast.success("Reunião encerrada (simulação)")}
            variant="destructive"
          >
            Encerrar reunião
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KPIs (atualização rápida)</CardTitle>
                <CardDescription>Exemplo: receita — integração com POST /kpis/:id/results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="grid flex-1 gap-1">
                    <span className="text-xs text-muted-foreground">Receita líquida (R$)</span>
                    <Input value={kpiVal} onChange={(e) => setKpiVal(e.target.value)} />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.success("Valor registrado (mock)")}
                  >
                    Registrar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Ata</CardTitle>
                  <CardDescription>Autosave ao conectar na API</CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">Salvo há 0s</span>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[240px]"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="Registros da reunião..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Presença</CardTitle>
                <CardDescription>Checklist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Ana", "Bruno", "Carla"].map((name) => (
                  <label key={name} className="flex items-center gap-2 text-sm">
                    <Checkbox defaultChecked={name !== "Carla"} />
                    {name}
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Planos de ação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plans.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border px-2 py-2 text-sm">
                    <span className="truncate">{p.title}</span>
                    <Select defaultValue={p.status}>
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planejado</SelectItem>
                        <SelectItem value="in_progress">Em execução</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <CreateActionPlanDialog
                  trigger={
                    <Button variant="outline" className="w-full" size="sm" type="button">
                      Novo plano de ação
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
