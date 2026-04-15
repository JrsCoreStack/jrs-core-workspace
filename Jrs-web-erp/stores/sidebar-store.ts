"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  open: boolean
  openMobile: boolean
  isMobile: boolean
  setOpen: (open: boolean) => void
  setOpenMobile: (open: boolean) => void
  setIsMobile: (isMobile: boolean) => void
  toggleSidebar: () => void
}

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      open: true,
      openMobile: false,
      isMobile: false,

      setOpen: (open: boolean) => {
        set({ open })
        // Atualizar cookie
        if (typeof document !== "undefined") {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },

      setOpenMobile: (openMobile: boolean) => set({ openMobile }),

      setIsMobile: (isMobile: boolean) => set({ isMobile }),

      toggleSidebar: () => {
        const { isMobile, open, openMobile } = get()
        if (isMobile) {
          set({ openMobile: !openMobile })
        } else {
          get().setOpen(!open)
        }
      },
    }),
    {
      name: "sidebar-storage",
    }
  )
)
