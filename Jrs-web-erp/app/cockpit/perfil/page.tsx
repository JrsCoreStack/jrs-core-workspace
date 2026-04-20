"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  Bell,
  CreditCard,
  LayoutGrid,
  Lock,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useAccountStore } from "@/stores/account-store"
import { useMemo, useState } from "react"
import { BillingSection } from "@/components/cockpit/perfil/billing-section"
import { MembersSection } from "@/components/cockpit/perfil/members-section"
import { NotificationsSection } from "@/components/cockpit/perfil/notifications-section"
import { ProfileEdit, ProfileView } from "@/components/cockpit/perfil/profile-section"
import { SecuritySection } from "@/components/cockpit/perfil/security-section"
import { WorkspaceSection } from "@/components/cockpit/perfil/workspace-section"

type TabId =
  | "workspace"
  | "membros"
  | "faturamento"
  | "seguranca"
  | "notificacoes"
  | "perfil"

type NavItem = {
  id: TabId
  label: string
  icon: typeof UserIcon
  group: "workspace" | "conta"
  socioOnly?: boolean
  badge?: string
}

const TAB_HEADER: Record<
  TabId,
  { title: string; description: string }
> = {
  workspace: {
    title: "Workspace",
    description: "Gerencie identidade e preferências regionais do workspace.",
  },
  membros: {
    title: "Membros",
    description: "Gerencie os membros do workspace e suas permissões.",
  },
  faturamento: {
    title: "Faturamento",
    description: "Gerencie seu plano e histórico de pagamentos.",
  },
  seguranca: {
    title: "Segurança",
    description:
      "Gerencie sua senha, autenticação em dois fatores e sessões ativas.",
  },
  notificacoes: {
    title: "Notificações",
    description: "Escolha como e quando o sistema te avisa.",
  },
  perfil: {
    title: "Meu Perfil",
    description: "Sua identidade e atividade no workspace.",
  },
}

const NAV_ITEMS: NavItem[] = [
  { id: "workspace", label: "Workspace", icon: LayoutGrid, group: "workspace", socioOnly: true },
  {
    id: "membros",
    label: "Membros",
    icon: Users,
    group: "workspace",
    socioOnly: true,
    badge: "8",
  },
  {
    id: "faturamento",
    label: "Faturamento",
    icon: CreditCard,
    group: "workspace",
    socioOnly: true,
  },
  { id: "seguranca", label: "Segurança", icon: Lock, group: "conta" },
  { id: "notificacoes", label: "Notificações", icon: Bell, group: "conta" },
  { id: "perfil", label: "Meu Perfil", icon: UserIcon, group: "conta" },
]

