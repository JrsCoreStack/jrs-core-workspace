"use client"

import { Header } from "@/components/ui/header"
import { ProductsTable } from "@/components/products/products-table"

export default function ProductsPage() {
  return (
    <>
      <Header
        title="Produtos"
        description="Gerencie todos os produtos e serviços do sistema"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <ProductsTable />
      </main>
    </>
  )
}
