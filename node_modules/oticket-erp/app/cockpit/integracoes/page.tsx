"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  LogoGoogleCalendar,
  LogoGoogleMark,
  LogoGoogleSheets,
  LogoMicrosoftTeams,
  LogoNotion,
  LogoRdStation,
  LogoSlack,
  LogoWhatsApp,
} from "@/components/cockpit/integracoes/integration-logos"
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  Loader2,
  Minus,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

type ConnStatus = "connected" | "disconnected" | "error"

type IntegrationId =
  | "google_calendar"
  | "slack"
  | "teams"
  | "whatsapp"
  | "google_sheets"
  | "notion"
  | "rd_station"
  | "webhook"

const WEBHOOK_URL = "https://api.suaempresa.com.br/webhooks/orbit"
const WEBHOOK_EVENTS = [
  "kpi.critical",
  "ritual.completed",
  "ritual.missed",
  "plan.overdue",
  "weekly.report",
]

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function StatusBadge({
  status,
  connectedLabel = "Conectado",
}: {
  status: ConnStatus
  connectedLabel?: string
}) {
  if (status === "connected") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {connectedLabel}
      </span>
    )
  }
  if (status === "error") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Erro
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      Desconectado
    </span>
  )
}

function FeatureLine({
  ok,
  children,
}: {
  ok: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs leading-snug",
        ok ? "text-muted-foreground" : "text-muted-foreground/55"
      )}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
      ) : (
        <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={2} />
      )}
      {children}
    </div>
  )
}

function FeatureLineError({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs leading-snug text-muted-foreground/55">
      <span className="text-destructive/80">✕</span>
      {children}
    </div>
  )
}

