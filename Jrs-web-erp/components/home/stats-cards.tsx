"use client"

import * as React from "react"
import {
  DollarSign,
  Users,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Trophy,
  UserPlus,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useAccountStore } from "@/stores/account-store"
import { useFinancialEntryService } from "@/hooks/use-financial-entry-service"
import { FinancialStats } from "@/models/financial-entry"
import { Spinner } from "@/components/ui/spinner"

interface StatCard {
  title: string
  value: string
  trend?: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
  color: string
  change?: string
}

// Função para formatar valores monetários
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function StatsCards() {
  const currentAccount = useAccountStore((state) => state.currentAccount)
  const { GET_STATS } = useFinancialEntryService()
  const [financialStats, setFinancialStats] = React.useState<FinancialStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Rastrear o último accountId que foi usado para fazer a requisição
  const lastAccountIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    // Se não tiver conta, limpar dados
    if (!currentAccount) {
      setFinancialStats(null)
      lastAccountIdRef.current = null
      return
    }

    // Se o accountId não mudou, não fazer requisição novamente
    if (lastAccountIdRef.current === currentAccount.id) {
      return
    }



    const fetchFinancialStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await GET_STATS(currentAccount.id)
        if (data) {
          setFinancialStats(data)
          lastAccountIdRef.current = currentAccount.id
        } else {
          setError("Erro ao carregar dados")
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas financeiras:", err)
        setError("Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialStats()
  }, [currentAccount?.id, currentAccount?.code, GET_STATS])

  // Definir cards baseado no code da conta
  const getStats = (): StatCard[] => {
    if (!currentAccount) {
      return []
    }

    switch (currentAccount.code) {
      case "oticket-grupo":
        if (financialStats) {
          return [
            {
              title: "Receita Total",
              value: formatCurrency(financialStats.revenue),
              trend: "up",
              icon: DollarSign,
              color: "text-primary bg-primary/10",
            },
            {
              title: "Custos",
              value: formatCurrency(financialStats.cost),
              trend: "down",
              icon: TrendingDown,
              color: "text-chart-5 bg-chart-5/10",
            },
            {
              title: "Lucro",
              value: formatCurrency(financialStats.profit),
              trend: financialStats.profit >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "text-chart-2 bg-chart-2/10",
            },
          ]
        }

        return [
          {
            title: "Receita Total",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: DollarSign,
            color: "text-primary bg-primary/10",
          },
          {
            title: "Custos",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "down",
            icon: TrendingDown,
            color: "text-chart-5 bg-chart-5/10",
          },
          {
            title: "Lucro",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: TrendingUp,
            color: "text-chart-2 bg-chart-2/10",
          },
        ]

      case "jrs-external-sales":

        if (financialStats) {
          return [
            {
              title: "Receita Total",
              value: formatCurrency(financialStats.revenue),
              trend: "up",
              icon: DollarSign,
              color: "text-primary bg-primary/10",
            },
            {
              title: "Custos",
              value: formatCurrency(financialStats.cost),
              trend: "down",
              icon: TrendingDown,
              color: "text-chart-5 bg-chart-5/10",
            },
            {
              title: "Lucro",
              value: formatCurrency(financialStats.profit),
              trend: financialStats.profit >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "text-chart-2 bg-chart-2/10",
            },
          ]
        }

        return [
          {
            title: "Receita Total",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: DollarSign,
            color: "text-primary bg-primary/10",
          },
          {
            title: "Custos",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "down",
            icon: TrendingDown,
            color: "text-chart-5 bg-chart-5/10",
          },
          {
            title: "Lucro",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: TrendingUp,
            color: "text-chart-2 bg-chart-2/10",
          },
        ]

      case "oticket-play":
        if (financialStats) {
          return [
            {
              title: "Receita Total",
              value: formatCurrency(financialStats.revenue),
              trend: "up",
              icon: DollarSign,
              color: "text-primary bg-primary/10",
            },
            {
              title: "Custos",
              value: formatCurrency(financialStats.cost),
              trend: "down",
              icon: TrendingDown,
              color: "text-chart-5 bg-chart-5/10",
            },
            {
              title: "Lucro",
              value: formatCurrency(financialStats.profit),
              trend: financialStats.profit >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "text-chart-2 bg-chart-2/10",
            },
          ]
        }

        return [
          {
            title: "Receita Total",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: DollarSign,
            color: "text-primary bg-primary/10",
          },
          {
            title: "Custos",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "down",
            icon: TrendingDown,
            color: "text-chart-5 bg-chart-5/10",
          },
          {
            title: "Lucro",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: TrendingUp,
            color: "text-chart-2 bg-chart-2/10",
          },
        ]

      default:
        if (financialStats) {
          return [
            {
              title: "Receita Total",
              value: formatCurrency(financialStats.revenue),
              trend: "up",
              icon: DollarSign,
              color: "text-primary bg-primary/10",
            },
            {
              title: "Custos",
              value: formatCurrency(financialStats.cost),
              trend: "down",
              icon: TrendingDown,
              color: "text-chart-5 bg-chart-5/10",
            },
            {
              title: "Lucro",
              value: formatCurrency(financialStats.profit),
              trend: financialStats.profit >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "text-chart-2 bg-chart-2/10",
            },
          ]
        }

        return [
          {
            title: "Receita Total",
            value: isLoading ? "Carregando..." : error ? "Erro" : "R$ 0,00",
            trend: "up",
            icon: DollarSign,
            color: "text-primary bg-primary/10",
          },
        ]
    }
  }

  const stats = getStats()

  if (stats.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {(stat.title === "Receita Total" || stat.title === "Custos") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">{stat.title}</p>
                    {stat.title === "Receita Total" ? (
                      <p className="text-sm">
                        Soma das taxas administrativas do cliente final e outras receitas operacionais. 
                        <br /><br />
                        <span className="text-xs text-muted-foreground">
                          Nota: Na tela de Transações, "Receita Total" considera entradas de dinheiro (ASSET com DEBIT), 
                          que inclui valores recebidos de vendas. Os cálculos podem diferir.
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm">
                        Soma das taxas de banco/gateway e outros custos operacionais.
                        <br /><br />
                        <span className="text-xs text-muted-foreground">
                          Nota: Na tela de Transações, "Despesas Totais" considera transações do tipo EXPENSE com DEBIT, 
                          que inclui todas as despesas registradas. Os cálculos podem diferir.
                        </span>
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.color)}>
              {/* {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <stat.icon className="h-4 w-4" />
              )} */}
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </span>
              ) : (
                stat.value
              )}
            </div>
            {stat.change && !isLoading && (
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    stat.trend === "up" ? "text-primary" : "text-destructive"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}