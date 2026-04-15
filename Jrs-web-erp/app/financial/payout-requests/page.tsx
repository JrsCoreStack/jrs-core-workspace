"use client"

import { Header } from "@/components/ui/header"
import { PayoutRequestsTable } from "@/components/financial/payout-requests/payout-requests-table"

export default function PayoutRequestsPage() {
  return (
    <>
      <Header
        title="Solicitações de Saque"
        description="Gerencie as solicitações de repasse a produtores"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <PayoutRequestsTable />
      </main>
    </>
  )
}