function IntegracoesInner() {
  const searchParams = useSearchParams()
  const [status, setStatus] = React.useState<Record<IntegrationId, ConnStatus>>(() => ({
    google_calendar: "connected",
    slack: "connected",
    teams: "disconnected",
    whatsapp: "disconnected",
    google_sheets: "disconnected",
    notion: "disconnected",
    rd_station: "disconnected",
    webhook: "connected",
  }))

  React.useEffect(() => {
    if (searchParams.get("demo") === "erro") {
      setStatus((s) => ({ ...s, google_calendar: "error" }))
    }
  }, [searchParams])

  const [gcalOpen, setGcalOpen] = React.useState(false)
  const [slackOpen, setSlackOpen] = React.useState(false)
  const [slackMode, setSlackMode] = React.useState<"connect" | "settings">("connect")
  const [genericOpen, setGenericOpen] = React.useState(false)
  const [genericName, setGenericName] = React.useState("")
  const [disconnectOpen, setDisconnectOpen] = React.useState(false)
  const [webhookCopied, setWebhookCopied] = React.useState(false)
  const [secretVisible, setSecretVisible] = React.useState(false)

  const [slackChannel, setSlackChannel] = React.useState("#orbit-alerts")
  const [slackSummaryTime, setSlackSummaryTime] = React.useState("Sexta-feira às 18:00")
  const [n1, setN1] = React.useState(true)
  const [n2, setN2] = React.useState(true)
  const [n3, setN3] = React.useState(true)
  const [n4, setN4] = React.useState(false)

  const connectedCount = React.useMemo(
    () =>
      (Object.entries(status) as [IntegrationId, ConnStatus][]).filter(
        ([id, s]) => id !== "webhook" && s === "connected"
      ).length,
    [status]
  )

  const availableCount = React.useMemo(
    () =>
      (Object.entries(status) as [IntegrationId, ConnStatus][]).filter(
        ([id, s]) => id !== "webhook" && s === "disconnected"
      ).length,
    [status]
  )

  const errorCount = React.useMemo(
    () =>
      (Object.values(status) as ConnStatus[]).filter((s) => s === "error").length,
    [status]
  )

  function openGeneric(name: string) {
    setGenericName(name)
    setGenericOpen(true)
  }

  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL)
      setWebhookCopied(true)
      toast.success("URL copiada.")
      setTimeout(() => setWebhookCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar.")
    }
  }

  const gcal = status.google_calendar
  const slack = status.slack

  return (
    <>
      <Header
        title="Integrações"
        description="Conecte o Orbit às ferramentas que sua equipe já usa."
      />

      <main className={COCKPIT_MAIN_CLASS}>
        {errorCount > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Atenção: {errorCount} integração(ões) com erro
                </p>
                <p className="mt-1 text-xs leading-relaxed text-destructive/85">
                  O Google Calendar perdeu a autenticação. Reconecte para restaurar a sincronização dos rituais.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setGcalOpen(true)}
            >
              Reconectar
            </Button>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {connectedCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Conectadas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-foreground">{availableCount}</p>
              <p className="text-[11px] text-muted-foreground">Disponíveis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-primary">Hoje 09:14</p>
              <p className="text-[11px] text-muted-foreground">Última sincronização</p>
            </div>
          </div>
        </div>

        {/* Calendário & Comunicação */}
        <section>
          <CategoryLabel>Calendário & Comunicação</CategoryLabel>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Google Calendar */}
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md",
                gcal === "connected" && "border-emerald-500/30",
                gcal === "error" && "border-destructive/40",
                gcal === "disconnected" && "border-border"
              )}
            >
              {gcal === "connected" && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-emerald-500 to-emerald-500/30" />
              )}
              {gcal === "error" && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-destructive" />
              )}
              <div className="mb-3.5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white dark:bg-white">
                    <LogoGoogleCalendar className="h-[26px] w-[26px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-bold text-foreground">
                      Google Calendar
                    </p>
                    <p className="text-[11px] text-muted-foreground">Calendário</p>
                  </div>
                </div>
                <StatusBadge status={gcal} />
              </div>

              {gcal === "error" && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Token de autenticação expirado. Última sync: 3 dias atrás.
                </div>
              )}

              <div className="mb-4 flex flex-col gap-1.5">
                {gcal === "error" ? (
                  <>
                    <FeatureLineError>Sincronização pausada</FeatureLineError>
                    <FeatureLineError>Lembretes não enviados</FeatureLineError>
                    <FeatureLineError>Links do Meet indisponíveis</FeatureLineError>
                  </>
                ) : (
                  <>
                    <FeatureLine ok={gcal === "connected"}>Sincronizar rituais como eventos</FeatureLine>
                    <FeatureLine ok={gcal === "connected"}>Lembrete 15 min antes da sessão</FeatureLine>
                    <FeatureLine ok={gcal === "connected"}>Link do Google Meet no convite</FeatureLine>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    gcal === "error" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-[#1a73e8] to-[#34a853] text-[8px] font-bold text-white">
                    C
                  </div>
                  {gcal === "error"
                    ? "carlos@empresa.com.br · token expirado"
                    : "carlos@empresa.com.br"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {gcal === "connected" && (
                    <span className="font-mono text-[10px] text-muted-foreground">Sync: 09:14</span>
                  )}
                  {gcal === "connected" && (
                    <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setDisconnectOpen(true)}>
                      Desconectar
                    </Button>
                  )}
                  {gcal === "disconnected" && (
                    <Button size="sm" onClick={() => setGcalOpen(true)}>
                      Conectar
                    </Button>
                  )}
                  {gcal === "error" && (
                    <Button size="sm" onClick={() => setGcalOpen(true)}>
                      Reconectar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Slack */}
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md",
                slack === "connected" ? "border-emerald-500/30" : "border-border"
              )}
            >
              {slack === "connected" && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-emerald-500 to-emerald-500/30" />
              )}
              <div className="mb-3.5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4A154B]">
                    <LogoSlack className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-bold text-foreground">
                      Slack
                    </p>
                    <p className="text-[11px] text-muted-foreground">Comunicação</p>
                  </div>
                </div>
                <StatusBadge status={slack} />
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <FeatureLine ok={slack === "connected"}>Alertas de KPI crítico no canal</FeatureLine>
                <FeatureLine ok={slack === "connected"}>Lembrete de ritual 30 min antes</FeatureLine>
                <FeatureLine ok={slack === "connected"}>Resumo semanal automático</FeatureLine>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4A154B] text-[8px] font-bold text-white">
                    O
                  </div>
                  workspace: orbit-team
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {slack === "connected" && (
                    <>
                      <span className="font-mono text-[10px] text-muted-foreground">Sync: 09:14</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => {
                          setSlackMode("settings")
                          setSlackOpen(true)
                        }}
                      >
                        Configurar
                      </Button>
                    </>
                  )}
                  {slack === "disconnected" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSlackMode("connect")
                        setSlackOpen(true)
                      }}
                    >
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Teams */}
            <IntegrationDisconnectedCard
              name="Microsoft Teams"
              category="Comunicação"
              footerHint="Não conectado"
              logo={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-[#5558AF]/15">
                  <LogoMicrosoftTeams className="h-[26px] w-[26px]" />
                </div>
              }
              features={["Notificações de KPI no canal", "Lembrete de ritual", "Resumo semanal"]}
              onConnect={() => openGeneric("Microsoft Teams")}
            />

            {/* WhatsApp */}
            <IntegrationDisconnectedCard
              name="WhatsApp Business"
              category="Comunicação"
              footerHint="Requer WhatsApp Business API"
              logo={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-[#25D366]/10">
                  <LogoWhatsApp className="h-[26px] w-[26px]" />
                </div>
              }
              features={[
                "Alertas de KPI crítico via mensagem",
                "Lembrete de ritual para participantes",
                "Resumo semanal para gestores",
              ]}
              onConnect={() => openGeneric("WhatsApp Business")}
            />
          </div>
        </section>

        {/* Produtividade */}
        <section>
          <CategoryLabel>Produtividade & Dados</CategoryLabel>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <IntegrationDisconnectedCard
              name="Google Sheets"
              category="Exportação de dados"
              footerHint="Não conectado"
              logo={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white dark:bg-white">
                  <LogoGoogleSheets className="h-[26px] w-[26px]" />
                </div>
              }
              features={[
                "Exportar KPIs automaticamente",
                "Planilha atualizada a cada sessão",
                "Histórico completo de registros",
              ]}
              onConnect={() => openGeneric("Google Sheets")}
            />
            <IntegrationDisconnectedCard
              name="Notion"
              category="Sincronização de planos"
              footerHint="Não conectado"
              logo={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white dark:bg-white">
                  <LogoNotion className="h-[26px] w-[26px]" />
                </div>
              }
              features={["Sincronizar planos de ação", "Exportar atas de reuniões", "Dashboard de KPIs no Notion"]}
              onConnect={() => openGeneric("Notion")}
            />
          </div>
        </section>

        {/* CRM */}
        <section>
          <CategoryLabel>CRM</CategoryLabel>
          <div className="grid grid-cols-1">
            <IntegrationDisconnectedCard
              name="RD Station"
              category="CRM Comercial"
              footerHint="Requer API Key do RD Station"
              wide
              logo={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border">
                  <LogoRdStation className="h-[26px] w-[26px]" />
                </div>
              }
              features={[
                "Importar dados de receita e pipeline",
                "Atualizar KPIs comerciais automaticamente",
                "Sincronizar novos contratos e churn",
              ]}
              onConnect={() => openGeneric("RD Station")}
            />
          </div>
        </section>

        {/* Webhook */}
        <section>
          <CategoryLabel>Developer & API</CategoryLabel>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/50">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-[15px] font-bold text-foreground">
                    Webhook Personalizado
                  </p>
                  <p className="text-xs text-muted-foreground">Receba eventos do Orbit em qualquer URL</p>
                </div>
              </div>
              <StatusBadge
                status={status.webhook === "connected" ? "connected" : "disconnected"}
                connectedLabel="Ativo"
              />
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">URL do Webhook</p>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-xs text-muted-foreground">
                {WEBHOOK_URL}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("shrink-0 gap-1.5 bg-transparent", webhookCopied && "border-emerald-500/40 text-emerald-600")}
                onClick={copyWebhook}
              >
                {webhookCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {webhookCopied ? "Copiado" : "Copiar"}
              </Button>
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Eventos ativos</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <span
                  key={ev}
                  className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary"
                >
                  {ev}
                </span>
              ))}
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Chave secreta</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs tracking-widest text-muted-foreground">
                {secretVisible ? "whsec_orbit_demo_7f3a9c2b" : "••••••••••••••••••••••••••••••••"}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setSecretVisible((v) => !v)}>
                  {secretVisible ? "Ocultar" : "Revelar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => toast.success("Nova chave gerada (simulação).")}
                >
                  Regenerar
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Google Calendar */}
      <Dialog open={gcalOpen} onOpenChange={setGcalOpen}>
        <DialogContent className="max-w-[460px] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[460px]">
          <div className="h-1 bg-linear-to-r from-[#1a73e8] to-[#34a853]" />
          <div className="flex items-start justify-between gap-3 p-6 pb-2 pr-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white">
                <LogoGoogleCalendar className="h-[22px] w-[22px]" />
              </div>
              <DialogTitle className="font-display text-lg font-extrabold">Google Calendar</DialogTitle>
            </div>
          </div>
          <div className="space-y-4 px-6 pb-2">
            <DialogDescription className="text-left text-sm leading-relaxed">
              Conecte seu Google Calendar para sincronizar os rituais do Orbit como eventos e receber lembretes automáticos.
            </DialogDescription>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-center gap-2.5 border-border bg-muted/30 font-semibold"
              onClick={() => toast.message("Fluxo OAuth", { description: "Integração simulada — conecte o backend OAuth depois." })}
            >
              <LogoGoogleMark className="h-[18px] w-[18px]" />
              Entrar com Google
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">permissões necessárias</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-3.5 w-3.5" />
                </span>
                Criar e editar eventos no seu calendário
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-3.5 w-3.5" />
                </span>
                Visualizar eventos existentes
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                Enviar convites para participantes
              </li>
            </ul>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              O Orbit não acessa e-mails nem outros dados do Google. Você pode revogar o acesso a qualquer momento.
            </p>
          </div>
          <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4 sm:justify-end">
            <Button variant="outline" onClick={() => setGcalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setStatus((s) => ({ ...s, google_calendar: "connected" }))
                setGcalOpen(false)
                toast.success("Google Calendar conectado (simulação).")
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Autorizar acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Slack */}
      <Dialog
        open={slackOpen}
        onOpenChange={(open) => {
          setSlackOpen(open)
          if (!open) setSlackMode("connect")
        }}
      >
        <DialogContent className="max-w-[520px] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[520px]">
          <div className="h-1 bg-[#4A154B]" />
          <div className="flex items-start justify-between gap-3 p-6 pb-2 pr-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A154B]">
                <LogoSlack className="h-[22px] w-[22px]" />
              </div>
              <DialogTitle className="font-display text-lg font-extrabold">Slack</DialogTitle>
            </div>
          </div>

          {slackMode === "settings" ? (
            <>
              <div className="space-y-4 px-6 pb-2">
                <p className="text-xs text-muted-foreground">
                  workspace: orbit-team · {slackChannel || "#orbit-alerts"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Notificações ativas
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "KPI crítico ultrapassado", on: n1, set: setN1 },
                        { label: "Lembrete de ritual", on: n2, set: setN2 },
                        { label: "Resumo semanal", on: n3, set: setN3 },
                        { label: "Reunião não realizada", on: n4, set: setN4 },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/25 px-3 py-2"
                        >
                          <span className="text-sm text-foreground">{row.label}</span>
                          <Switch checked={row.on} onCheckedChange={(v) => row.set(v)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Canal de destino
                      </p>
                      <Input value={slackChannel} onChange={(e) => setSlackChannel(e.target.value)} className="bg-muted/30" />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Horário do resumo
                      </p>
                      <Input
                        value={slackSummaryTime}
                        onChange={(e) => setSlackSummaryTime(e.target.value)}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-muted-foreground">Última mensagem enviada: Hoje 09:00</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => toast.success("Teste enviado ao Slack (simulação).")}
                    >
                      Testar conexão
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setStatus((s) => ({ ...s, slack: "disconnected" }))
                        setSlackOpen(false)
                        toast.message("Slack desconectado.")
                      }}
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4 sm:justify-end">
                <Button variant="outline" onClick={() => setSlackOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 px-6 pb-2">
                <DialogDescription className="text-left text-sm leading-relaxed">
                  Receba alertas de KPI, lembretes de rituais e resumos semanais diretamente no seu workspace do Slack.
                </DialogDescription>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-center gap-2.5 border-[#4A154B]/50 bg-muted/20 font-semibold"
                  onClick={() => toast.message("Slack OAuth", { description: "Fluxo simulado — integre com a API do Slack." })}
                >
                  <LogoSlack className="h-[18px] w-[18px]" />
                  Adicionar ao Slack
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">configuração do canal</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Canal para alertas</p>
                  <Input value={slackChannel} onChange={(e) => setSlackChannel(e.target.value)} className="bg-muted/30" />
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tipos de notificação</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "KPI crítico ultrapassado", on: n1, set: setN1 },
                      { label: "Lembrete 30 min antes do ritual", on: n2, set: setN2 },
                      { label: "Resumo semanal (sexta às 18h)", on: n3, set: setN3 },
                      { label: "Reunião não realizada", on: n4, set: setN4 },
                    ].map((row) => (
                      <label
                        key={row.label}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground"
                      >
                        <span>{row.label}</span>
                        <Switch checked={row.on} onCheckedChange={(v) => row.set(v)} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4 sm:justify-end">
                <Button variant="outline" onClick={() => setSlackOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#4A154B] text-white hover:bg-[#4A154B]/90"
                  onClick={() => {
                    setStatus((s) => ({ ...s, slack: "connected" }))
                    setSlackOpen(false)
                    toast.success("Slack conectado (simulação).")
                  }}
                >
                  Conectar Slack
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal genérico */}
      <Dialog open={genericOpen} onOpenChange={setGenericOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Conectar {genericName}</DialogTitle>
            <DialogDescription>
              Para conectar esta integração, você será redirecionado para autenticar via OAuth ou inserir as credenciais da API.
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Chave de API (se necessário)</p>
            <Input placeholder="sk-••••••••••••••••" className="bg-muted/30" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Você pode encontrar sua chave de API nas configurações da plataforma correspondente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenericOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setGenericOpen(false)
                toast.success(`${genericName}: conexão simulada.`)
              }}
            >
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desconectar Google Calendar */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
          <div className="h-1 bg-destructive" />
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-destructive">Desconectar Google Calendar?</DialogTitle>
            <DialogDescription className="text-left">
              Ao desconectar, os rituais <strong className="text-foreground">deixarão de sincronizar</strong> com o Google Calendar e os lembretes automáticos serão desativados.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2">
            <div className="flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Os eventos criados no Google Calendar não serão removidos automaticamente.
            </div>
          </div>
          <DialogFooter className="border-t border-border bg-muted/30 p-4">
            <Button variant="outline" onClick={() => setDisconnectOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setStatus((s) => ({ ...s, google_calendar: "disconnected" }))
                setDisconnectOpen(false)
                toast.success("Google Calendar desconectado.")
              }}
            >
              Sim, desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function IntegrationDisconnectedCard({
  name,
  category,
  logo,
  features,
  footerHint,
  wide,
  onConnect,
}: {
  name: string
  category: string
  logo: React.ReactNode
  features: string[]
  footerHint: string
  wide?: boolean
  onConnect: () => void
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md",
        wide && "md:col-span-2"
      )}
    >
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {logo}
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold text-foreground">{name}</p>
            <p className="text-[11px] text-muted-foreground">{category}</p>
          </div>
        </div>
        <StatusBadge status="disconnected" />
      </div>
      <div className="mb-4 flex flex-col gap-1.5">
        {features.map((f) => (
          <FeatureLine key={f} ok={false}>
            {f}
          </FeatureLine>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-60" />
          {footerHint}
        </div>
        <Button size="sm" onClick={onConnect}>
          Conectar
        </Button>
      </div>
    </div>
  )
}

export default function IntegracoesPage() {
  return (
    <React.Suspense
      fallback={
        <>
          <Header title="Integrações" description="Carregando…" />
          <main className={COCKPIT_MAIN_CLASS}>
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </>
      }
    >
      <IntegracoesInner />
    </React.Suspense>
  )
}
