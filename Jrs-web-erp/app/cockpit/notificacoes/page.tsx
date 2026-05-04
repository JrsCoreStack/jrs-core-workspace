"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  Bell,
  CheckCheck,
  Settings,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Monitor,
  Activity,
  ClipboardList,
  Users,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState, useCallback } from "react"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"

/* ─── Types ─── */
type NotifType = "info" | "warning" | "danger" | "success"
type NotifSource = "PLANOS" | "RITUAIS" | "KPIS" | "CALENDARIO" | "SISTEMA" | "MENCOES"

type Notificacao = {
  id: string
  title: string
  message: string
  type: NotifType
  source: NotifSource
  createdAt: string
  read: boolean
  href?: string
  linkLabel?: string
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

/* ─── Mappers ─── */
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

/* ─── Date helpers ─── */
function getDateGroup(iso: string): "hoje" | "ontem" | "semana" | "antigas" {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) return "hoje"
  if (diffDays === 1) return "ontem"
  if (diffDays <= 7) return "semana"
  return "antigas"
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

/* ─── Icon & color per type ─── */
function typeConfig(t: NotifType, src: NotifSource) {
  if (t === "danger")
    return {
      Icon: TrendingDown,
      iconBg: "bg-destructive/10 text-destructive",
      border: "border-l-destructive",
      dot: "bg-destructive",
    }
  if (t === "warning")
    return {
      Icon: AlertTriangle,
      iconBg: "bg-amber-500/10 text-amber-500",
      border: "border-l-amber-500",
      dot: "bg-amber-500",
    }
  if (t === "success")
    return {
      Icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      border: "border-l-emerald-500",
      dot: "bg-emerald-500",
    }
  // info — source-specific icon
  const srcIcons: Record<NotifSource, React.FC<{ className?: string }>> = {
    RITUAIS: ({ className }) => <Users className={className} />,
    KPIS: ({ className }) => <Activity className={className} />,
    PLANOS: ({ className }) => <ClipboardList className={className} />,
    CALENDARIO: ({ className }) => <Clock className={className} />,
    MENCOES: ({ className }) => <MessageSquare className={className} />,
    SISTEMA: ({ className }) => <Monitor className={className} />,
  }
  return {
    Icon: srcIcons[src] ?? (({ className }) => <Bell className={className} />),
    iconBg: "bg-primary/10 text-primary",
    border: "border-l-primary",
    dot: "bg-primary",
  }
}

/* ─── Tab types ─── */
type Tab = "todas" | "nao_lidas" | "RITUAIS" | "KPIS" | "PLANOS" | "MENCOES" | "SISTEMA"

const TABS: { id: Tab; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nao_lidas", label: "Não lidas" },
  { id: "RITUAIS", label: "Rituais" },
  { id: "KPIS", label: "KPIs" },
  { id: "PLANOS", label: "Planos" },
  { id: "MENCOES", label: "Menções" },
  { id: "SISTEMA", label: "Sistema" },
]

/* ─── Date group label ─── */
function DateLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

/* ─── Notification card ─── */
function NotifCard({
  n,
  onToggleRead,
}: {
  n: Notificacao
  onToggleRead: (id: string, current: boolean) => void
}) {
  const cfg = typeConfig(n.type, n.source)
  const group = getDateGroup(n.createdAt)
  const timeLabel =
    group === "hoje"
      ? `Hoje · ${fmtTime(n.createdAt)}`
      : group === "ontem"
        ? `Ontem · ${fmtTime(n.createdAt)}`
        : `${fmtDate(n.createdAt)} · ${fmtTime(n.createdAt)}`

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm",
        "border-l-[3px]",
        cfg.border,
        n.read && "opacity-65"
      )}
    >
      {!n.read && (
        <span
          className={cn("absolute right-4 top-4 h-2 w-2 rounded-full", cfg.dot)}
        />
      )}

      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          cfg.iconBg
        )}
      >
        <cfg.Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-semibold leading-snug text-card-foreground">
          {n.title}
        </p>
        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
          {n.message}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {timeLabel}
          </span>
          {n.href && (
            <Link
              href={n.href}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {n.linkLabel?.trim() || "Abrir"} →
            </Link>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 self-start px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onToggleRead(n.id, n.read)}
      >
        <CheckCheck className="h-3.5 w-3.5" />
        {n.read ? "Não lida" : "Lida"}
      </Button>
    </div>
  )
}

