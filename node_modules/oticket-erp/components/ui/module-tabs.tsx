"use client"

import { cn } from "@/lib/utils"

export interface Tab {
  id: string
  label: string
  count?: number
}

interface ModuleTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ModuleTabs({ tabs, activeTab, onTabChange }: ModuleTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
            activeTab === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-2 px-1.5 py-0.5 text-xs rounded-md",
                activeTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
