"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebarStore } from "@/stores/sidebar-store"

/**
 * Componente que sincroniza o Zustand store com o estado mobile
 * Deve ser usado no layout raiz
 */
export function SidebarSync({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const setIsMobile = useSidebarStore((state) => state.setIsMobile)

  React.useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  return <>{children}</>
}
