"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Account } from "@/models/auth"
import { UpdateTokenResponse } from "@/models/auth"

interface AccountState {
  currentAccount: Account | null
  availableAccounts: Account[]
  isLoading: boolean
  isSwitching: boolean
  setCurrentAccount: (account: Account | null) => void
      switchAccount: (
        accountId: string,
        session: any,
        update: any,
        updateToken: (token: string | undefined, account_id: string) => Promise<UpdateTokenResponse | undefined>,
        router?: any
      ) => Promise<void>
  setAvailableAccounts: (accounts: Account[]) => void
  setLoading: (loading: boolean) => void
  setSwitching: (switching: boolean) => void
  reset: () => void
}

const STORAGE_KEY = "current_account_id"

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      currentAccount: null,
      availableAccounts: [],
      isLoading: true,
      isSwitching: false,

      setCurrentAccount: (account: Account | null) => {
        set({ currentAccount: account })
        // Salvar no localStorage apenas se account não for null
        if (typeof window !== "undefined") {
          if (account) {
            localStorage.setItem(STORAGE_KEY, account.id)
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      },

      switchAccount: async (
        accountId: string,
        session: any,
        update: any,
        updateToken: (token: string | undefined, account_id: string) => Promise<UpdateTokenResponse | undefined>,
        router?: any
      ) => {
        const { availableAccounts } = get()
        const account = availableAccounts.find((acc) => acc.id === accountId)
        if (!account) {
          throw new Error("Conta não encontrada")
        }

        if (!session?.accessToken) {
          throw new Error("Token de acesso não encontrado")
        }

        set({ isSwitching: true })

        try {
          // Atualizar o token para a nova conta
          const updateTokenResponse = await updateToken(session.accessToken, accountId)

          if (!updateTokenResponse) {
            throw new Error("Falha ao atualizar token")
          }

          // Atualizar a sessão do NextAuth com o novo token, role e currentAccountId
          await update({
            accessToken: updateTokenResponse.token,
            role: updateTokenResponse.role,
            permissions: updateTokenResponse.permissions,
            currentAccountId: accountId,
            accounts: session.accounts,
          })

          // Salvar a conta atual
          get().setCurrentAccount(account)

          // Usar router.refresh() se disponível, senão usar window.location.href
          // Isso evita problemas de hidratação do React
          if (typeof window !== "undefined") {
            if (router?.refresh) {
              // Next.js router.refresh() é mais suave e não causa problemas de hidratação
              router.refresh()
            } else {
              // Fallback: usar window.location.href em vez de reload()
              window.location.href = window.location.pathname + window.location.search
            }
          }

          // Salvar a conta atual
          get().setCurrentAccount(account)

          // Recarregar página para atualizar dados
          if (typeof window !== "undefined") {
            window.location.reload()
          }
        } catch (error) {
          console.error("Erro ao trocar conta:", error)
          set({ isSwitching: false })
          throw error
        }
      },

      setAvailableAccounts: (accounts) => set({ availableAccounts: accounts }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSwitching: (switching) => set({ isSwitching: switching }),
      reset: () =>
        set({
          currentAccount: null,
          availableAccounts: [],
          isLoading: false,
          isSwitching: false,
        }),
    }),
    {
      name: "account-storage",
      partialize: (state) => ({
        currentAccountId: state.currentAccount?.id,
      }),
    }
  )
)
