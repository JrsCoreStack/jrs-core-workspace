"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  User,
  Lock,
  Shield,
  Monitor,
  Users,
  Zap,
  DollarSign,
  AlertTriangle,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
  Plus,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useAccountStore } from "@/stores/account-store"
import { useState, useMemo } from "react"
import { toast } from "sonner"

/* ─── Avatar colors ─── */
const AVATAR_GRADIENTS = [
  "from-primary to-chart-2",
  "from-orange-400 to-red-500",
  "from-emerald-400 to-green-600",
  "from-pink-500 to-purple-600",
  "from-sky-400 to-blue-600",
] as const

/* ─── Helpers ─── */
function getInitials(name?: string | null): string {
  if (!name) return "U"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function getLevelLabel(level?: string): string {
  if (!level) return "Membro"
  const map: Record<string, string> = {
    admin: "Admin",
    manager: "Gestor",
    owner: "Proprietário",
    member: "Membro",
    viewer: "Visualizador",
  }
  return map[level.toLowerCase()] ?? level
}

/* ─── Stat cell ─── */
function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

/* ─── Section wrapper ─── */
function Section({
  icon,
  label,
  iconClass = "text-muted-foreground",
  danger = false,
  children,
}: {
  icon: React.ReactNode
  label: string
  iconClass?: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className={cn("flex h-4 w-4 items-center justify-center", iconClass, danger && "text-destructive")}>
          {icon}
        </span>
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            danger ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

/* ─── Row link ─── */
function RowLink({
  icon,
  iconClass = "bg-muted text-muted-foreground",
  label,
  sub,
  href,
  badge,
  danger = false,
}: {
  icon: React.ReactNode
  iconClass?: string
  label: string
  sub?: string
  href?: string
  badge?: React.ReactNode
  danger?: boolean
}) {
  const inner = (
    <div className={cn("flex items-center gap-3 px-4 py-3.5 transition-colors", danger ? "hover:bg-destructive/5" : "hover:bg-muted/40")}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconClass)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", danger ? "text-destructive" : "text-card-foreground")}>
          {label}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        <ChevronRight className={cn("h-4 w-4", danger ? "text-destructive/60" : "text-muted-foreground/50")} />
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} className="block cursor-pointer">{inner}</Link>
  }
  return <div className="cursor-pointer">{inner}</div>
}

/* ─── Main ─── */
export default function PerfilPage() {
  const { data: session } = useSession()
  const currentAccount = useAccountStore((s) => s.currentAccount)

  const userName = session?.user?.name ?? currentAccount?.name ?? "Usuário"
  const userEmail = session?.user?.email ?? currentAccount?.email ?? ""
  const userLevel = currentAccount?.level ?? ""
  const workspaceName = currentAccount?.name ?? "Workspace"

  const initials = useMemo(() => getInitials(userName), [userName])

  const [selectedGradient, setSelectedGradient] = useState(0)
  const [name, setName] = useState(() => {
    const parts = userName.trim().split(" ")
    return {
      first: parts[0] ?? "",
      last: parts.slice(1).join(" "),
    }
  })
  const [cargo, setCargo] = useState("Diretor de Operações")
  const [email, setEmail] = useState(userEmail)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    toast.success("Perfil atualizado com sucesso.")
    setSaving(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut({ callbackUrl: "/auth" })
    } catch {
      toast.error("Erro ao sair. Tente novamente.")
      setSigningOut(false)
    }
  }

  return (
    <>
      <Header
        title="Perfil"
        description="Gerencie suas informações pessoais e configurações de conta"
        actions={
          <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
            <Link href="/cockpit/perfil/preferencias">
              <Settings className="h-4 w-4" />
              Preferências
            </Link>
          </Button>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        <div className="mx-auto max-w-2xl space-y-4">

          {/* Profile header card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative h-20 bg-linear-to-br from-primary/20 via-primary/10 to-chart-2/10" />
            <div className="px-5 pb-5">
              {/* Avatar */}
              <div className="-mt-9 mb-3 inline-block">
                <div                   className={cn(
                    "flex h-[72px] w-[72px] items-center justify-center rounded-full bg-linear-to-br border-[3px] border-card shadow-md",
                    AVATAR_GRADIENTS[selectedGradient]
                  )}>
                  <span className="font-display text-2xl font-extrabold text-white">
                    {initials}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                  {userName}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {cargo} · {workspaceName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {getLevelLabel(userLevel)}
                </span>
                {currentAccount?.level === "manager" || currentAccount?.level === "admin" ? (
                  <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    Gestor
                  </span>
                ) : null}
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                  Pro
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              <StatCell value="38" label="Rituais" />
              <StatCell value="92%" label="Presença" />
              <StatCell value="24" label="Planos" />
            </div>
          </div>

          {/* Personal info */}
          <Section
            icon={<User className="h-4 w-4" />}
            label="Informações pessoais"
          >
            <div className="space-y-4 p-4">
              {/* Avatar picker */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Avatar
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGradient(i)}
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br font-bold text-white transition-all hover:scale-105",
                        g,
                        selectedGradient === i && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                      )}
                    >
                      {initials}
                      {selectedGradient === i && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                  <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Nome
                  </p>
                  <Input
                    value={name.first}
                    onChange={(e) => setName((n) => ({ ...n, first: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Sobrenome
                  </p>
                  <Input
                    value={name.last}
                    onChange={(e) => setName((n) => ({ ...n, last: e.target.value }))}
                    className="bg-background"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Cargo
                </p>
                <Input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  E-mail
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="gap-2"
              >
                {saving ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </Section>

          {/* Security */}
          <Section
            icon={<Lock className="h-4 w-4" />}
            label="Conta & Segurança"
            iconClass="text-primary"
          >
            <RowLink
              icon={<Lock className="h-4 w-4" />}
              iconClass="bg-primary/10 text-primary"
              label="Alterar senha"
              sub="Última alteração: 45 dias atrás"
              href="#"
            />
            <RowLink
              icon={<Shield className="h-4 w-4" />}
              iconClass="bg-emerald-500/10 text-emerald-500"
              label="Autenticação em 2 fatores"
              sub="Ativada via e-mail"
              href="#"
              badge={
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 ring-1 ring-emerald-500/20">
                  Ativo
                </span>
              }
            />
            <RowLink
              icon={<Monitor className="h-4 w-4" />}
              iconClass="bg-muted text-muted-foreground"
              label="Sessões ativas"
              sub="2 dispositivos conectados"
              href="#"
            />
          </Section>

          {/* Workspace */}
          <Section
            icon={<Users className="h-4 w-4" />}
            label={`Workspace — ${workspaceName}`}
            iconClass="text-amber-500"
          >
            <RowLink
              icon={<Users className="h-4 w-4" />}
              iconClass="bg-amber-500/10 text-amber-500"
              label="Gerenciar membros"
              sub="12 membros ativos"
              href="#"
            />
            <RowLink
              icon={<Zap className="h-4 w-4" />}
              iconClass="bg-chart-2/10 text-chart-2"
              label="Integrações"
              sub="Google Calendar, Slack"
              href="/cockpit/integracoes"
            />
            <RowLink
              icon={<DollarSign className="h-4 w-4" />}
              iconClass="bg-muted text-muted-foreground"
              label="Plano e faturamento"
              sub="Pro · Próx. cobrança: 01/05/2026"
              href="#"
            />
          </Section>

          {/* Danger zone */}
          <Section
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Zona de perigo"
            danger
          >
            <div
              className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-destructive/5"
              onClick={handleSignOut}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">
                  {signingOut ? "Saindo…" : "Sair da conta"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Encerrar esta sessão</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-destructive/60" />
            </div>
            <div className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-destructive/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Excluir minha conta</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Esta ação é irreversível</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-destructive/60" />
            </div>
          </Section>

        </div>
      </main>
    </>
  )
}
