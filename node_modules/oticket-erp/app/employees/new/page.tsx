"use client"

import { Header } from "@/components/ui/header"
import { EmployeeForm } from "@/components/employees/employee-form"

export default function NewEmployeePage() {
  return (
    <>
      <Header
        title="Novo Colaborador"
        description="Cadastre um novo colaborador no sistema"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <EmployeeForm />
      </main>
    </>
  )
}
