"use client"

import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function CockpitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <SidebarInset className="min-h-0 min-w-0 overflow-x-hidden">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </>
  )
}
