"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import api from "@/utils/api"
import { toast } from "sonner"
import {
  getApiErrorMessage,
  getApiErrorStatus,
  isNormalizedApiError,
  toastApiError,
} from "@/lib/cockpit/api-error"

type NotifType = "info" | "warning" | "danger" | "success"
type NotifSource = "PLANOS" | "RITUAIS" | "KPIS" | "CALENDARIO" | "SISTEMA"

type Notificacao = {
  id: string
  title: string
  message: string
  type: NotifType
  source: NotifSource
  createdAt: string // ISO
  read: boolean
  href?: string
  linkLabel?: string
}

function fmtRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60000)
  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH} h`
  const diffD = Math.round(diffH / 24)
  return `${diffD} d`
}

function typeMeta(t: NotifType) {
  if (t === "success")
    return { Icon: CheckCircle2, dot: "bg-primary", ring: "bg-primary/10 text-primary ring-1 ring-primary/20" }
  if (t === "warning")
    return { Icon: AlertTriangle, dot: "bg-amber-500", ring: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" }
  if (t === "danger")
    return { Icon: XCircle, dot: "bg-destructive", ring: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" }
  return { Icon: Info, dot: "bg-chart-2", ring: "bg-chart-2/10 text-chart-2 ring-1 ring-border" }
}

type ApiNotification = {
  id: string
  title: string
  message: string
  severity: "critical" | "alert" | "info"
  source: "action_plan" | "kpi" | "ritual" | "meeting" | "calendar" | "system"
  link_url: string | null
  link_label: string | null
  is_read: boolean
  created_at: string
}

function mapSource(s: ApiNotification["source"]): NotifSource {
  if (s === "action_plan") return "PLANOS"
  if (s === "ritual" || s === "meeting") return "RITUAIS"
  if (s === "kpi") return "KPIS"
  if (s === "calendar") return "CALENDARIO"
  return "SISTEMA"
}

function mapType(sev: ApiNotification["severity"]): NotifType {
  if (sev === "critical") return "danger"
  if (sev === "alert") return "warning"
  return "info"
}

export default function CockpitNotificacoesPage() {
  const [q, setQ] = useState("")
  const [source, setSource] = useState<"all" | NotifSource>("all")
  const [type, setType] = useState<"all" | NotifType>("all")
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [loading, setLoading] = useState(true)
  const [staleRunning, setStaleRunning] = useState(false)
  const [items, setItems] = useState<Notificacao[]>([])

  async function refresh() {
    setLoading(true)
    try {
      const res = await api.get<ApiNotification[]>("/cockpit/notifications", {
        params: {
          q: q.trim() || undefined,
          source:
            source === "all"
              ? undefined
              : source === "PLANOS"
                ? "action_plan"
                : source === "RITUAIS"
                  ? "ritual"
                  : source === "KPIS"
                    ? "kpi"
                    : source === "CALENDARIO"
                      ? "calendar"
                      : "system",
          severity:
            type === "all"
              ? undefined
              : type === "danger"
                ? "critical"
                : type === "warning"
                  ? "alert"
                  : "info",
          only_unread: onlyUnread ? "true" : undefined,
          limit: 300,
        },
      })

      setItems(
        (res.data ?? []).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: mapType(n.severity),
          source: mapSource(n.source),
          createdAt: n.created_at,
          read: !!n.is_read,
          href: n.link_url ?? undefined,
          linkLabel: n.link_label ?? undefined,
        }))
      )
    } catch (e) {
      const status = getApiErrorStatus(e)
      const message = getApiErrorMessage(e, "Erro ao carregar notificações.")
      const payload = isNormalizedApiError(e) ? e.data : undefined
      console.error(
        "Erro ao carregar notificações:",
        status != null ? `HTTP ${status}` : "sem status",
        message,
        payload ?? e
      )
      toastApiError(e, { fallback: "Erro ao carregar notificações." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, source, type, onlyUnread])

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (onlyUnread && n.read) return false
      if (source !== "all" && n.source !== source) return false
      if (type !== "all" && n.type !== type) return false
      if (q.trim()) {
        const lq = q.toLowerCase()
        if (!n.title.toLowerCase().includes(lq) && !n.message.toLowerCase().includes(lq)) return false
      }
      return true
    })
  }, [items, onlyUnread, q, source, type])

  const counts = useMemo(() => {
    const unread = items.filter((i) => !i.read).length
    const danger = items.filter((i) => i.type === "danger").length
    const warning = items.filter((i) => i.type === "warning").length
    const info = items.filter((i) => i.type === "info").length
    return { unread, danger, warning, info }
  }, [items])

  return (
    <>
      <Header
        title="Notificações"
        description="Veja alertas de prazos, bloqueios e mudanças importantes nos planos de ação"
        actions={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={staleRunning}
              onClick={async () => {
                setStaleRunning(true)
                try {
                  const { data } = await api.post<{
                    scanned: number
                    staleUpdated: number
                    notificationsCreated: number
                  }>("/cockpit/kpis/stale-check")
                  toast.success(
                    `KPIs verificados: ${data.scanned}. ${data.notificationsCreated} novo(s) lembrete(s) de lançamento.`
                  )
                  await refresh()
                } catch (e) {
                  toastApiError(e, { fallback: "Erro ao verificar KPIs em atraso." })
                } finally {
                  setStaleRunning(false)
                }
              }}
            >
              <RefreshCw className={cn("h-4 w-4", staleRunning && "animate-spin")} />
              Verificar KPIs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={async () => {
                await api.post("/cockpit/notifications/mark-all-read")
                await refresh()
              }}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={async () => {
                await api.delete("/cockpit/notifications/clear")
                await refresh()
              }}
            >
              <Trash2 className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        }
      />
      <main className={COCKPIT_MAIN_CLASS}>
        {/* Resumo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Não lidas", value: counts.unread, color: "#22c55e", Icon: Bell },
            { label: "Críticas", value: counts.danger, color: "#ef4444", Icon: XCircle },
            { label: "Alertas", value: counts.warning, color: "#f59e0b", Icon: AlertTriangle },
            { label: "Informativas", value: counts.info, color: "#06b6d4", Icon: Info },
          ].map((c) => (
            <Card key={c.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: c.color }}>
                      {c.value}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: c.color + "18" }}>
                    <c.Icon className="h-6 w-6" style={{ color: c.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-3 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Filtros
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} itens)
              </span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => {
                  setQ("")
                  setSource("all")
                  setType("all")
                  setOnlyUnread(false)
                }}
              >
                <Filter className="h-4 w-4" />
                Limpar filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => void refresh()}
              >
                <Clock className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar..."
                  className="bg-background pl-9"
                />
              </div>

              <Select
                value={source}
                onValueChange={(v) => setSource(v as "all" | NotifSource)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="PLANOS">Planos de Ação</SelectItem>
                  <SelectItem value="RITUAIS">Rituais</SelectItem>
                  <SelectItem value="KPIS">KPIs</SelectItem>
                  <SelectItem value="CALENDARIO">Calendário</SelectItem>
                  <SelectItem value="SISTEMA">Sistema</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={type}
                onValueChange={(v) => setType(v as "all" | NotifType)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="danger">Crítico</SelectItem>
                  <SelectItem value="warning">Alerta</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                <Label className="text-sm text-muted-foreground">Apenas não lidas</Label>
                <Switch checked={onlyUnread} onCheckedChange={setOnlyUnread} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-2 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Central
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} notificações)
              </span>
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              <Clock className="mr-1 inline-block h-3.5 w-3.5" />
              Atualizado agora
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Clock className="h-12 w-12 text-muted-foreground/40" />
                <span>Carregando…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Bell className="h-12 w-12 text-muted-foreground/40" />
                <span>Nenhuma notificação encontrada</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => {
                    setQ("")
                    setSource("all")
                    setType("all")
                    setOnlyUnread(false)
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((n) => {
                  const meta = typeMeta(n.type)
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
                        !n.read && "ring-1 ring-primary/20"
                      )}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className={cn("mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg", meta.ring)}>
                          <meta.Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                                <span className="text-sm font-semibold text-foreground">{n.title}</span>
                                {!n.read && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                                    NOVA
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full bg-muted px-2 py-0.5 ring-1 ring-border">
                                  {n.source}
                                </span>
                                <span>·</span>
                                <span>{fmtRelative(n.createdAt)} atrás</span>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 bg-transparent"
                                onClick={async () => {
                                  await api.patch(`/cockpit/notifications/${n.id}/${n.read ? "unread" : "read"}`)
                                  await refresh()
                                }}
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                                {n.read ? "Não lida" : "Lida"}
                              </Button>

                              {n.href ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5">
                                  <Link href={n.href}>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {n.linkLabel?.trim() ? n.linkLabel : "Abrir"}
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

