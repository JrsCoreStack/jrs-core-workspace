"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { EmployeeForm } from "@/components/employees/employee-form"
import { useEmployeeService } from "@/hooks/use-employee-service"
import { Employee } from "@/models/employee"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const { GET_BY_ID } = useEmployeeService()
  const [employee, setEmployee] = React.useState<Employee | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const hasLoadedRef = React.useRef(false)

  React.useEffect(() => {
    // Evitar requisições desnecessárias (ex: ao trocar de aba ou re-renderizações do React)
    if (hasLoadedRef.current) {
      return
    }

    const loadEmployee = async () => {
      if (!params?.id || typeof params.id !== "string") {
        toast.error("ID do colaborador não encontrado")
        router.push("/employees")
        return
      }

      setIsLoading(true)
      try {
        const data = await GET_BY_ID(params.id)
        if (data) {
          setEmployee(data)
          hasLoadedRef.current = true
        } else {
          toast.error("Colaborador não encontrado")
          router.push("/employees")
        }
      } catch (error) {
        console.error("Erro ao carregar colaborador:", error)
        toast.error("Erro ao carregar colaborador")
        router.push("/employees")
      } finally {
        setIsLoading(false)
      }
    }

    loadEmployee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  if (isLoading) {
    return (
      <>
        <Header
          title="Editar Colaborador"
          description="Carregando informações do colaborador..."
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header
        title="Editar Colaborador"
        description="Atualize as informações do colaborador"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <EmployeeForm employee={employee} />
      </main>
    </>
  )
}
