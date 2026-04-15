"use client"

import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Wallet,
  Receipt,
  Download,
  TrendingUp,
  DollarSign,
  ArrowRight,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: "1",
    description: "Venda de ingressos - Show Rock",
    amount: "+R$ 15.840,00",
    type: "entrada",
    date: "Hoje, 14:32",
    method: "PIX",
  },
  {
    id: "2",
    description: "Taxa de serviço - Evento XYZ",
    amount: "+R$ 3.200,00",
    type: "entrada",
    date: "Hoje, 12:15",
    method: "Cartão",
  },
  {
    id: "3",
    description: "Repasse para produtor",
    amount: "-R$ 45.000,00",
    type: "saida",
    date: "Ontem, 18:00",
    method: "TED",
  },
  {
    id: "4",
    description: "Estorno - Ingresso #12345",
    amount: "-R$ 150,00",
    type: "saida",
    date: "Ontem, 16:45",
    method: "PIX",
  },
  {
    id: "5",
    description: "Venda de ingressos - Festival",
    amount: "+R$ 28.500,00",
    type: "entrada",
    date: "Ontem, 10:20",
    method: "Cartão",
  },
]

const balanceCards = [
  {
    title: "Saldo Disponível",
    value: "R$ 234.567,89",
    icon: Wallet,
    color: "text-primary bg-primary/10",
  },
  {
    title: "A Receber",
    value: "R$ 89.432,10",
    icon: ArrowDownLeft,
    color: "text-chart-2 bg-chart-2/10",
  },
  {
    title: "A Pagar",
    value: "R$ 45.678,00",
    icon: ArrowUpRight,
    color: "text-chart-5 bg-chart-5/10",
  },
]

export function FinancialSummary() {
  return (
    <div className="space-y-6">
      {/* Cards de Acesso Rápido */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card Transações */}
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-card-foreground">
                    Transações
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize e gerencie todas as transações financeiras
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/financial/transactions">
              <Button className="w-full gap-2" variant="default">
                Acessar Transações
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card Saldo por Evento */}
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-card-foreground">
                    Saldo por Evento
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize saldos e valores a repassar aos produtores
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/financial/events-balance">
              <Button className="w-full gap-2" variant="default">
                Acessar Saldo por Evento
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards */}
      {/* <div className="grid gap-4 md:grid-cols-3">
        {balanceCards.map((card) => (
          <Card key={card.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{card.value}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.color)}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  )
}
