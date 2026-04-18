"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
// import { StatsCards } from "@/components/erp/stats-cards"
// import { UsersTable } from "@/components/erp/users-table"
// import { FinancialSummary } from "@/components/erp/financial-summary"
// import { SalesChart } from "@/components/erp/sales-chart"
// import { EventsList } from "@/components/erp/events-list"
// import { RecentActivity } from "@/components/erp/recent-activity"
import { ModuleTabs, type Tab } from "@/components/ui/module-tabs"
import { StatsCards } from "@/components/home/stats-cards"
import { SalesChart } from "@/components/home/sales-chart"
import { EventsList } from "@/components/home/events-list"
import { RecentActivity } from "@/components/home/recent-activity"
import { FinancialSummary } from "@/components/home/financial-summary"
import { EmployeesTable } from "@/components/employees/employees-table"
import { useSession } from "next-auth/react"

const moduleTabs: Tab[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "usuarios", label: "Colaboradores" },
  { id: "financeiro", label: "Financeiro" },
//   { id: "eventos", label: "Eventos", count: 4 },
]

export default function Home() {
  const [activeModule, setActiveModule] = useState("overview")
  const { data: session } = useSession();

  return (
    <>
      <Header
        title="Dashboard"
        description="Bem-vindo ao OTicket ERP - Gerencie seus produtos e operações"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <ModuleTabs
            tabs={moduleTabs}
            activeTab={activeModule}
            onTabChange={setActiveModule}
          />
        </div>

        {activeModule === "overview" && (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid gap-6 lg:grid-cols-1">
              {/* <SalesChart /> */}
              {/* <EventsList /> */}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-3">
                <EmployeesTable />
              </div>
              {/* <RecentActivity /> */}
            </div>
          </div>
        )}

        {activeModule === "usuarios" && (
          <div className="space-y-6">
            <EmployeesTable />
          </div>
        )}

        {activeModule === "financeiro" && (
          <div className="space-y-6">
            <FinancialSummary />
          </div>
        )}

        {/* {activeModule === "eventos" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Eventos Ativos" value="24" change="+4" />
              <StatCard title="Ingressos Vendidos" value="145.2K" change="+18%" />
              <StatCard title="Receita Total" value="R$ 2.8M" change="+25%" />
              <StatCard title="Média por Evento" value="R$ 116K" change="+7%" />
            </div>
            <EventsList />
          </div>
        )} */}
      </main>
    {/* </SidebarInset> */}
  </>
  )
}

function StatCard({
  title,
  value,
  change,
}: {
  title: string
  value: string
  change: string
}) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
      <p className="text-xs text-primary mt-1">{change} vs mês anterior</p>
    </div>
  )
}
