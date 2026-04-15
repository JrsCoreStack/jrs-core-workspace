"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { TransactionsTable } from "@/components/financial/transactions/transactions-table"
import { Suspense } from "react"

function TransactionsPageInner() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("event_id") || undefined

  return (
    <>
      <Header
        title="Transações"
        description="Gerencie as transações do sistema"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <TransactionsTable initialEventId={eventId} />
      </main>
    </>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageInner />
    </Suspense>
  )
}
