"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, FileText } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  PaymentCardBrandIcon,
  type CardBrand,
} from "./payment-card-brand-icon"
import { SettingsCard, SettingsGroupTitle, StatusDot, settingsButtonNeutral } from "./shared"

const payments: {
  period: string
  detail: string
  value: string
  brand?: CardBrand
}[] = [
  {
    period: "Abr 2026",
    detail: "Orbit Pro · 10 assentos",
    value: "R$ 297,00",
    brand: "visa",
  },
  {
    period: "Mar 2026",
    detail: "Orbit Pro · 10 assentos",
    value: "R$ 297,00",
    brand: "mastercard",
  },
  {
    period: "Fev 2026",
    detail: "Orbit Pro · 10 assentos",
    value: "R$ 297,00",
    brand: "elo",
  },
  {
    period: "Jan 2026",
    detail: "Orbit Starter (upgrade)",
    value: "R$ 149,00",
    brand: "visa",
  },
]

const defaultPayment = {
  last4: "4242",
  brand: "mastercard" as CardBrand,
  expiryLabel: "09/2028",
}

function cardBrandLabel(brand: CardBrand): string {
  const names: Record<CardBrand, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    elo: "Elo",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    hipercard: "Hipercard",
    jcb: "JCB",
    unionpay: "UnionPay",
    unknown: "Cartão",
  }
  return names[brand]
}

export function BillingSection() {
  const [planModal, setPlanModal] = useState(false)
  const [cancelSubscriptionOpen, setCancelSubscriptionOpen] = useState(false)
  const [changeCardOpen, setChangeCardOpen] = useState(false)

  return (
    <div className="space-y-8">
      <Dialog open={planModal} onOpenChange={setPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar plano</DialogTitle>
            <DialogDescription>
              Compare os planos Orbit Starter, Pro e Enterprise. Fluxo demonstrativo até a
              integração com o gateway de cobrança.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className={settingsButtonNeutral}
              onClick={() => setPlanModal(false)}
            >
              Fechar
            </Button>
            <Button
              variant="outline"
              className={cn(
                settingsButtonNeutral,
                "border-0 bg-[var(--rf-accent)] text-white hover:bg-[var(--rf-accent-hover)] hover:text-white"
              )}
              onClick={() => {
                toast.success("Solicitação de alteração de plano registrada (demo).")
                setPlanModal(false)
              }}
            >
              Continuar para escolha de plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelSubscriptionOpen} onOpenChange={setCancelSubscriptionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao cancelar você perderá os recursos do plano pago quando o período atual terminar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={settingsButtonNeutral}>Manter plano</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                toast("Demonstração — nenhuma cobrança foi alterada.", { duration: 4000 })
              }
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={changeCardOpen} onOpenChange={setChangeCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar cartão</DialogTitle>
            <DialogDescription>
              Em produção você será redirecionado ao checkout seguro. Fluxo apenas simulado aqui.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className={settingsButtonNeutral}
              onClick={() => setChangeCardOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              className={cn(
                settingsButtonNeutral,
                "border-0 bg-[var(--rf-accent)] text-white hover:bg-[var(--rf-accent-hover)] hover:text-white"
              )}
              onClick={() => {
                toast.success("Cartão padrão atualizado (demo).")
                setChangeCardOpen(false)
              }}
            >
              Salvar novo cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <SettingsGroupTitle title="Plano atual" />
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--rf-border-default)] bg-[var(--rf-bg-surface)] p-6 shadow-[var(--rf-shadow-sm)]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[var(--rf-accent)] via-[#6366f1] to-cyan-400" />
          <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div>
                <p className="font-display text-lg font-extrabold tracking-tight text-[var(--rf-text-primary)]">
                  Orbit Pro
                </p>
                <p className="mt-1 font-display text-[28px] font-bold leading-none text-[var(--rf-accent)]">
                  R$ 297
                  <span className="ml-1 text-[14px] font-medium text-[var(--rf-text-secondary)]">
                    /mês
                  </span>
                </p>
                <p className="mt-1.5 text-[12px] text-[var(--rf-text-secondary)]">
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
                    className="flex items-center gap-2 text-[13px] text-[var(--rf-text-secondary)]"
                  >
                    <Check className="size-3.5 text-emerald-500" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <StatusDot tone="ok" label="Ativo" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={settingsButtonNeutral}
                onClick={() => setPlanModal(true)}
              >
                Alterar plano
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={settingsButtonNeutral}
                onClick={() => setCancelSubscriptionOpen(true)}
              >
                Cancelar assinatura
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SettingsGroupTitle title="Método de pagamento" />
        <SettingsCard className="p-0 shadow-[var(--rf-shadow-sm)]">
          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PaymentCardBrandIcon brand={defaultPayment.brand} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--rf-text-primary)]">
                  Cartão terminado em {defaultPayment.last4}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--rf-text-secondary)]">
                  {cardBrandLabel(defaultPayment.brand)} · Expira {defaultPayment.expiryLabel}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                Padrão
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={settingsButtonNeutral}
                onClick={() => setChangeCardOpen(true)}
              >
                Trocar
              </Button>
            </div>
          </div>
        </SettingsCard>
      </div>

      <div className="space-y-3">
        <SettingsGroupTitle title="Histórico de pagamentos" />
        <SettingsCard className="divide-y divide-[color:var(--rf-border-subtle)] p-0 shadow-[var(--rf-shadow-sm)]">
          {payments.map((p) => (
            <div
              key={p.period}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <PaymentCardBrandIcon brand={p.brand ?? "unknown"} />
                <div>
                  <p className="text-sm font-semibold text-[var(--rf-text-primary)]">{p.period}</p>
                  <p className="text-[11.5px] text-[var(--rf-text-secondary)]">{p.detail}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[12px] text-[var(--rf-text-secondary)]">
                  {p.value}
                </span>
                <span className="text-[11px] font-bold text-emerald-500">Pago</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("gap-1.5", settingsButtonNeutral)}
                  onClick={() =>
                    toast.success(`PDF da fatura ${p.period} (demonstração).`, { duration: 3000 })
                  }
                >
                  <FileText className="size-3.5" strokeWidth={1.8} />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </SettingsCard>
      </div>
    </div>
  )
}
