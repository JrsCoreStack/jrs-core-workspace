"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Monitor, Shield, Smartphone } from "lucide-react"
import { SettingsCard, SettingsGroupTitle } from "./shared"

type SessionItem = {
  id: string
  icon: "desktop" | "mobile"
  name: string
  meta: string
  current?: boolean
}

const sessions: SessionItem[] = [
  {
    id: "1",
    icon: "desktop",
    name: "MacBook Pro · Chrome 124",
    meta: "São Paulo, Brasil · Hoje 09:14",
    current: true,
  },
  {
    id: "2",
    icon: "mobile",
    name: "iPhone 15 · Safari",
    meta: "São Paulo, Brasil · Ontem 22:41",
  },
  {
    id: "3",
    icon: "desktop",
    name: "Windows 11 · Edge 123",
    meta: "Campinas, Brasil · 3 dias atrás",
  },
]

/** Botões secundários estilo Orbit: fundo branco, borda cinza */
const ghostAction =
  "h-9 border border-border bg-white px-4 text-[13px] font-semibold text-foreground shadow-none hover:bg-muted/50 dark:border-border dark:bg-card dark:hover:bg-muted/30"

export function SecuritySection() {
  return (
    <div className="space-y-10">
      {/* ── Senha ── */}
      <div className="space-y-3">
        <SettingsGroupTitle title="SENHA" />
        <SettingsCard>
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-foreground">
                Senha atual
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Última alteração há 47 dias
              </p>
            </div>
            <Button variant="outline" size="sm" className={cn("shrink-0", ghostAction)}>
              Alterar senha
            </Button>
          </div>
        </SettingsCard>
      </div>

      {/* ── 2FA ── */}
      <div className="space-y-3">
        <SettingsGroupTitle title="AUTENTICAÇÃO EM DOIS FATORES" />
        <SettingsCard>
          {/* Status do autenticador */}
          <div className="flex flex-col gap-4 border-b border-border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                aria-hidden
              >
                <Shield className="size-[22px]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-snug text-foreground">
                  Autenticador ativo
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                  Protegido com Google Authenticator
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className={cn("shrink-0", ghostAction)}>
              Desativar
            </Button>
          </div>
          {/* Códigos de recuperação */}
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-foreground">
                Códigos de recuperação
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                8 códigos disponíveis — use se perder acesso ao app
              </p>
            </div>
            <Button variant="outline" size="sm" className={cn("shrink-0", ghostAction)}>
              Ver códigos
            </Button>
          </div>
        </SettingsCard>
      </div>

      {/* ── Sessões ── */}
      <div className="space-y-3">
        <SettingsGroupTitle title="SESSÕES ATIVAS" />
        <SettingsCard className="divide-y divide-border">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                  aria-hidden
                >
                  {s.icon === "desktop" ? (
                    <Monitor className="size-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Smartphone className="size-[18px]" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-semibold leading-snug text-foreground">
                      {s.name}
                    </p>
                    {s.current && (
                      <span className="inline-flex items-center rounded-md bg-[#ede9fe] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary dark:bg-primary/15">
                        SESSÃO ATUAL
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {s.meta}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button variant="outline" size="sm" className={cn("shrink-0 sm:self-center", ghostAction)}>
                  Encerrar
                </Button>
              )}
            </div>
          ))}
        </SettingsCard>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-destructive/25 bg-destructive/10 px-4 text-[13px] font-semibold text-destructive shadow-none hover:bg-destructive/15 hover:text-destructive dark:bg-destructive/15"
        >
          Encerrar todas as outras sessões
        </Button>
      </div>
    </div>
  )
}
