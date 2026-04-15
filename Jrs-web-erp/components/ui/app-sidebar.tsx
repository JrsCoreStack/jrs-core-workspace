"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Repeat2,
  TrendingUp,
  ClipboardList,
  Calendar,
  Bell,
  LogOut,
  Building,
  ChevronDown,
  Check,
  Moon,
  Sun,
  Users,
  Package,
  DollarSign,
  Settings,
  Zap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { useAccountStore } from "@/stores/account-store"
import { useAuthService } from "@/hooks/use-auth-service"
import { Account as AccountType } from "@/models/auth"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { formatRoleName } from "@/utils/role-formatter"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"

/* ─── nav structure matching reference image ─────────────── */
const principalItems = [
  { title: "Cockpit", url: "/cockpit", icon: LayoutDashboard },
  { title: "Rituais", url: "/cockpit/rituais", icon: Repeat2 },
  { title: "KPIs", url: "/cockpit/kpis", icon: TrendingUp },
  { title: "Planos de Ação", url: "/cockpit/planos-de-acao", icon: ClipboardList },
]

const planejamentoItems = [
  { title: "Calendário", url: "/cockpit/calendario", icon: Calendar },
  { title: "Notificações", url: "/cockpit/notificacoes", icon: Bell },
]

const gestaoItems = [
  { title: "Colaboradores", url: "/employees", icon: Users },
  { title: "Produtos", url: "/products", icon: Package },
  { title: "Financeiro", url: "/financial/transactions", icon: DollarSign },
]

/* ─── theme toggle ───────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <SidebarMenuButton onClick={toggleTheme} tooltip="Alternar tema">
      {theme === "dark" ? <Sun /> : <Moon />}
      <span>Tema {theme === "dark" ? "Claro" : "Escuro"}</span>
    </SidebarMenuButton>
  )
}

/* ─── nav item ───────────────────────────────────────────── */
function NavItem({
  item,
  badge,
}: {
  item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }
  badge?: number
}) {
  const pathname = usePathname()
  const Icon = item.icon

  const isActive = React.useMemo(() => {
    if (item.url === "/cockpit") {
      return pathname === "/cockpit" || pathname === "/cockpit/"
    }
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }, [pathname, item.url])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.url} className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{item.title}</span>
          {badge != null && badge > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/* ─── main component ─────────────────────────────────────── */
export function AppSidebar() {
  const router = useRouter()
  const currentAccount = useAccountStore((s) => s.currentAccount)
  const availableAccounts = useAccountStore((s) => s.availableAccounts)
  const isSwitching = useAccountStore((s) => s.isSwitching)
  const switchAccountStore = useAccountStore((s) => s.switchAccount)
  const { data: session, update } = useSession()
  const { UPDATETOKEN } = useAuthService()

  const handleAccountSwitch = async (account: AccountType) => {
    try {
      toast.loading("Trocando de conta...", { id: "switch-account" })
      await switchAccountStore(account.id, session, update, UPDATETOKEN, router)
    } catch {
      toast.error("Erro ao trocar de conta. Tente novamente.", { id: "switch-account" })
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  return (
    <Sidebar>
      {/* ── Header / brand + account switcher ── */}
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-1 mb-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground leading-none">JRS ERP</span>
            <span className="text-[11px] text-muted-foreground leading-none mt-0.5">Plataforma de Gestão</span>
          </div>
        </div>

        {/* Account switcher */}
        {availableAccounts.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSwitching}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  {isSwitching ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium text-foreground">
                    {isSwitching ? "Trocando..." : (currentAccount?.name ?? "Selecionar conta")}
                  </span>
                  {currentAccount?.level && (
                    <span className="truncate text-[10px] text-muted-foreground">{currentAccount.level}</span>
                  )}
                </div>
                {!isSwitching && (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-[200px]">
              <DropdownMenuLabel>Trocar de Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableAccounts.map((account) => {
                const isCurrent = currentAccount?.id === account.id
                return (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => handleAccountSwitch(account)}
                    disabled={isSwitching}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10">
                      <Building className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{account.name}</span>
                      {account.level && (
                        <span className="truncate text-xs text-muted-foreground">{account.level}</span>
                      )}
                    </div>
                    {isCurrent && !isSwitching && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {/* PRINCIPAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {principalItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PLANEJAMENTO */}
        <SidebarGroup>
          <SidebarGroupLabel>Planejamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planejamentoItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* GESTÃO */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gestaoItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* CONFIGURAÇÕES */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / user info + logout ── */}
      <SidebarFooter>
        {session?.user && (
          <>
            <SidebarSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-sm select-none">
                  {(session.user.name ?? session.user.email ?? "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {session.user.name ?? session.user.email}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {formatRoleName(session.role)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sair"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
