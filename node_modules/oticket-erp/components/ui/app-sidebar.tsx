"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useSidebarStore } from "@/stores/sidebar-store"
import { useThemeStore } from "@/stores/theme-store"
import { useAccountStore } from "@/stores/account-store"
import { Sidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatRoleName } from "@/utils/role-formatter"
import { cn } from "@/lib/utils"
import { OrbitMark } from "@/components/brand/orbit-logo"

/* ─────────────────── SVG ICONS ─────────────────────────────────────────── */
function IcCockpit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IcRituais() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6.5 20v-1.5a5.5 5.5 0 0111 0V20" />
      <circle cx="18.5" cy="6.5" r="2.5" />
      <path d="M21 18v-1a3.5 3.5 0 00-2.5-3.35" />
      <circle cx="5.5" cy="6.5" r="2.5" />
      <path d="M3 18v-1a3.5 3.5 0 012.5-3.35" />
    </svg>
  )
}
function IcKpis() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function IcPlanos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}
function IcCalendario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IcNotificacoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function IcIntegracoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
      <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07" />
    </svg>
  )
}
function IcConfiguracoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
function IcSair() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
function IcChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IcChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IcDotsV() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  )
}
function IcSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}
function IcMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

/* ─────────────────── NAV DATA ───────────────────────────────────────────── */
const principalItems = [
  { id: "cockpit",  title: "Cockpit",         url: "/cockpit",                  Icon: IcCockpit },
  { id: "rituais",  title: "Rituais",          url: "/cockpit/rituais",           Icon: IcRituais },
  { id: "kpis",     title: "KPIs",             url: "/cockpit/kpis",              Icon: IcKpis },
  { id: "planos",   title: "Planos de Ação",   url: "/cockpit/planos-de-acao",    Icon: IcPlanos },
]

const planejamentoItems = [
  { id: "calendario",   title: "Calendário",     url: "/cockpit/calendario",    Icon: IcCalendario,   badge: 0 },
  { id: "notificacoes", title: "Notificações",   url: "/cockpit/notificacoes",  Icon: IcNotificacoes, badge: 3 },
]

