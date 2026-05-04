"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Activity,
  Camera,
  CheckSquare,
  Edit3,
  MapPin,
  Pencil,
  Share2,
  Target,
  Users,
} from "lucide-react"
import { useRef, useState, type ChangeEvent } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { RoleChip, Section, SettingRow, settingsButtonNeutral, settingsButtonPrimary } from "./shared"

type ActivityItem = {
  id: string
  icon: "ritual" | "plan" | "kpi" | "invite"
  text: string
  time: string
}

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    icon: "ritual",
    text: "Conduziu o ritual **Comitê Tático Q4** — 7 participantes, 3 KPIs atualizados",
    time: "Hoje 16:12",
  },
  {
    id: "2",
    icon: "plan",
    text: "Criou plano de ação **Otimização de Frota** — prioridade alta · prazo 10/04",
    time: "Ontem 14:35",
  },
  {
    id: "3",
    icon: "kpi",
    text: "Atualizou KPI **Receita Recorrente** — R$ 2.4M · 80% da meta mensal",
    time: "Ontem 10:20",
  },
  {
    id: "4",
    icon: "invite",
    text: "Convidou **Pedro Ramos** para o workspace como Membro",
    time: "3 dias atrás",
  },
  {
    id: "5",
    icon: "ritual",
    text: "Conduziu o ritual **Daily Comercial OTicket** — 4 participantes",
    time: "4 dias atrás",
  },
]

function ActivityIcon({ type }: { type: ActivityItem["icon"] }) {
  const cfg: Record<
    ActivityItem["icon"],
    { bg: string; fg: string; Icon: typeof Users }
  > = {
    ritual: {
      bg: "bg-primary/10",
      fg: "text-primary",
      Icon: Users,
    },
    plan: {
      bg: "bg-amber-500/10",
      fg: "text-amber-500",
      Icon: CheckSquare,
    },
    kpi: {
      bg: "bg-chart-2/10",
      fg: "text-chart-2",
      Icon: Target,
    },
    invite: {
      bg: "bg-emerald-500/10",
      fg: "text-emerald-500",
      Icon: Activity,
    },
  }
  const { bg, fg, Icon } = cfg[type]
  return (
    <span
      className={cn(
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
        bg,
        fg
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.9} />
    </span>
  )
}

function renderBold(text: string) {
  // Turn **foo** into <b>foo</b>
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{p}</span>
  })
}

