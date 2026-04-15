"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiStatusBadge } from "@/components/cockpit/kpi-status-badge"
import { MEETING_STATUS_LABELS } from "@/lib/cockpit/constants"
import { CreateMeetingDialog } from "@/components/cockpit/dialogs/create-meeting-dialog"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Play, Settings } from "lucide-react"
import api from "@/utils/api"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"

type Kpi = {
  id: number
  code: string
  name: string
  area: string
  unit: string
  goal: number
  current: number
  trend: string
  status: string
}

type Meeting = {
  id: number
  ritualId: number
  date: string
  status: string
  minutes: string
  topics: string[]
}

type Ritual = {
  id: number
  name: string
  area: { slug: string; name: string }
  ownerName: string
}

type Plan = {
  id: number
  title: string
  status: string
}

function normalizeRitual(r: Record<string, unknown>): Ritual {
  const area = r.area as Record<string, unknown> | undefined
  return {
    id: r.id as number,
    name: (r.name as string) ?? "",
    area: {
      slug: (area?.slug as string) ?? (r.area_slug as string) ?? "",
      name: (area?.name as string) ?? (r.area_name as string) ?? "",
    },
    ownerName: (r.owner_name as string) ?? (r.ownerName as string) ?? "",
  }
}

function normalizeMeeting(m: Record<string, unknown>): Meeting {
  return {
    id: m.id as number,
    ritualId: (m.ritual_id as number) ?? (m.ritualId as number) ?? 0,
    date: (m.date as string) ?? "",
    status: (m.status as string) ?? "scheduled",
    minutes: (m.minutes as string) ?? "",
    topics: (m.topics as string[]) ?? [],
  }
}

function normalizeKpi(k: Record<string, unknown>): Kpi {
  return {
    id: k.id as number,
    code: (k.code as string) ?? "",
    name: (k.name as string) ?? "",
    area: (k.area as string) ?? "",
    unit: (k.unit as string) ?? "",
    goal: (k.goal as number) ?? 0,
    current: (k.current as number) ?? 0,
    trend: (k.trend as string) ?? "flat",
    status: (k.status as string) ?? "empty",
  }
}

function normalizePlan(p: Record<string, unknown>): Plan {
  return {
    id: p.id as number,
    title: (p.title as string) ?? "",
    status: (p.status as string) ?? "planned",
  }
}

function formatKpi(k: Kpi) {
  if (k.unit === "R$") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(k.current)
  }
  return `${k.current}${k.unit === "%" ? "%" : ""}`
}

export default function RitualDetailPage() {
  const params = useParams()
  const router = useRouter()
  const raw = params?.id
  const id = typeof raw === "string" ? Number(raw) : NaN

  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [kpis, setKpis] = useState<Kpi[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!Number.isFinite(id)) return
    setLoading(true)
    try {
      const [ritualRes, meetingsRes, plansRes] = await Promise.all([
        api.get(`/cockpit/rituals/${id}`),
        api.get("/cockpit/meetings", { params: { ritual_id: id } }),
        api.get("/cockpit/action-plans", { params: { ritual_id: id } }),
      ])
      const r = normalizeRitual(ritualRes.data)
      setRitual(r)
      const mList = ((meetingsRes.data ?? []) as Record<string, unknown>[])
        .map(normalizeMeeting)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      setMeetings(mList)
      setPlans(((plansRes.data ?? []) as Record<string, unknown>[]).map(normalizePlan))

      // Fetch KPIs for the ritual's area
      if (r.area.slug) {
        const kpiRes = await api.get("/cockpit/kpis", { params: { area: r.area.slug } })
        setKpis(((kpiRes.data ?? []) as Record<string, unknown>[]).map(normalizeKpi))
      }
    } catch {
      toast.error("Ritual não encontrado")
      router.replace("/cockpit/rituais")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (!Number.isFinite(id)) {
      toast.error("Ritual não encontrado")
      router.replace("/cockpit/rituais")
      return
    }
    void fetchData()
  }, [id, fetchData, router])

  if (loading) {
    return (
      <>
        <Header title="Carregando ritual..." />
        <main className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (!ritual) return null

  const latest = meetings[0]

  return (
    <>
      <Header
        title={ritual.name}
        description={`${ritual.area.name} · ${ritual.ownerName}`}
      />
      <main className={COCKPIT_MAIN_CLASS}>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/cockpit/rituais/${ritual.id}/reunioes/${latest?.id ?? 0}/sessao`}>
              <Play className="mr-1 h-4 w-4" />
              Iniciar reunião
            </Link>
          </Button>
          <CreateMeetingDialog ritualId={ritual.id} onCreated={() => void fetchData()} />
          <Button variant="outline" size="sm" disabled>
            <Settings className="mr-1 h-4 w-4" />
            Configurações
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="kpis">KPIs vinculados</TabsTrigger>
            <TabsTrigger value="history">Histórico de reuniões</TabsTrigger>
            <TabsTrigger value="plans">Planos de ação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">KPIs do ritual</CardTitle>
                  <CardDescription>Valor mais recente vs meta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kpis.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum KPI para esta área.</p>
                  ) : (
                    kpis.map((k) => (
                      <div key={k.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{k.name}</span>
                          <KpiStatusBadge status={k.status as "above" | "attention" | "critical" | "empty"} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Atual {formatKpi(k)} · Meta{" "}
                          {k.unit === "R$"
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                maximumFractionDigits: 0,
                              }).format(k.goal)
                            : k.goal}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Ata (última reunião)</CardTitle>
                  <CardDescription>
                    {latest
                      ? new Date(latest.date + "T12:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[200px]"
                    defaultValue={latest?.minutes ?? ""}
                    placeholder="Nenhuma ata registrada."
                    readOnly
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Planos de ação</CardTitle>
                  <CardDescription>Vinculados a este ritual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plans.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum plano.</p>
                  ) : (
                    plans.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{p.title}</span>
                        <Badge variant="outline" className="w-fit">
                          {p.status}
                        </Badge>
                      </div>
                    ))
                  )}
                  <Button variant="link" className="h-auto px-0" asChild>
                    <Link href="/cockpit/planos-de-acao">Ver todos os planos</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Lista detalhada de KPIs vinculados ao ritual virá da API.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reuniões anteriores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(m.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {MEETING_STATUS_LABELS[m.status] ?? m.status}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/cockpit/rituais/${ritual.id}/reunioes/${m.id}`}>Abrir</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardContent className="pt-6">
                <Button asChild>
                  <Link href="/cockpit/planos-de-acao">Abrir planos de ação</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
