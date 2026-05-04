"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Bell,
  CreditCard,
  ChevronLeft,
  LayoutGrid,
  Lock,
  User as UserIcon,
  Users,
} from "lucide-react"
import { useAccountStore } from "@/stores/account-store"
import { cn } from "@/lib/utils"
import {
  type PerfilSettingsTabId,
  parsePerfilTabParam,
} from "@/lib/cockpit/perfil-settings-tabs"
import { isWorkspaceSocioUser } from "@/lib/cockpit/workspace-socio"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type NavDef = {
  id: PerfilSettingsTabId
  label: string
  icon: typeof UserIcon
  group: "workspace" | "conta"
  socioOnly?: boolean
  badge?: string
}

const NAV: NavDef[] = [
  { id: "workspace", label: "Workspace", icon: LayoutGrid, group: "workspace", socioOnly: true },
  { id: "membros", label: "Membros", icon: Users, group: "workspace", socioOnly: true, badge: "8" },
  { id: "faturamento", label: "Faturamento", icon: CreditCard, group: "workspace", socioOnly: true },
  { id: "seguranca", label: "Segurança", icon: Lock, group: "conta" },
  { id: "notificacoes", label: "Notificações", icon: Bell, group: "conta" },
  { id: "perfil", label: "Meu Perfil", icon: UserIcon, group: "conta" },
]

function SettingsNavRow({
  href,
  label,
  Icon,
  active,
  locked,
  badge,
  showSocioTag,
  collapsed,
}: {
  href: string
  label: string
  Icon: typeof UserIcon
  active: boolean
  locked: boolean
  badge?: string
  showSocioTag: boolean
  collapsed: boolean
}) {
  const className = cn(
    "rf-nav-item",
    active && !locked && "rf-nav-active",
    locked && "rf-nav-item--disabled"
  )

  const body = (
    <>
      <span className="rf-ni-icon">
        <Icon width={18} height={18} strokeWidth={1.75} />
      </span>
      <span className={cn("rf-ni-label", collapsed && "rf-hidden-label")}>{label}</span>
      {!locked && badge && (
        <span className={cn("rf-ni-badge rf-badge-accent", collapsed && "rf-hidden-label")}>
          {badge}
        </span>
      )}
      {showSocioTag && (
        <span className={cn("rf-settings-socio-tag", collapsed && "rf-hidden-label")}>
          SÓCIO
        </span>
      )}
    </>
  )

  if (locked) {
    const innerDisabled = (
      <span className={className} aria-disabled>
        {body}
      </span>
    )
    if (!collapsed) return innerDisabled
    return (
      <Tooltip>
        <TooltipTrigger asChild>{innerDisabled}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label} · Sócio
        </TooltipContent>
      </Tooltip>
    )
  }

  const innerLink = (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {body}
    </Link>
  )

  if (!collapsed) return innerLink

  return (
    <Tooltip>
      <TooltipTrigger asChild>{innerLink}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
        {badge ? ` (${badge})` : ""}
      </TooltipContent>
    </Tooltip>
  )
}

export function CockpitSettingsSidebarPanel({ collapsed }: { collapsed: boolean }) {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const currentAccount = useAccountStore((s) => s.currentAccount)

  const isSocio = isWorkspaceSocioUser({
    accountLevel: currentAccount?.level,
    sessionRole: session?.role,
    permissions: session?.permissions,
  })

  const activeId: PerfilSettingsTabId =
    parsePerfilTabParam(searchParams.get("tab")) ?? "perfil"

  const workspaceNav = NAV.filter((i) => i.group === "workspace")
  const contaNav = NAV.filter((i) => i.group === "conta")

  const voltarInner = (
    <Link
      href="/cockpit"
      className={cn("rf-nav-item", collapsed && "justify-center px-2")}
    >
      <span className="rf-ni-icon">
        <ChevronLeft width={18} height={18} strokeWidth={1.85} />
      </span>
      <span className={cn("rf-ni-label", collapsed && "rf-hidden-label")}>
        Voltar ao cockpit
      </span>
    </Link>
  )

  return (
    <div className="flex flex-col">
      {/* Workspace */}
      <div className="rf-sb-section">
        <div className={cn("rf-sb-section-label", collapsed && "rf-hidden-label")}>
          Workspace
        </div>
        {workspaceNav.map((item) => {
          const locked = !!item.socioOnly && !isSocio
          const href = `/cockpit/perfil${item.id === "perfil" ? "" : `?tab=${item.id}`}`
          return (
            <SettingsNavRow
              key={item.id}
              href={href}
              label={item.label}
              Icon={item.icon}
              active={activeId === item.id}
              locked={locked}
              badge={!locked ? item.badge : undefined}
              showSocioTag={!!item.socioOnly && !isSocio}
              collapsed={collapsed}
            />
          )
        })}
      </div>

      <div className="rf-sb-divider" />

      {/* Minha conta */}
      <div className="rf-sb-section">
        <div className={cn("rf-sb-section-label", collapsed && "rf-hidden-label")}>
          Minha conta
        </div>
        {contaNav.map((item) => {
          const locked = !!item.socioOnly && !isSocio
          const href = `/cockpit/perfil${item.id === "perfil" ? "" : `?tab=${item.id}`}`
          return (
            <SettingsNavRow
              key={item.id}
              href={href}
              label={item.label}
              Icon={item.icon}
              active={activeId === item.id}
              locked={locked}
              badge={undefined}
              showSocioTag={false}
              collapsed={collapsed}
            />
          )
        })}
      </div>

      <div className="rf-sb-divider" />

      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{voltarInner}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Voltar ao cockpit
          </TooltipContent>
        </Tooltip>
      ) : (
        voltarInner
      )}
    </div>
  )
}
