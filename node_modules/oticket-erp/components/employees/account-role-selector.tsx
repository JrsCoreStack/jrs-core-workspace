"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Account } from "@/models/auth"
import { Role, UserRole } from "@/models/permission"
import { useRoleService } from "@/hooks/use-role-service"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface AccountRole {
  account_id: string
  role_id?: string
}

interface AccountRoleSelectorProps {
  availableAccounts: Account[]
  accountRoles: AccountRole[]
  onAccountRolesChange: (accountRoles: AccountRole[]) => void
}

export function AccountRoleSelector({
  availableAccounts,
  accountRoles,
  onAccountRolesChange,
}: AccountRoleSelectorProps) {
  const { LIST_ALL } = useRoleService()
  const [roles, setRoles] = React.useState<Role[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(true)

  // Rastrear se os roles já foram carregados para evitar requisições desnecessárias
  const rolesLoadedRef = React.useRef(false)

  React.useEffect(() => {
    // Se já foram carregados, não fazer requisição novamente
    if (rolesLoadedRef.current || roles.length > 0) {
      setIsLoadingRoles(false)
      return
    }

    const fetchRoles = async () => {
      setIsLoadingRoles(true)
      try {
        const rolesData = await LIST_ALL()
        if (rolesData) {
          setRoles(rolesData)
          rolesLoadedRef.current = true
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error)
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [LIST_ALL, roles.length])

  const handleAccountToggle = (accountId: string) => {
    const isSelected = accountRoles.some((ar) => ar.account_id === accountId)
    
    if (isSelected) {
      // Remover conta (desmarcar checkbox)
      const updated = accountRoles.filter((ar) => ar.account_id !== accountId)
      onAccountRolesChange(updated)
    } else {
      // Adicionar conta com role padrão (primeiro role disponível)
      const defaultRole = roles[0]
      if (defaultRole) {
        const updated = [...accountRoles, { account_id: accountId, role_id: defaultRole.id }]
        onAccountRolesChange(updated)
      }
    }
  }

  const handleRoleChange = (accountId: string, roleId: string) => {
    // Verificar se a conta já existe na lista
    const existingIndex = accountRoles.findIndex((ar) => ar.account_id === accountId)

    let updated: AccountRole[]

    if (existingIndex >= 0) {
      // Atualizar role existente
      updated = accountRoles.map((ar, index) =>
        index === existingIndex ? { ...ar, role_id: roleId } : ar
      )
    } else {
      // Adicionar nova conta com role
      updated = [...accountRoles, { account_id: accountId, role_id: roleId }]
    }

    onAccountRolesChange(updated)
  }

  const getRoleForAccount = (accountId: string): string | undefined => {
    return accountRoles.find((ar) => ar.account_id === accountId)?.role_id
  }

  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando permissões...
        </span>
      </div>
    )
  }

  if (availableAccounts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Nenhuma conta disponível
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {availableAccounts.map((account) => {
            const selectedRoleId = getRoleForAccount(account.id)
            const isAccountSelected = accountRoles.some((ar) => ar.account_id === account.id)
            
            return (
              <div
                key={account.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors",
                  isAccountSelected 
                    ? "bg-primary/5 border-primary" 
                    : "bg-background border-border hover:bg-accent/50"
                )}
              >
                {/* Checkbox e informações da conta */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Checkbox
                    id={`account-${account.id}`}
                    checked={isAccountSelected}
                    onCheckedChange={() => handleAccountToggle(account.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`account-${account.id}`}
                    className="flex-1 cursor-pointer font-normal min-w-0"
                  >
                    <div className="font-medium truncate">{account.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {account.email} • {account.level}
                    </div>
                  </Label>
                </div>

                {/* Select de permissões - só aparece quando conta está selecionada */}
                {isAccountSelected && (
                  <div className="w-full sm:w-48">
                    <Select
                      value={selectedRoleId || undefined}
                      onValueChange={(value) => handleRoleChange(account.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a permissão" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Indicador visual quando não está selecionada */}
                {!isAccountSelected && (
                  <div className="text-xs text-muted-foreground italic">
                    Sem acesso
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
