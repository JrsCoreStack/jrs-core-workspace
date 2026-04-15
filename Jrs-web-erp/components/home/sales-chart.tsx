"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { name: "Jan", eventos: 4000, play: 2400 },
  { name: "Fev", eventos: 3000, play: 1398 },
  { name: "Mar", eventos: 2000, play: 9800 },
  { name: "Abr", eventos: 2780, play: 3908 },
  { name: "Mai", eventos: 1890, play: 4800 },
  { name: "Jun", eventos: 2390, play: 3800 },
  { name: "Jul", eventos: 3490, play: 4300 },
]

export function SalesChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Vendas por Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEventos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.18 160)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.65 0.18 160)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPlay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
            <XAxis
              dataKey="name"
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.17 0.01 260)",
                border: "1px solid oklch(0.28 0.01 260)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="eventos"
              name="OTicket Eventos"
              stroke="oklch(0.65 0.18 160)"
              fillOpacity={1}
              fill="url(#colorEventos)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="play"
              name="OTicket Play"
              stroke="oklch(0.6 0.15 200)"
              fillOpacity={1}
              fill="url(#colorPlay)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">OTicket Eventos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">OTicket Play</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
