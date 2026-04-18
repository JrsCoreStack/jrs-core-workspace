"use client"

import { Header } from "@/components/ui/header"
import { EventsBalanceTable } from "@/components/financial/events-balance/events-balance-table"

export default function EventsBalancePage() {
  return (
    <>
      <Header
        title="Saldo por Evento"
        description="Visualize o saldo financeiro detalhado por evento, incluindo valores a repassar aos produtores"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <EventsBalanceTable />
      </main>
    </>
  )
}