function getInitials(name?: string | null) {
  if (!name) return "U"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function getLevelLabel(level?: string) {
  if (!level) return "Membro"
  const map: Record<string, string> = {
    admin: "Sócio",
    owner: "Sócio",
    manager: "Gestor",
    member: "Membro",
    viewer: "Membro",
  }
  return map[level.toLowerCase()] ?? level
}

export default function PerfilPage() {
  const { data: session } = useSession()
  const currentAccount = useAccountStore((s) => s.currentAccount)

  const userName = session?.user?.name ?? currentAccount?.name ?? "Usuário"
  const userEmail = session?.user?.email ?? currentAccount?.email ?? ""
  const userLevel = currentAccount?.level ?? "admin"
  const workspaceName = currentAccount?.name ?? "Workspace"
  const initials = useMemo(() => getInitials(userName), [userName])
  const levelLabel = getLevelLabel(userLevel)

  const isSocio =
    userLevel.toLowerCase() === "admin" || userLevel.toLowerCase() === "owner"

  const [activeTab, setActiveTab] = useState<TabId>("perfil")
  const [editing, setEditing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut({ callbackUrl: "/auth" })
    } catch {
      setSigningOut(false)
    }
  }

  const workspaceNav = NAV_ITEMS.filter((i) => i.group === "workspace")
  const contaNav = NAV_ITEMS.filter((i) => i.group === "conta")

  const headerMeta =
    activeTab === "perfil" && editing
      ? {
          title: "Editar perfil",
          description: "Atualize foto, dados pessoais e preferências de exibição.",
        }
      : TAB_HEADER[activeTab]

  return (
    <>
      <Header
        title={headerMeta.title}
        description={headerMeta.description}
        displayTitle
      />

      <main
        className={cn(
          COCKPIT_MAIN_CLASS,
          "bg-muted/35 dark:bg-background"
        )}
      >
        <div className="mx-auto w-full max-w-6xl">
          {/* Mobile nav — horizontal pills */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 md:hidden">
            {NAV_ITEMS.map((item) => {
              const disabled = item.socioOnly && !isSocio
              const Icon = item.icon
              const active = activeTab === item.id && !editing
              return (
                <button
                  key={item.id}
                  disabled={disabled}
                  onClick={() => {
                    setActiveTab(item.id)
                    setEditing(false)
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.9} />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-[252px_1fr] md:gap-8">
            {/* Sidebar — fundo cinza Orbit + item ativo com barra roxa à esquerda */}
            <aside className="hidden self-start overflow-hidden rounded-2xl border border-border/60 bg-[#f3f4f6] shadow-sm dark:border-border dark:bg-card/40 md:block">
              {/* User summary */}
              <div className="flex items-center gap-3 border-b border-border/60 bg-white/60 px-4 py-4 dark:border-border dark:bg-transparent">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-600 shadow-sm ring-2 ring-white dark:ring-card">
                  <span className="text-[13px] font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                    {userName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {levelLabel} — {workspaceName}
                  </p>
                </div>
              </div>

              <div className="p-2 pb-3">
                <NavGroup
                  label="Workspace"
                  items={workspaceNav}
                  activeTab={activeTab}
                  editing={editing}
                  isSocio={isSocio}
                  onSelect={(id) => {
                    setActiveTab(id)
                    setEditing(false)
                  }}
                />

                <div className="my-1 h-px bg-border" />

                <NavGroup
                  label="Minha conta"
                  items={contaNav}
                  activeTab={activeTab}
                  editing={editing}
                  isSocio={isSocio}
                  onSelect={(id) => {
                    setActiveTab(id)
                    setEditing(false)
                  }}
                />

                <div className="my-1 h-px bg-border" />

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                >
                  <LogOut className="size-4" strokeWidth={1.8} />
                  {signingOut ? "Saindo…" : "Sair da conta"}
                </button>
              </div>
            </aside>

            {/* Painel principal — branco, como Orbit */}
            <section className="min-w-0 rounded-2xl border border-border/70 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8 dark:border-border">
              {!isSocio && activeTab !== "seguranca" && activeTab !== "notificacoes" && activeTab !== "perfil" && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
                  <Lock className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={1.8} />
                  <div>
                    <p className="text-[13px] font-semibold text-amber-600">
                      Acesso restrito
                    </p>
                    <p className="mt-0.5 text-[12px] text-amber-600/80">
                      As seções Workspace, Membros e Faturamento são visíveis apenas
                      para Sócios.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "workspace" && isSocio && (
                <WorkspaceSection workspaceName={workspaceName} />
              )}
              {activeTab === "membros" && isSocio && <MembersSection />}
              {activeTab === "faturamento" && isSocio && <BillingSection />}
              {activeTab === "seguranca" && <SecuritySection />}
              {activeTab === "notificacoes" && (
                <NotificationsSection userEmail={userEmail} />
              )}
              {activeTab === "perfil" && !editing && (
                <ProfileView
                  userName={userName}
                  userEmail={userEmail}
                  initials={initials}
                  workspaceName={workspaceName}
                  levelLabel={levelLabel}
                  onEdit={() => setEditing(true)}
                />
              )}
              {activeTab === "perfil" && editing && (
                <ProfileEdit
                  userName={userName}
                  userEmail={userEmail}
                  initials={initials}
                  onBack={() => setEditing(false)}
                />
              )}

              {/* Mobile sign out */}
              <div className="mt-8 md:hidden">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Saindo…" : "Sair da conta"}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

/* ─────────────── Nav group ─────────────── */
function NavGroup({
  label,
  items,
  activeTab,
  editing,
  isSocio,
  onSelect,
}: {
  label: string
  items: NavItem[]
  activeTab: TabId
  editing: boolean
  isSocio: boolean
  onSelect: (id: TabId) => void
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/90">
        {label}
      </p>
      {items.map((item) => {
        const Icon = item.icon
        const locked = item.socioOnly && !isSocio
        const active = activeTab === item.id && !editing && !locked
        return (
          <button
            key={item.id}
            disabled={locked}
            onClick={() => !locked && onSelect(item.id)}
            className={cn(
              "group relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg py-2 pr-2 pl-3 text-left text-[13px] font-medium transition-colors",
              active
                ? "bg-[#ede9fe]/90 text-primary shadow-[inset_0_0_0_1px_rgba(123,97,255,0.12)] dark:bg-primary/12 dark:text-primary"
                : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
              locked && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground"
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-r-sm bg-primary"
                aria-hidden
              />
            )}
            <Icon
              className={cn(
                "relative z-[1] size-4 shrink-0",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
              strokeWidth={1.8}
            />
            <span className="relative z-[1] flex-1">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.badge}
              </span>
            )}
            {locked && (
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Sócio
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