/* ─────────────────── NAV ITEM ───────────────────────────────────────────── */
function NavItem({
  title,
  url,
  Icon,
  badge,
  collapsed,
}: {
  title: string
  url: string
  Icon: React.FC
  badge?: number
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isActive = React.useMemo(() => {
    if (url === "/cockpit") return pathname === "/cockpit" || pathname === "/cockpit/"
    return pathname === url || pathname.startsWith(`${url}/`)
  }, [pathname, url])

  const hasBadge = badge != null && badge > 0
  const tooltipLabel = hasBadge ? `${title} (${badge})` : title

  const inner = (
    <Link
      href={url}
      className={cn("rf-nav-item", isActive && "rf-nav-active")}
    >
      <span className="rf-ni-icon">
        <Icon />
      </span>
      <span className={cn("rf-ni-label", collapsed && "rf-hidden-label")}>
        {title}
      </span>
      {hasBadge && (
        <span className={cn("rf-ni-badge rf-badge-red", collapsed && "rf-hidden-label")}>
          {badge}
        </span>
      )}
      {hasBadge && collapsed && <span className="rf-ni-dot" />}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

/* ─────────────────── SISTEMA ITEM (sem URL) ─────────────────────────────── */
function SistemaItem({
  title,
  Icon,
  badge,
  collapsed,
  onClick,
}: {
  title: string
  Icon: React.FC
  badge?: string
  collapsed: boolean
  onClick?: () => void
}) {
  const inner = (
    <button
      className="rf-nav-item w-full"
      onClick={onClick}
    >
      <span className="rf-ni-icon">
        <Icon />
      </span>
      <span className={cn("rf-ni-label", collapsed && "rf-hidden-label")}>
        {title}
      </span>
      {badge && (
        <span className={cn("rf-ni-badge rf-badge-accent", collapsed && "rf-hidden-label")}>
          {badge}
        </span>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{title}</TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

/* ─────────────────── MAIN COMPONENT ────────────────────────────────────── */
export function AppSidebar() {
  const open          = useSidebarStore((s) => s.open)
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar)
  const { theme, toggleTheme } = useThemeStore()
  const { data: session } = useSession()
  const currentAccount = useAccountStore((s) => s.currentAccount)
  const collapsed = !open

  const userInitials = React.useMemo(() => {
    const name = session?.user?.name ?? session?.user?.email ?? "U"
    return name.slice(0, 2).toUpperCase()
  }, [session])

  const accountInitials = React.useMemo(() => {
    const name = currentAccount?.name ?? "Ac"
    return name.slice(0, 2).toUpperCase()
  }, [currentAccount])

  return (
    <Sidebar collapsible="icon" className="border-r-0 p-0 font-(--rf-font-body)">
      {/* ── Injected styles ─────────────────────────────────────────────── */}
      <style>{`
        /* ── Root container ── */
        [data-slot="sidebar-inner"] {
          background: var(--rf-bg-surface) !important;
          border-right: 1px solid var(--rf-border-subtle) !important;
          position: relative;
          overflow: visible !important;
        }

        /* ── Glow top accent ── */
        [data-slot="sidebar-inner"]::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--rf-accent), #00d4ff);
          opacity: 0.7;
          z-index: 10;
          pointer-events: none;
        }

        /* ── Logo area ── */
        .rf-sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 14px 16px;
          border-bottom: 1px solid var(--rf-border-subtle);
          overflow: hidden;
          min-width: 0;
          position: relative;
        }
        .rf-sb-logo-text {
          overflow: hidden; min-width: 0;
          transition: opacity var(--rf-transition), width var(--rf-transition);
        }
        .rf-sb-logo-name {
          font-family: var(--rf-font-display);
          font-size: 15px; font-weight: 800;
          color: var(--rf-text-primary);
          white-space: nowrap; line-height: 1.2;
        }
        .rf-sb-logo-tag {
          font-size: 10px; font-weight: 600;
          color: var(--rf-text-muted);
          white-space: nowrap; margin-top: 1px;
        }

        /* ── Collapse button ── */
        .rf-sb-collapse-btn {
          position: absolute;
          top: 18px; right: 12px;
          width: 22px; height: 22px;
          border-radius: 6px;
          background: var(--rf-bg-elevated);
          border: 1px solid var(--rf-border-default);
          display: grid; place-items: center;
          cursor: pointer;
          color: var(--rf-text-muted);
          transition: all var(--rf-transition);
          flex-shrink: 0; z-index: 10;
        }
        .rf-sb-collapse-btn:hover {
          background: var(--rf-accent-soft);
          border-color: var(--rf-accent-border);
          color: var(--rf-accent);
        }
        .rf-sb-collapse-btn:active {
          transform: scale(0.88);
          background: var(--rf-accent);
          color: #fff;
          transition: transform 0.08s ease, background 0.08s ease;
        }
        .rf-collapse-icon {
          transition: transform var(--rf-transition);
          display: grid; place-items: center;
        }
        .rf-collapse-icon.rotated { transform: rotate(180deg); }

        /* ── Scroll area ── */
        .rf-sb-scroll {
          flex: 1;
          overflow-y: auto; overflow-x: hidden;
          padding: 12px 10px;
          scrollbar-width: thin;
          scrollbar-color: var(--rf-border-strong) transparent;
        }
        .rf-sb-scroll::-webkit-scrollbar { width: 4px; }
        .rf-sb-scroll::-webkit-scrollbar-thumb {
          background: var(--rf-border-strong); border-radius: 2px;
        }

        /* ── Section ── */
        .rf-sb-section { margin-bottom: 6px; }
        .rf-sb-section-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--rf-text-muted);
          padding: 8px 8px 4px;
          white-space: nowrap; overflow: hidden;
          transition: opacity var(--rf-transition), height var(--rf-transition), padding var(--rf-transition);
        }
        .rf-sb-section-label.rf-hidden-label {
          opacity: 0; height: 0; padding-top: 0; padding-bottom: 0;
        }

        /* ── Divider ── */
        .rf-sb-divider {
          height: 1px;
          background: var(--rf-border-subtle);
          margin: 6px 8px;
        }

        /* ── Nav item ── */
        .rf-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          cursor: pointer;
          color: var(--rf-text-secondary);
          font-family: var(--rf-font-body);
          font-size: 13.5px; font-weight: 500;
          text-decoration: none; white-space: nowrap;
          transition: all var(--rf-transition);
          position: relative; overflow: hidden;
          margin-bottom: 2px;
          border: 1px solid transparent;
          background: transparent;
          width: 100%; text-align: left;
        }
        .rf-nav-item:hover {
          background: var(--rf-bg-hover);
          color: var(--rf-text-primary);
        }
        .rf-nav-item:active {
          transform: scale(0.96);
          background: var(--rf-accent-soft);
          color: var(--rf-accent);
          transition: transform 0.08s ease, background 0.08s ease;
        }
        .rf-nav-active {
          background: var(--rf-accent-soft) !important;
          color: var(--rf-accent) !important;
          border-color: var(--rf-accent-border) !important;
        }
        .rf-nav-active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: var(--rf-accent);
        }
        .rf-nav-active .rf-ni-icon { color: var(--rf-accent); }

        /* ── Icon ── */
        .rf-ni-icon {
          width: 18px; height: 18px; flex-shrink: 0;
          color: var(--rf-text-muted);
          transition: color var(--rf-transition);
          display: grid; place-items: center;
        }
        .rf-nav-item:hover .rf-ni-icon { color: var(--rf-text-secondary); }

        /* ── Label ── */
        .rf-ni-label {
          flex: 1;
          transition: opacity var(--rf-transition), width var(--rf-transition);
          overflow: hidden; white-space: nowrap;
        }
        .rf-ni-label.rf-hidden-label { opacity: 0; width: 0; }

        /* ── Badge ── */
        .rf-ni-badge {
          margin-left: auto; flex-shrink: 0;
          font-size: 10px; font-weight: 700;
          padding: 1px 7px; border-radius: 9999px;
          transition: opacity var(--rf-transition);
        }
        .rf-badge-red   { background: #ef4444; color: #fff; }
        .rf-badge-accent {
          background: var(--rf-accent-soft);
          color: var(--rf-accent);
          border: 1px solid var(--rf-accent-border);
        }
        .rf-ni-badge.rf-hidden-label { opacity: 0; width: 0; padding: 0; overflow: hidden; }

        /* ── Dot indicator (collapsed with badge) ── */
        .rf-ni-dot {
          position: absolute; top: 6px; right: 6px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #ef4444;
        }

        /* ── Workspace ── */
        .rf-sb-workspace {
          padding: 10px;
          border-top: 1px solid var(--rf-border-subtle);
        }
        .rf-workspace-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 10px;
          cursor: pointer; transition: all var(--rf-transition);
          border: 1px solid var(--rf-border-subtle);
          background: var(--rf-bg-elevated);
          overflow: hidden; width: 100%;
        }
        .rf-workspace-btn:hover {
          border-color: var(--rf-border-strong);
          background: var(--rf-bg-hover);
        }
        .rf-workspace-btn:active {
          transform: scale(0.97);
          background: var(--rf-accent-soft);
          border-color: var(--rf-accent-border);
          transition: transform 0.08s ease, background 0.08s ease;
        }
        .rf-workspace-dot {
          width: 22px; height: 22px; flex-shrink: 0;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--rf-accent), #00d4ff);
          display: grid; place-items: center;
          font-size: 9px; font-weight: 800; color: #fff;
          font-family: var(--rf-font-display);
        }
        .rf-workspace-info {
          overflow: hidden; min-width: 0; flex: 1;
          transition: opacity var(--rf-transition), width var(--rf-transition);
        }
        .rf-workspace-info.rf-hidden-label { opacity: 0; width: 0; }
        .rf-workspace-name {
          font-size: 12px; font-weight: 600;
          color: var(--rf-text-primary); white-space: nowrap;
        }
        .rf-workspace-plan {
          font-size: 10px; color: var(--rf-text-muted); white-space: nowrap;
        }
        .rf-workspace-chevron {
          margin-left: auto; flex-shrink: 0;
          color: var(--rf-text-muted);
          transition: opacity var(--rf-transition);
        }
        .rf-workspace-chevron.rf-hidden-label { opacity: 0; width: 0; }

        /* ── User card ── */
        .rf-sb-user {
          padding: 10px;
          border-top: 1px solid var(--rf-border-subtle);
        }
        .rf-user-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 10px;
          cursor: pointer; transition: all var(--rf-transition);
          overflow: hidden; width: 100%; background: transparent; border: none;
        }
        .rf-user-btn:hover { background: var(--rf-bg-hover); }
        .rf-user-btn:active {
          transform: scale(0.97);
          background: var(--rf-bg-hover);
          transition: transform 0.08s ease;
        }
        .rf-user-avatar {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rf-accent), #00d4ff);
          display: grid; place-items: center;
          font-family: var(--rf-font-display);
          font-size: 11px; font-weight: 700; color: #fff;
          position: relative;
        }
        .rf-user-status {
          position: absolute; bottom: 0; right: 0;
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e;
          border: 2px solid var(--rf-bg-surface);
        }
        .rf-user-info {
          overflow: hidden; min-width: 0; flex: 1;
          transition: opacity var(--rf-transition), width var(--rf-transition);
          text-align: left;
        }
        .rf-user-info.rf-hidden-label { opacity: 0; width: 0; }
        .rf-user-name {
          font-size: 13px; font-weight: 600;
          color: var(--rf-text-primary); white-space: nowrap;
        }
        .rf-user-role {
          font-size: 10px; color: var(--rf-text-muted);
          white-space: nowrap; margin-top: 1px;
        }
        .rf-user-menu {
          margin-left: auto; flex-shrink: 0;
          color: var(--rf-text-muted);
          transition: opacity var(--rf-transition);
        }
        .rf-user-menu.rf-hidden-label { opacity: 0; width: 0; }

        /* ── Logout item ── */
        .rf-logout-item {
          color: #ef4444 !important;
        }
        .rf-logout-item:hover {
          background: rgba(239,68,68,0.08) !important;
          color: #ef4444 !important;
        }
        .rf-logout-item .rf-ni-icon { color: #ef4444 !important; }

        /* ── Theme toggle area ── */
        .rf-theme-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px 0;
        }
        .rf-theme-label {
          font-size: 11px; color: var(--rf-text-muted);
          flex: 1; white-space: nowrap; overflow: hidden;
          transition: opacity var(--rf-transition), width var(--rf-transition);
        }
        .rf-theme-label.rf-hidden-label { opacity: 0; width: 0; }
        .rf-theme-toggle-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 5px; border-radius: 6px;
          border: 1px solid var(--rf-border-default);
          background: var(--rf-bg-elevated);
          color: var(--rf-text-muted);
          cursor: pointer; transition: all var(--rf-transition);
          flex-shrink: 0;
        }
        .rf-theme-toggle-btn:hover {
          background: var(--rf-accent-soft);
          border-color: var(--rf-accent-border);
          color: var(--rf-accent);
        }
        .rf-theme-toggle-btn:active {
          transform: scale(0.88);
          background: var(--rf-accent);
          border-color: var(--rf-accent);
          color: #fff;
          transition: transform 0.08s ease, background 0.08s ease;
        }
      `}</style>

      {/* ── Inner wrapper ───────────────────────────────────────────────── */}
      <div className="flex h-full flex-col font-(--rf-font-body)">

        {/* ── Logo + Collapse btn ────────────────────────────────────────── */}
        <div className="rf-sb-logo">
          <OrbitMark size={32} className="shrink-0" />
          <div className={cn("rf-sb-logo-text", collapsed && "rf-hidden-label")}>
            <div className="rf-sb-logo-name">Orbit</div>
            <div className="rf-sb-logo-tag">Plataforma de Gestão</div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rf-sb-collapse-btn" onClick={toggleSidebar}>
                <span className={cn("rf-collapse-icon", collapsed && "rotated")}>
                  <IcChevronLeft />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Scroll area ───────────────────────────────────────────────── */}
        <div className="rf-sb-scroll">

          {/* PRINCIPAL */}
          <div className="rf-sb-section">
            <div className={cn("rf-sb-section-label", collapsed && "rf-hidden-label")}>
              Principal
            </div>
            {principalItems.map((item) => (
              <NavItem
                key={item.id}
                title={item.title}
                url={item.url}
                Icon={item.Icon}
                collapsed={collapsed}
              />
            ))}
          </div>

          <div className="rf-sb-divider" />

          {/* PLANEJAMENTO */}
          <div className="rf-sb-section">
            <div className={cn("rf-sb-section-label", collapsed && "rf-hidden-label")}>
              Planejamento
            </div>
            {planejamentoItems.map((item) => (
              <NavItem
                key={item.id}
                title={item.title}
                url={item.url}
                Icon={item.Icon}
                badge={item.badge}
                collapsed={collapsed}
              />
            ))}
          </div>

          <div className="rf-sb-divider" />

          {/* SISTEMA */}
          <div className="rf-sb-section">
            <div className={cn("rf-sb-section-label", collapsed && "rf-hidden-label")}>
              Sistema
            </div>
            <NavItem
              title="Integrações"
              url="/cockpit/integracoes"
              Icon={IcIntegracoes}
              collapsed={collapsed}
            />
            <SistemaItem
              title="Configurações"
              Icon={IcConfiguracoes}
              collapsed={collapsed}
            />
          </div>

        </div>

        {/* ── Theme toggle ───────────────────────────────────────────────── */}
        <div className="rf-theme-row">
          <span className={cn("rf-theme-label", collapsed && "rf-hidden-label")}>
            {theme === "dark" ? "Modo escuro" : "Modo claro"}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rf-theme-toggle-btn" onClick={toggleTheme}>
                {theme === "dark" ? <IcSun /> : <IcMoon />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {theme === "dark" ? "Alternar para claro" : "Alternar para escuro"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Workspace switcher ─────────────────────────────────────────── */}
        <div className="rf-sb-workspace">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rf-workspace-btn">
                <div className="rf-workspace-dot">{accountInitials}</div>
                <div className={cn("rf-workspace-info", collapsed && "rf-hidden-label")}>
                  <div className="rf-workspace-name">
                    {currentAccount?.name ?? "Conta"}
                  </div>
                  <div className="rf-workspace-plan">
                    {currentAccount?.level ?? "Plano Pro"}
                  </div>
                </div>
                <span className={cn("rf-workspace-chevron", collapsed && "rf-hidden-label")}>
                  <IcChevronDown />
                </span>
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                {currentAccount?.name ?? "Conta"}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* ── User card ─────────────────────────────────────────────────── */}
        <div className="rf-sb-user">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/cockpit/perfil"
                className="rf-user-btn"
              >
                <div className="rf-user-avatar">
                  {userInitials}
                  <div className="rf-user-status" />
                </div>
                <div className={cn("rf-user-info", collapsed && "rf-hidden-label")}>
                  <div className="rf-user-name">
                    {session?.user?.name ?? session?.user?.email ?? "Usuário"}
                  </div>
                  <div className="rf-user-role">
                    {formatRoleName(session?.role)}
                  </div>
                </div>
                <span className={cn("rf-user-menu", collapsed && "rf-hidden-label")}>
                  <IcDotsV />
                </span>
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                {session?.user?.name ?? "Perfil"}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Botão de logout separado */}
          {!collapsed && (
            <button
              className="rf-nav-item rf-logout-item mt-1"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              <span className="rf-ni-icon"><IcSair /></span>
              <span className="rf-ni-label">Sair</span>
            </button>
          )}
        </div>

      </div>
    </Sidebar>
  )
}
