"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "./sidebar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  /** Título estilo Orbit / cockpit (Syne, extrabold) */
  displayTitle?: boolean
}

export function Header({ title, description, actions, displayTitle }: HeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b border-border bg-background px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              "leading-tight text-foreground",
              displayTitle
                ? "font-display text-[22px] font-extrabold tracking-tight sm:text-[26px]"
                : "text-xl font-bold sm:text-2xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 line-clamp-3 text-sm text-muted-foreground sm:line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:max-w-[min(100%,42rem)] sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <div className="relative hidden w-full md:block md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-full min-w-0 border-border bg-secondary pl-9 md:w-[min(280px,100%)]"
          />
        </div>
        {actions != null && (
          <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:justify-end sm:gap-2 [&_button]:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
