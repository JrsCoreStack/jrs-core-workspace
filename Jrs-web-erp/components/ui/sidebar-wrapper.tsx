"use client"

import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebarStore } from "@/stores/sidebar-store"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH = "15rem"
const SIDEBAR_WIDTH_ICON = "4rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/**
 * Wrapper para o Sidebar que usa Zustand store
 * Substitui o SidebarProvider antigo
 */
export function SidebarWrapper({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar)

  // Adiciona keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <TooltipProvider delayDuration={0}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full overflow-x-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TooltipProvider>
  )
}
