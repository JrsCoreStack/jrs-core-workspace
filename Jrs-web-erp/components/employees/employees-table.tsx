"use client"

import * as React from "react"
import { Edit, Trash2, UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useEmployeeService } from "@/hooks/use-employee-service"
import { useAccountService } from "@/hooks/use-account-service"
import { Employee, EmployeeListResponse } from "@/models/employee"
import { Account } from "@/models/auth"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { formatRoleName } from "@/utils/role-formatter"
import formatCPF from "@/utils/cpf-formatter"
import formatPhone from "@/utils/phone-formatter"

export function EmployeesTable() {
  const router = useRouter()
  const { LIST, DELETE } = useEmployeeService()
  const { LIST_ALL: LIST_ALL_ACCOUNTS } = useAccountService()
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [availableAccounts, setAvailableAccounts] = React.useState<Account[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")

  // Carregar todas as contas disponíveis para buscar nomes
  React.useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await LIST_ALL_ACCOUNTS()
        if (accounts) {
          setAvailableAccounts(accounts)
        }
      } catch (error) {
        console.error("Erro ao carregar contas:", error)
      }
    }
    fetchAccounts()
  }, [LIST_ALL_ACCOUNTS])

  // Função auxiliar para buscar nome da conta por ID
  const getAccountName = (accountId: string): string => {
    const account = availableAccounts.find((acc) => acc.id === accountId)
    return account?.name || accountId
  }

  // Função auxiliar para formatar data de último acesso
  const formatLastAccess = (dateString?: string): string => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
          return diffInMinutes <= 1 ? "Agora" : `${diffInMinutes} min atrás`
        }
        return `${diffInHours}h atrás`
      } else if (diffInDays === 1) {
        return "Ontem"
      } else if (diffInDays < 7) {
        return `${diffInDays} dias atrás`
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`
      } else {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }
    } catch {
      return "-"
    }
  }

  // Função auxiliar para formatar status
  const formatStatus = (status?: string): string => {
    if (!status) return "Não definido"
    const statusUpper = status.toUpperCase()
    const statusMap: Record<string, string> = {
      ACTIVE: "Ativo",
      INACTIVE: "Inativo",
      BLOCKED: "Bloqueado",
      ATIVO: "Ativo",
      INATIVO: "Inativo",
      BLOQUEADO: "Bloqueado",
    }
    return statusMap[statusUpper] || status
  }

  // Função auxiliar para obter variante do badge de status
  const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "secondary"
    const statusUpper = status.toUpperCase()
    if (statusUpper === "ACTIVE" || statusUpper === "ATIVO") return "default"
    if (statusUpper === "INACTIVE" || statusUpper === "INATIVO") return "secondary"
    if (statusUpper === "BLOCKED" || statusUpper === "BLOQUEADO") return "destructive"
    return "outline"
  }

  // Debounce do termo de busca (aguarda 500ms após parar de digitar)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 800)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadEmployees = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await LIST(debouncedSearchTerm || undefined)
      if (response) {
        setEmployees(response)
      }
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error)
      toast.error("Erro ao carregar colaboradores")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchTerm])

  React.useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleEdit = (employee: Employee) => {
    router.push(`/employees/${employee.id}/edit`)
  }

  const handleSearch = () => {
    setDebouncedSearchTerm(searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este colaborador?")) {
      return
    }

    try {
      await DELETE(id)
      toast.success("Colaborador excluído com sucesso")
      loadEmployees()
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error)
      toast.error("Erro ao excluir colaborador")
    }
  }

  const handleCreate = () => {
    router.push("/employees/new")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colaboradores</CardTitle>
            <Button onClick={handleCreate} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="default"
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            {searchTerm && (
              <Button
                onClick={handleClearSearch}
                variant="outline"
              >
                Limpar
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Contas</TableHead>
                    {/* <TableHead>Cargo</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Último acesso</TableHead>

                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {debouncedSearchTerm ? "Nenhum colaborador encontrado" : "Nenhum colaborador cadastrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-mono text-sm">{formatCPF(employee.cpf)}</TableCell>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{formatPhone(employee.phone)}</TableCell>
                        <TableCell>
                          {(() => {
                            // Priorizar user_accounts (formato novo), depois accounts (formato antigo)
                            const userAccounts = employee.user_accounts || []
                            const accounts = employee.accounts || []
                            const hasUserAccounts = userAccounts.length > 0
                            const hasAccounts = accounts.length > 0

                            if (hasUserAccounts) {
                              // Se tiver user_accounts, mostrar nomes das contas (até 2) ou quantidade
                              const accountCount = userAccounts.length
                              const accountIds = userAccounts.map((ua) => ua.account_id)
                              const uniqueAccountIds = Array.from(new Set(accountIds))

                              if (uniqueAccountIds.length <= 2) {
                                // Mostrar nomes das contas se tiver 2 ou menos
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {uniqueAccountIds.map((accountId) => (
                                      <span
                                        key={accountId}
                                        className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                                      >
                                        {getAccountName(accountId)}
                                      </span>
                                    ))}
                                  </div>
                                )
                              } else {
                                // Mostrar 2 nomes + quantidade restante
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {uniqueAccountIds.slice(0, 2).map((accountId) => (
                                      <span
                                        key={accountId}
                                        className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                                      >
                                        {getAccountName(accountId)}
                                      </span>
                                    ))}
                                    <span className="text-xs text-muted-foreground">
                                      +{uniqueAccountIds.length - 2}
                                    </span>
                                  </div>
                                )
                              }
                            } else if (hasAccounts) {
                              // Formato antigo com accountName
                              return (
                                <div className="flex flex-wrap gap-1">
                                  {accounts.slice(0, 2).map((acc) => (
                                    <span
                                      key={acc.id}
                                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                                    >
                                      {acc.accountName}
                                    </span>
                                  ))}
                                  {accounts.length > 2 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{accounts.length - 2}
                                    </span>
                                  )}
                                </div>
                              )
                            } else {
                              return (
                                <span className="text-muted-foreground text-sm">Nenhuma conta</span>
                              )
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {employee.status ? (
                            <Badge variant={getStatusVariant(employee.status)}>
                              {formatStatus(employee.status)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Não definido</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatLastAccess(employee.last_login)}
                          </span>
                        </TableCell>
                        {/* <TableCell>
                          {employee.role ? (
                            <Badge variant="outline">
                              {formatRoleName(employee.role)}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell> */}
                 
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
