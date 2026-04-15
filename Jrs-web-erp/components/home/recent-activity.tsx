"use client"

import {
  UserPlus,
  CreditCard,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: "1",
    icon: UserPlus,
    title: "Novo usuário cadastrado",
    description: "Ana Paula Silva foi adicionada como Operadora",
    time: "Há 5 minutos",
    color: "text-primary bg-primary/10",
  },
  {
    id: "2",
    icon: CreditCard,
    title: "Pagamento recebido",
    description: "R$ 15.840,00 via PIX - Show Rock",
    time: "Há 15 minutos",
    color: "text-chart-2 bg-chart-2/10",
  },
  {
    id: "3",
    icon: AlertTriangle,
    title: "Alerta de estoque",
    description: "Ingressos VIP para Festival quase esgotados",
    time: "Há 1 hora",
    color: "text-chart-4 bg-chart-4/10",
  },
  {
    id: "4",
    icon: Ticket,
    title: "Novo evento criado",
    description: "Copa do Brasil - Semifinal foi publicado",
    time: "Há 2 horas",
    color: "text-chart-3 bg-chart-3/10",
  },
  {
    id: "5",
    icon: CheckCircle2,
    title: "Repasse concluído",
    description: "R$ 45.000,00 transferido para Produtor XYZ",
    time: "Há 3 horas",
    color: "text-primary bg-primary/10",
  },
  {
    id: "6",
    icon: Settings,
    title: "Configurações atualizadas",
    description: "Taxa de serviço alterada para 10%",
    time: "Há 5 horas",
    color: "text-muted-foreground bg-muted",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    activity.color
                  )}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-card-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
