"use client"

import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Suspense } from "react"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        {children}
      </SidebarInset>
    </>
  )
}
