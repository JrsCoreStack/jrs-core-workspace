"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Account } from "@/models/auth"
import { cn } from "@/lib/utils"
import { useAccountService } from "@/hooks/use-account-service"
import { Spinner } from "@/components/ui/spinner"

interface AccountSelectorProps {
  selectedAccountIds: string[]
  onSelectionChange: (accountIds: string[]) => void
}

export function AccountSelector({
  selectedAccountIds,
  onSelectionChange,
}: AccountSelectorProps) {
  const { LIST_ALL } = useAccountService()
  const [availableAccounts, setAvailableAccounts] = React.useState<Account[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  
  // Usar refs para armazenar valores e evitar loops
  const onSelectionChangeRef = React.useRef(onSelectionChange)
  const selectedAccountIdsRef = React.useRef(selectedAccountIds)
  
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
    selectedAccountIdsRef.current = selectedAccountIds
  }, [onSelectionChange, selectedAccountIds])

  // Garantir que só renderize após a hidratação
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    let isMounted = true

    const fetchAccounts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const accounts = await LIST_ALL()
        if (isMounted && accounts) {
          setAvailableAccounts(accounts)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erro ao carregar contas:", err)
          setError("Erro ao carregar contas disponíveis")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchAccounts()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Função estável que não depende de selectedAccountIds
  const handleToggle = React.useCallback((accountId: string) => {
    const currentSelection = selectedAccountIdsRef.current
    const newSelection = currentSelection.includes(accountId)
      ? currentSelection.filter((id) => id !== accountId)
      : [...currentSelection, accountId]
    
    onSelectionChangeRef.current(newSelection)
  }, [])

  // Renderizar estado inicial consistente no servidor e cliente
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando contas...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-4">{error}</div>
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
            const isSelected = selectedAccountIds.includes(account.id)
            return (
              <div
                key={account.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/5 border-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
                onClick={(e) => {
                  // Só disparar se não foi clicado diretamente no checkbox ou label
                  const target = e.target as HTMLElement
                  if (
                    target.closest('[role="checkbox"]') ||
                    target.closest('label') ||
                    target.tagName === 'LABEL'
                  ) {
                    return
                  }
                  handleToggle(account.id)
                }}
              >
                <Checkbox
                  id={account.id}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(account.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label
                  htmlFor={account.id}
                  className="flex-1 cursor-pointer font-normal"
                >
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {account.email} • {account.level}
                  </div>
                </Label>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
