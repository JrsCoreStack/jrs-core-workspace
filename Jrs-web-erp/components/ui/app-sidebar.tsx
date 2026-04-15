"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Package,
  Building2,
  Building,
  ChevronDown,
  ChevronRight,
  Check,
  Target,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { Moon, Sun } from "lucide-react"

interface MenuSubItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuItem {
  title: string
  url?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  subItems?: MenuSubItem[]
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/home",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Cockpit",
    items: [
      {
        title: "RitualFlow",
        icon: Target,
        subItems: [
          { title: "Painel Estratégico", url: "/cockpit" },
              { title: "Rituais", url: "/cockpit/rituais" },
          { title: "KPIs", url: "/cockpit/kpis" },
              { title: "Plano de ação", url: "/cockpit/planos-de-acao" },
          { title: "Calendário", url: "/cockpit/calendario" },
          { title: "Notificações", url: "/cockpit/notificacoes" },
        ],
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        title: "Colaboradores",
        url: "/employees",
        icon: Users,
      },
      {
        title: "Produtos",
        url: "/products",
        icon: Package,
      },
      {
        title: "Financeiro",
        icon: DollarSign,
        subItems: [
          {
            title: "Transações",
            url: "/financial/transactions",
          },
          {
            title: "Saldo por Evento",
            url: "/financial/events-balance",
          },
          {
            title: "Solicitações de Saque",
            url: "/financial/payout-requests",
          },
        ],
      },
    //   {
    //     title: "Eventos",
    //     url: "/home?tab=eventos",
    //     icon: Calendar,
    //   },
    ],
  },
  // {
  //   title: "Vendas",
  //   items: [
  //   //   {
  //   //     title: "Ingressos",
  //   //     url: "/ingressos",
  //   //     icon: Ticket,
  //   //   },
  //   //   {
  //   //     title: "Pedidos",
  //   //     url: "/pedidos",
  //   //     icon: ShoppingCart,
  //   //   },
  //     {
  //       title: "Relatórios",
  //       url: "/relatorios",
  //       icon: BarChart3,
  //     },
  //   ],
  // },
  {
    title: "Cadastros",
    items: [
      {
        title: "Produtos",
        url: "/products/new",
        icon: Package,
      },
      {
        title: "Colaboradores",
        url: "/employees/new",
        icon: Building2,
      },
    //   {
    //     title: "Documentos",
    //     url: "/documentos",
    //     icon: FileText,
    //   },
    ],
  },
]

function ThemeToggleMenuItem() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <SidebarMenuButton
      onClick={toggleTheme}
      tooltip="Alternar tema"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
      <span>Tema</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams?.get("tab")

  // Controla expansão de menus com subitens (evita useState dentro do map)
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({})

  // Usar o AccountStore do Zustand para gerenciar contas
  const currentAccount = useAccountStore((state) => state.currentAccount)
  const availableAccounts = useAccountStore((state) => state.availableAccounts)
  const isSwitching = useAccountStore((state) => state.isSwitching)
  const switchAccountStore = useAccountStore((state) => state.switchAccount)
  const { data: session, update } = useSession()
  const { UPDATETOKEN } = useAuthService()

  const isActive = (url: string): boolean => {
    if (url.includes("?")) {
      const [baseUrl, query] = url.split("?")
      const tab = query.split("=")[1]
      return pathname === baseUrl && activeTab === tab
    }
    if (!pathname) return false
    // Raiz /cockpit não deve marcar ativo em /cockpit/kpis
    if (url === "/cockpit") {
      return pathname === "/cockpit" || pathname === "/cockpit/"
    }
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const handleAccountSwitch = async (account: AccountType) => {
    try {
      toast.loading("Trocando de conta...", { id: "switch-account" })
      await switchAccountStore(account.id, session, update, UPDATETOKEN, router)
      // Não precisa de toast.success aqui porque a página vai atualizar
    } catch {
      toast.error("Erro ao trocar de conta. Tente novamente.", { id: "switch-account" })
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  return (
    <Sidebar>
      {/* Cabeçalho da Sidebar */}
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground focus:outline-none min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSwitching}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {isSwitching ? (
                  <Spinner className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Building className="h-4 w-4" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold">
                  {isSwitching ? "Trocando conta..." : currentAccount?.name || "Selecionar conta"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentAccount?.level || "Nenhuma conta"}
                </span>
              </div>
              {!isSwitching && (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="right"
            className="w-[200px]"
          >
            <DropdownMenuLabel>Trocar de Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableAccounts.map((account) => {
              const isCurrentAccount = currentAccount?.id === account.id
              const isSwitchingToThis = isSwitching && isCurrentAccount
              
              return (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => handleAccountSwitch(account)}
                  className="flex items-center gap-2"
                  disabled={isSwitching}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10">
                    {isSwitchingToThis ? (
                      <Spinner className="h-3 w-3 text-primary" />
                    ) : (
                      <Building className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">
                      {account.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {account.level}
                    </span>
                  </div>
                  {isCurrentAccount && !isSwitching && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      {/* Conteúdo da Sidebar */}
      <SidebarContent>
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const hasSubItems = item.subItems && item.subItems.length > 0
                  const active = item.url ? isActive(item.url) : false
                  
                  // Verificar se algum subitem está ativo
                  const hasActiveSubItem = item.subItems?.some((subItem) => isActive(subItem.url)) || false
                  const isOpen = openMenus[item.title] ?? hasActiveSubItem

                  if (hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(next) =>
                            setOpenMenus((prev) => ({ ...prev, [item.title]: next }))
                          }
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={hasActiveSubItem}
                              tooltip={item.title}
                            >
                              <Icon />
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight 
                                className={cn(
                                  "ml-auto h-4 w-4 transition-transform duration-200",
                                  isOpen && "rotate-90"
                                )} 
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems?.map((subItem) => {
                                const subActive = isActive(subItem.url)
                                
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={subActive}
                                    >
                                      <Link href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    )
                  }

                  // Item sem subitens (comportamento original)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Link href={item.url || "#"}>
                          <Icon />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <Link href="/settings">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggleMenuItem />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rodapé da Sidebar */}
      <SidebarFooter>
        {/* Informações do usuário */}
        {session?.user && (
          <div className="px-2 py-2 mb-2 border-t border-sidebar-border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {session.user.name || session.user.email}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {formatRoleName(session.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sair"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}