"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme: Theme) => {
        set({ theme })
        if (typeof document !== "undefined") {
          const root = document.documentElement
          if (theme === "dark") {
            root.classList.add("dark")
          } else {
            root.classList.remove("dark")
          }
        }
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light"
          if (typeof document !== "undefined") {
            const root = document.documentElement
            if (newTheme === "dark") {
              root.classList.add("dark")
            } else {
              root.classList.remove("dark")
            }
          }
          return { theme: newTheme }
        })
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          const root = document.documentElement
          if (state.theme === "dark") {
            root.classList.add("dark")
          } else {
            root.classList.remove("dark")
          }
        }
      },
    }
  )
)
