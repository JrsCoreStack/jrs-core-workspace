"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Mail, Smartphone } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Section, SettingRow } from "./shared"

type NotifItem = { id: string; label: string; description: string; default: boolean }

function NotifChannel({
  icon,
  iconClass,
  title,
  subtitle,
  enabled,
  onToggle,
  children,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  subtitle: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconClass
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-card-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div>{children}</div>
    </div>
  )
}

function NotifToggleRow({
  item,
  disabled,
}: {
  item: NotifItem
  disabled?: boolean
}) {
  const [value, setValue] = useState(item.default)
  return (
    <SettingRow
      label={item.label}
      description={item.description}
      control={
        <Switch
          checked={value && !disabled}
          disabled={disabled}
          onCheckedChange={setValue}
        />
      }
    />
  )
}

const emailItems: NotifItem[] = [
  {
    id: "kpi-off-target",
    label: "KPI fora da meta",
    description: "Quando um indicador crítico ultrapassar o limite.",
    default: true,
  },
  {
    id: "weekly-summary",
    label: "Resumo semanal",
    description: "Sexta-feira às 18h com o resumo da semana.",
    default: true,
  },
  {
    id: "ritual-missed",
    label: "Ritual não realizado",
    description: "Quando uma reunião não for registrada.",
    default: false,
  },
  {
    id: "new-member",
    label: "Novo membro convidado",
    description: "Quando alguém aceitar um convite.",
    default: true,
  },
]

const pushItems: NotifItem[] = [
  {
    id: "ritual-reminder",
    label: "Lembrete de ritual",
    description: "30 minutos antes do início da sessão.",
    default: true,
  },
  {
    id: "action-overdue",
    label: "Plano de ação vencido",
    description: "Quando um prazo for ultrapassado.",
    default: true,
  },
  {
    id: "mention",
    label: "Menção nos comentários",
    description: "Quando alguém te mencionar em um plano.",
    default: false,
  },
]

export function NotificationsSection({ userEmail }: { userEmail: string }) {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [quietHours, setQuietHours] = useState(true)
  const [quietFrom, setQuietFrom] = useState("22:00")
  const [quietTo, setQuietTo] = useState("08:00")

  return (
    <div className="space-y-6">
      <NotifChannel
        icon={<Mail className="size-4" strokeWidth={1.8} />}
        iconClass="bg-primary/10 text-primary"
        title="E-mail"
        subtitle={userEmail || "seu@email.com"}
        enabled={emailEnabled}
        onToggle={setEmailEnabled}
      >
        {emailItems.map((it) => (
          <NotifToggleRow key={it.id} item={it} disabled={!emailEnabled} />
        ))}
      </NotifChannel>

      <NotifChannel
        icon={<Smartphone className="size-4" strokeWidth={1.8} />}
        iconClass="bg-chart-2/10 text-chart-2"
        title="Notificação push"
        subtitle="No navegador e no app mobile"
        enabled={pushEnabled}
        onToggle={setPushEnabled}
      >
        {pushItems.map((it) => (
          <NotifToggleRow key={it.id} item={it} disabled={!pushEnabled} />
        ))}
      </NotifChannel>

      <Section title="Horário silencioso">
        <SettingRow
          label="Ativar horário silencioso"
          description="Nenhuma notificação neste período."
          control={<Switch checked={quietHours} onCheckedChange={setQuietHours} />}
        />
        <SettingRow
          label="Período"
          description={`Das ${quietFrom} às ${quietTo}`}
          control={
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={quietFrom}
                onChange={(e) => setQuietFrom(e.target.value)}
                disabled={!quietHours}
                className="w-[120px]"
              />
              <span className="text-[12px] text-muted-foreground">até</span>
              <Input
                type="time"
                value={quietTo}
                onChange={(e) => setQuietTo(e.target.value)}
                disabled={!quietHours}
                className="w-[120px]"
              />
            </div>
          }
        />
      </Section>
    </div>
  )
}
