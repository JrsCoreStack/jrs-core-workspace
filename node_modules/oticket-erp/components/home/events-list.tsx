"use client"

import { Calendar, MapPin, Users, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const events = [
  {
    id: "1",
    name: "Show Rock in Rio",
    date: "25 Jan, 2026",
    location: "Rio de Janeiro, RJ",
    soldTickets: 85000,
    totalTickets: 100000,
    status: "Em vendas",
    product: "integrado",
  },
  {
    id: "2",
    name: "Final Campeonato Brasileiro",
    date: "15 Fev, 2026",
    location: "São Paulo, SP",
    soldTickets: 45000,
    totalTickets: 60000,
    status: "Em vendas",
    product: "play",
  },
  {
    id: "3",
    name: "Festival de Verão",
    date: "10 Mar, 2026",
    location: "Salvador, BA",
    soldTickets: 12000,
    totalTickets: 50000,
    status: "Pré-venda",
    product: "integrado",
  },
  {
    id: "4",
    name: "Copa do Brasil - Semifinal",
    date: "20 Mar, 2026",
    location: "Belo Horizonte, MG",
    soldTickets: 0,
    totalTickets: 35000,
    status: "Agendado",
    product: "play",
  },
]

const statusColors: Record<string, string> = {
  "Em vendas": "bg-primary/20 text-primary border-primary/30",
  "Pré-venda": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Agendado: "bg-muted text-muted-foreground border-muted",
  Encerrado: "bg-chart-5/20 text-chart-5 border-chart-5/30",
}

const productColors: Record<string, string> = {
  integrado: "bg-primary/10 text-primary",
  play: "bg-chart-2/10 text-chart-2",
}

export function EventsList() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Próximos Eventos
        </CardTitle>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-card-foreground">{event.name}</h3>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", productColors[event.product])}
                    >
                      {event.product === "integrado" ? "Projeto integrado" : "Play"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", statusColors[event.status])}>
                    {event.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.soldTickets.toLocaleString("pt-BR")} /{" "}
                      {event.totalTickets.toLocaleString("pt-BR")} ingressos
                    </span>
                  </div>
                  <span className="font-medium text-card-foreground">
                    {Math.round((event.soldTickets / event.totalTickets) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(event.soldTickets / event.totalTickets) * 100}
                  className="h-2 bg-muted"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
