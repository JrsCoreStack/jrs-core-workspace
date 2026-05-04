"use client"

import { Button } from "@/components/ui/button"
import {
  isSocioOnlyTab,
  parsePerfilTabParam,
  type PerfilSettingsTabId,
} from "@/lib/cockpit/perfil-settings-tabs"
import { isWorkspaceSocioUser } from "@/lib/cockpit/workspace-socio"
import { BillingSection } from "@/components/cockpit/perfil/billing-section"
import { MembersSection } from "@/components/cockpit/perfil/members-section"
import { NotificationsSection } from "@/components/cockpit/perfil/notifications-section"
import { ProfileEdit, ProfileView } from "@/components/cockpit/perfil/profile-section"
import { SecuritySection } from "@/components/cockpit/perfil/security-section"
import { WorkspaceSection } from "@/components/cockpit/perfil/workspace-section"
import { Lock } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAccountStore } from "@/stores/account-store"
import { Suspense, useEffect, useMemo, useState } from "react"

const TAB_HEADER: Record<
  PerfilSettingsTabId,
  { title: string; description: string }
> = {
  workspace: {
    title: "Configurações do Workspace",
    description:
      "Gerencie as informações e preferências da sua empresa no Orbit.",
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

function PerfilPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const currentAccount = useAccountStore((s) => s.currentAccount)

  const userName = session?.user?.name ?? currentAccount?.name ?? "Usuário"
  const userEmail = session?.user?.email ?? currentAccount?.email ?? ""
  const userLevel = currentAccount?.level ?? "admin"
  const workspaceName = currentAccount?.name ?? "Workspace"
  const initials = useMemo(() => getInitials(userName), [userName])

  const isSocio = isWorkspaceSocioUser({
    accountLevel: currentAccount?.level,
    sessionRole: session?.role,
    permissions: session?.permissions,
  })

  const levelLabel = useMemo(() => {
    if (isSocio) return "Sócio"
    return getLevelLabel(userLevel)
  }, [isSocio, userLevel])

  const [editing, setEditing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const parsed = parsePerfilTabParam(searchParams.get("tab")) ?? "perfil"
  const activeTab: PerfilSettingsTabId =
    isSocioOnlyTab(parsed) && !isSocio ? "perfil" : parsed

  useEffect(() => {
    const t = parsePerfilTabParam(searchParams.get("tab"))
    if (t && isSocioOnlyTab(t) && !isSocio) {
      router.replace("/cockpit/perfil", { scroll: false })
    }
  }, [searchParams, isSocio, router])

  useEffect(() => {
    setEditing(false)
  }, [activeTab])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut({ callbackUrl: "/auth" })
    } catch {
      setSigningOut(false)
    }
  }

  const headerMeta =
    activeTab === "perfil" && editing
      ? {
          title: "Editar perfil",
          description:
            "Atualize foto, dados pessoais e preferências de exibição.",
        }
      : TAB_HEADER[activeTab]

  return (
    <main className="cp-settings-main min-h-0 flex-1">
      <div className="rf-cockpit-fill">
        <header className="cp-topbar shrink-0">
          <div className="cp-topbar-left">
            <div>
              <h1 className="cp-page-title">{headerMeta.title}</h1>
              <p className="cp-page-sub">{headerMeta.description}</p>
              {activeTab === "workspace" && isSocio && (
                <span className="cp-topbar-chip">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Sócio — acesso total
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="cp-settings-body">
          <div className="cp-settings-inner">
          {!isSocio &&
            activeTab !== "seguranca" &&
            activeTab !== "notificacoes" &&
            activeTab !== "perfil" && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
                <Lock
                  className="mt-0.5 size-4 shrink-0 text-amber-600"
                  strokeWidth={1.8}
                />
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

          <div className="mt-10 border-t border-[color:var(--rf-border-subtle)] pt-6 md:hidden">
            <Button
              variant="outline"
              className="w-full gap-2 border-destructive/30 bg-[var(--rf-bg-surface)] text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              {signingOut ? "Saindo…" : "Sair da conta"}
            </Button>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PerfilPage() {
  return (
    <Suspense
      fallback={
        <main className="rf-cockpit-fill cp-settings-main">
          <div className="cp-topbar shrink-0">
            <div className="cp-topbar-left">
              <div>
                <div className="cp-page-title">Configurações</div>
                <p className="cp-page-sub">Carregando…</p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <PerfilPageInner />
    </Suspense>
  )
}
