"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useAccountStore } from "@/stores/account-store"
import { Account } from "@/models/auth"

const STORAGE_KEY = "current_account_id"

/**
 * Componente que sincroniza o Zustand store com a sessão do NextAuth
 * Deve ser usado no layout raiz
 */
export function AccountSync({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const setAvailableAccounts = useAccountStore((state) => state.setAvailableAccounts)
  const setCurrentAccount = useAccountStore((state) => state.setCurrentAccount)
  const setLoading = useAccountStore((state) => state.setLoading)
  const currentAccount = useAccountStore((state) => state.currentAccount)

  React.useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated" || !session?.accounts) {
      setAvailableAccounts([])
      setCurrentAccount(null)
      setLoading(false)
      return
    }

    try {
      const accounts = (session.accounts || []) as Account[]
      setAvailableAccounts(accounts)

      // Priorizar currentAccountId da sessão, depois localStorage, depois primeira conta
      const sessionAccountId = session.currentAccountId
      const savedAccountId =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      const accountId = sessionAccountId || savedAccountId

      const account = accountId
        ? accounts.find((acc) => acc.id === accountId) || accounts[0]
        : accounts[0]

      if (account) {
        // Só atualizar se for diferente da conta atual
        if (currentAccount?.id !== account.id) {
          setCurrentAccount(account)
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, account.id)
        }

        // Se não tiver currentAccountId na sessão ou for diferente, atualizar
        if (!sessionAccountId || sessionAccountId !== account.id) {
          update({ currentAccountId: account.id })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar conta:", error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, update])

  return <>{children}</>
}
