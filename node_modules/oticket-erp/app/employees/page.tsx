"use client"

import { Header } from "@/components/ui/header"
import { EmployeesTable } from "@/components/employees/employees-table"

export default function EmployeesPage() {
  return (
    <>
      <Header
        title="Colaboradores"
        description="Gerencie os colaboradores do sistema"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <EmployeesTable />
      </main>
    </>
  )
}