/* ─────────────── View mode ─────────────── */
export function ProfileView({
  userName,
  userEmail,
  initials,
  workspaceName,
  levelLabel,
  onEdit,
}: {
  userName: string
  userEmail: string
  initials: string
  workspaceName: string
  levelLabel: string
  onEdit: () => void
}) {
  return (
    <div className="space-y-5">
      {/* Cover */}
      <div className="relative h-32 overflow-hidden rounded-xl bg-linear-to-br from-primary/30 via-primary/15 to-chart-2/20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />
        <button className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/40 px-3 py-1.5 text-[11.5px] font-semibold text-white/90 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white">
          <Pencil className="size-3" strokeWidth={2} />
          Editar capa
        </button>
      </div>

      {/* Header row: avatar + actions */}
      <div className="-mt-10 flex items-end justify-between gap-3 px-1">
        <div className="relative">
          <div className="flex size-[72px] items-center justify-center rounded-full bg-linear-to-br from-primary to-chart-2 ring-[3px] ring-background">
            <span className="font-display text-xl font-extrabold text-white">
              {initials}
            </span>
          </div>
          <button
            className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-primary ring-2 ring-background"
            aria-label="Editar avatar"
          >
            <Pencil className="size-3 text-primary-foreground" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", settingsButtonNeutral)}
            onClick={onEdit}
          >
            <Edit3 className="size-3.5" strokeWidth={2} />
            Editar perfil
          </Button>
          <Button size="sm" variant="outline" className={cn("gap-2", settingsButtonNeutral)}>
            <Share2 className="size-3.5" strokeWidth={2} />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Info */}
      <div>
        <h2 className="font-display text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
          {userName}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
          <RoleChip variant="socio">{levelLabel}</RoleChip>
          <span className="text-muted-foreground/50">·</span>
          <span>{workspaceName}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" strokeWidth={1.8} />
            São Paulo, SP
          </span>
        </div>
        <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
          Cofundador e responsável pela estratégia comercial. Foco em crescimento
          sustentável, rituais de gestão e cultura de resultado.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { v: "47", l: "Rituais realizados", accent: true },
          { v: "12", l: "KPIs sob gestão", accent: false },
          { v: "94%", l: "Presença em rituais", accent: true },
          { v: "8", l: "Planos concluídos", accent: false },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-xl border border-border bg-card px-3 py-3.5 text-center"
          >
            <p
              className={cn(
                "font-display text-[22px] font-extrabold leading-none",
                s.accent ? "text-primary" : "text-foreground"
              )}
            >
              {s.v}
            </p>
            <p className="mt-1.5 text-[10.5px] font-medium text-muted-foreground">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* Atividade recente */}
      <Section title="Atividade recente">
        <div className="divide-y divide-border">
          {recentActivity.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 px-5 py-3.5"
            >
              <ActivityIcon type={a.icon} />
              <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground">
                {renderBold(a.text)}
              </p>
              <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground/70">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ─────────────── Edit mode ─────────────── */
export function ProfileEdit({
  userName,
  userEmail,
  initials,
  onBack,
}: {
  userName: string
  userEmail: string
  initials: string
  onBack: () => void
}) {
  const { theme, setTheme } = useTheme()
  const parts = userName.trim().split(" ")
  const [first, setFirst] = useState(parts[0] ?? "")
  const [last, setLast] = useState(parts.slice(1).join(" "))
  const [email, setEmail] = useState(userEmail)
  const [phone, setPhone] = useState("+55 11 99999-0000")
  const [role, setRole] = useState("Cofundador & CEO")
  const [location, setLocation] = useState("São Paulo, SP")
  const [bio, setBio] = useState(
    "Cofundador e responsável pela estratégia comercial. Foco em crescimento sustentável, rituais de gestão e cultura de resultado."
  )
  const [compactSidebar, setCompactSidebar] = useState(false)
  const [showActivity, setShowActivity] = useState(true)
  const [saving, setSaving] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const displayName =
    `${first} ${last}`.trim().replace(/\s+/g, " ") || userName

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    toast.success("Perfil atualizado com sucesso.")
    setSaving(false)
    onBack()
  }

  function onAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f)
      toast.success(`Foto recebida: ${f.name} (somente pré-visualização até integrar salvamento).`)
    e.target.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button variant="outline" size="sm" className={settingsButtonNeutral} onClick={onBack}>
          ← Voltar
        </Button>
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Editar perfil
        </h2>
      </div>

      {/* Foto — hover só mostra câmera no avatar; botões alinhados à direita */}
      <Section title="Foto de perfil">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <input
            ref={avatarInputRef}
            id="profile-avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="sr-only"
            onChange={onAvatarPick}
          />
          <label
            htmlFor="profile-avatar-upload"
            className={cn(
              "group/av flex min-w-0 flex-1 cursor-pointer gap-4 rounded-xl p-0",
              "border-0 shadow-none ring-0 outline-none",
              "hover:border-0 hover:bg-transparent hover:ring-0",
              "focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0"
            )}
          >
            <span className="relative flex size-16 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-primary to-chart-2 shadow-inner ring-2 ring-background">
              <span className="relative z-[1] flex size-full items-center justify-center font-display text-lg font-extrabold text-white">
                {initials}
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 z-[2] flex items-center justify-center",
                  "bg-black/55 opacity-0 transition-opacity duration-200",
                  "group-hover/av:opacity-100"
                )}
              >
                <Camera className="size-7 text-white" strokeWidth={1.85} aria-hidden />
              </span>
            </span>
            <span className="flex min-w-0 flex-col items-start pt-0.5">
              <span className="text-sm font-semibold text-[var(--rf-accent)]">{displayName}</span>
              <span className="mt-0.5 text-left text-[11.5px] text-muted-foreground">
                PNG ou JPG · Máx 5MB · Mín 200×200px
              </span>
            </span>
          </label>
          <div className="flex w-full shrink-0 flex-col items-end gap-2 sm:w-auto sm:items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(settingsButtonNeutral, "min-w-[8.75rem]")}
              onClick={() => avatarInputRef.current?.click()}
            >
              Fazer upload
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "min-w-[8.75rem] rounded-lg border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
              onClick={() => toast.message("Demonstração — foto não removida.")}
            >
              Remover
            </Button>
          </div>
        </div>
      </Section>

      {/* Pessoais */}
      <Section title="Informações pessoais">
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <LabeledInput label="Nome" value={first} onChange={setFirst} />
            <LabeledInput label="Sobrenome" value={last} onChange={setLast} />
            <LabeledInput label="E-mail" value={email} onChange={setEmail} type="email" />
            <LabeledInput label="Telefone" value={phone} onChange={setPhone} type="tel" />
            <LabeledInput label="Cargo" value={role} onChange={setRole} />
            <LabeledInput label="Localização" value={location} onChange={setLocation} />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Bio
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </Section>

      {/* Exibição */}
      <Section title="Preferências de exibição">
        <SettingRow
          label="Tema"
          description="Aparência do sistema."
          control={
            <Select value={theme ?? "system"} onValueChange={setTheme}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          label="Sidebar compacta"
          description="Recolher a sidebar por padrão."
          control={
            <Switch checked={compactSidebar} onCheckedChange={setCompactSidebar} />
          }
        />
        <SettingRow
          label="Mostrar atividade recente no perfil"
          description="Visível para todos os membros do workspace."
          control={<Switch checked={showActivity} onCheckedChange={setShowActivity} />}
        />
      </Section>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className={settingsButtonNeutral} onClick={onBack}>
          Cancelar
        </Button>
        <Button variant="default" className={settingsButtonPrimary} onClick={handleSave} disabled={saving}>
          {saving ? "Salvando…" : "Salvar perfil"}
        </Button>
      </div>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background"
      />
    </div>
  )
}
