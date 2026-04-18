"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiStatusBadge } from "@/components/cockpit/kpi-status-badge"
import api from "@/utils/api"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

type Kpi = {
  id: string
  code: string
  name: string
  area: string
  unit: string
  goal: number
  current: number
  trend: string
  status: string
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function normalizeKpi(raw: Record<string, unknown>): Kpi {
  const codeRef = raw.code_ref ?? raw.code
  return {
    id: String(raw.id ?? ""),
    code: typeof codeRef === "string" ? codeRef : codeRef != null ? String(codeRef) : "",
    name: (raw.name as string) ?? "",
    area: (raw.area as string) ?? "",
    unit: (raw.unit as string) ?? "",
    goal: num(raw.month_goal ?? raw.goal),
    current: num(raw.current_value ?? raw.current),
    trend: (raw.trend as string) ?? "flat",
    status: (raw.status as string) ?? "empty",
  }
}

export default function CockpitKpiDetailPage() {
  const params = useParams()
  const raw = params?.id
  const idStr = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : ""

  const [kpi, setKpi] = useState<Kpi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!idStr) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get(`/cockpit/kpis/${idStr}`)
        if (!cancelled) setKpi(normalizeKpi(res.data))
      } catch { /* not found */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [idStr])

  if (loading) {
    return (
      <>
        <Header title="Carregando KPI..." />
        <main className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </>
    )
  }

  if (!kpi) {
    return (
      <>
        <Header title="KPI não encontrado" />
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicador não encontrado</CardTitle>
              <CardDescription>O ID informado não existe.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/cockpit/kpis">Voltar para lista</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const dev =
    kpi.goal === 0 ? 0 : ((kpi.current - kpi.goal) / Math.abs(kpi.goal)) * 100

  return (
    <>
      <Header
        title={kpi.name}
        description={`${kpi.code} · ${kpi.area}`}
      />
      <main className={COCKPIT_MAIN_CLASS}>
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href="/cockpit/kpis">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Lista de KPIs
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Valores do período.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Resultado atual</p>
                <p className="text-2xl font-semibold">
                  {kpi.unit === "R$"
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(kpi.current)
                    : `${kpi.current}${kpi.unit === "%" ? "%" : ""}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta</p>
                <p className="text-2xl font-semibold">
                  {kpi.unit === "R$"
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(kpi.goal)
                    : `${kpi.goal}${kpi.unit === "%" ? "%" : ""}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Desvio</p>
                <p
                  className={
                    dev >= 0
                      ? "text-2xl font-semibold text-emerald-600"
                      : "text-2xl font-semibold text-red-600"
                  }
                >
                  {dev >= 0 ? "+" : ""}
                  {dev.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <KpiStatusBadge status={kpi.status as "above" | "attention" | "critical" | "empty"} />
              <p className="text-sm text-muted-foreground">
                Histórico e gráficos serão carregados da API.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico (placeholder)</CardTitle>
            <CardDescription>
              Gráfico de linha com Recharts após o backend expor séries temporais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Área do gráfico
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
