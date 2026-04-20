"use client"

import { Button } from "@/components/ui/button"
import { Check, CreditCard, FileText } from "lucide-react"
import { Section, SettingRow, StatusDot } from "./shared"

const payments = [
  { period: "Abr 2026", detail: "Orbit Pro · 10 assentos", value: "R$ 297,00" },
  { period: "Mar 2026", detail: "Orbit Pro · 10 assentos", value: "R$ 297,00" },
  { period: "Fev 2026", detail: "Orbit Pro · 10 assentos", value: "R$ 297,00" },
  { period: "Jan 2026", detail: "Orbit Starter (upgrade)", value: "R$ 149,00" },
]

export function BillingSection() {
  return (
    <div className="space-y-6">
      {/* Plano atual */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
          Plano atual
        </h3>
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-card p-5">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-primary via-chart-2 to-primary" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <p className="font-display text-lg font-extrabold tracking-tight text-foreground">
                  Orbit Pro
                </p>
                <p className="mt-1 font-display text-[28px] font-bold leading-none text-primary">
                  R$ 297
                  <span className="ml-1 text-[14px] font-medium text-muted-foreground">
                    /mês
                  </span>
                </p>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  Cobrado mensalmente · Próxima renovação: 01/05/2026
                </p>
              </div>

              <ul className="space-y-1.5">
                {[
                  "Até 10 membros",
                  "KPIs e rituais ilimitados",
                  "Todas as integrações",
                  "Suporte prioritário",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[13px] text-muted-foreground"
                  >
                    <Check className="size-3.5 text-emerald-500" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <StatusDot tone="ok" label="Ativo" />
              <Button variant="outline" size="sm" className="bg-transparent">
                Alterar plano
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent">
                Cancelar assinatura
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Método de pagamento */}
      <Section title="Método de pagamento">
        <SettingRow
          label="Cartão terminado em 4242"
          description="Visa · Expira 09/2028"
          control={
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 ring-1 ring-emerald-500/20">
                Padrão
              </span>
              <Button variant="outline" size="sm" className="bg-transparent">
                Trocar
              </Button>
            </div>
          }
        />
      </Section>

      {/* Histórico */}
      <Section title="Histórico de pagamentos">
        <div className="divide-y divide-border">
          {payments.map((p) => (
            <div
              key={p.period}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <CreditCard className="size-4" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {p.period}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">{p.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-muted-foreground">
                  {p.value}
                </span>
                <span className="text-[11px] font-bold text-emerald-500">Pago</span>
                <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                  <FileText className="size-3.5" strokeWidth={1.8} />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