/* ─── Empty state ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
        <Bell className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <p className="mb-1.5 font-semibold text-foreground">Tudo em dia</p>
      <p className="max-w-[240px] text-sm text-muted-foreground">
        Você não tem notificações pendentes. Continue acompanhando os rituais e KPIs.
      </p>
    </div>
  )
}

/* ─── Main component ─── */
export default function CockpitNotificacoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("todas")
  const [items, setItems] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [staleRunning, setStaleRunning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiNotification[]>("/cockpit/notifications", {
        params: { limit: 300 },
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
      toastApiError(e, { fallback: "Erro ao carregar notificações." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (activeTab === "todas") return items
    if (activeTab === "nao_lidas") return items.filter((n) => !n.read)
    return items.filter((n) => n.source === activeTab)
  }, [items, activeTab])

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items])

  const grouped = useMemo(() => {
    const groups: Record<string, Notificacao[]> = {
      hoje: [],
      ontem: [],
      semana: [],
      antigas: [],
    }
    for (const n of filtered) {
      groups[getDateGroup(n.createdAt)]?.push(n)
    }
    return groups
  }, [filtered])

  const groupOrder = ["hoje", "ontem", "semana", "antigas"]
  const groupLabels: Record<string, string> = {
    hoje: "Hoje",
    ontem: "Ontem",
    semana: "Esta semana",
    antigas: "Mais antigas",
  }

  async function handleToggleRead(id: string, current: boolean) {
    try {
      await api.patch(`/cockpit/notifications/${id}/${current ? "unread" : "read"}`)
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !current } : n))
      )
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao atualizar notificação." })
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.post("/cockpit/notifications/mark-all-read")
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success("Todas as notificações marcadas como lidas.")
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao marcar notificações." })
    }
  }

  async function handleStaleCheck() {
    setStaleRunning(true)
    try {
      const { data } = await api.post<{
        scanned: number
        staleUpdated: number
        notificationsCreated: number
      }>("/cockpit/kpis/stale-check")
      toast.success(
        `KPIs verificados: ${data.scanned}. ${data.notificationsCreated} novo(s) lembrete(s).`
      )
      await load()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao verificar KPIs em atraso." })
    } finally {
      setStaleRunning(false)
    }
  }

  const hasAny = groupOrder.some((g) => (grouped[g]?.length ?? 0) > 0)

  return (
    <>
      <style>{`
        .notif-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px 14px;
          background: var(--rf-bg-surface, #fff);
          border-bottom: 1px solid var(--rf-border-subtle, rgba(0,0,0,0.05));
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .notif-topbar-left { display: flex; align-items: center; gap: 12px; }
        .notif-page-title {
          font-family: var(--font-syne, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px;
          font-weight: 600;
          color: var(--rf-text-primary, #0d0f14);
          letter-spacing: -0.2px;
        }
        .notif-page-sub { font-size: 12px; color: var(--rf-text-secondary, #5a6478); margin-top: 3px; }
        .notif-topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .notif-btn {
          padding: 7px 14px; border-radius: 12px;
          font-family: var(--rf-font-body, sans-serif); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          border: none; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--rf-bg-elevated); color: var(--rf-text-secondary);
          border: 1px solid var(--rf-border-default);
          text-decoration: none;
        }
        .notif-btn:hover { border-color: var(--rf-border-strong); color: var(--rf-text-primary); }
        .notif-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="notif-topbar">
        <div className="notif-topbar-left">
          <div>
            <h1 className="notif-page-title">Notificações</h1>
            <p className="notif-page-sub">
              {unreadCount > 0
                ? `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`
                : "Tudo em dia"}
            </p>
          </div>
        </div>
        <div className="notif-topbar-right">
          <button
            className="notif-btn"
            disabled={staleRunning}
            onClick={handleStaleCheck}
          >
            <RefreshCw style={{ width: 13, height: 13 }} className={staleRunning ? "animate-spin" : ""} />
            Verificar KPIs
          </button>
          {unreadCount > 0 && (
            <button className="notif-btn" onClick={handleMarkAllRead}>
              <CheckCheck style={{ width: 13, height: 13 }} />
              Marcar todas como lidas
            </button>
          )}
          <Link href="/cockpit/notificacoes/configurar" className="notif-btn">
            <Settings style={{ width: 13, height: 13 }} />
            Configurar
          </Link>
        </div>
      </div>

      <main className={COCKPIT_MAIN_CLASS}>
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 scrollbar-hide">
          {TABS.map((tab) => {
            const count =
              tab.id === "todas"
                ? items.length
                : tab.id === "nao_lidas"
                  ? unreadCount
                  : items.filter((n) => n.source === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "min-w-[18px] rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      activeTab === tab.id && tab.id === "nao_lidas"
                        ? "bg-primary text-primary-foreground"
                        : activeTab === tab.id
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="mb-3 h-6 w-6 animate-spin text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Carregando…</p>
          </div>
        ) : !hasAny ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {groupOrder.map((group) => {
              const groupItems = grouped[group] ?? []
              if (groupItems.length === 0) return null
              return (
                <div key={group} className="space-y-2.5">
                  <DateLabel label={groupLabels[group]!} />
                  {groupItems.map((n) => (
                    <NotifCard key={n.id} n={n} onToggleRead={handleToggleRead} />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
