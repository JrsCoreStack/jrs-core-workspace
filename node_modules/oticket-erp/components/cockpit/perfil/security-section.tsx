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
import { Monitor, Shield, Smartphone } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { SettingsCard, SettingsGroupTitle, settingsButtonNeutral } from "./shared"

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

export function SecuritySection() {
  const [pwdOpen, setPwdOpen] = useState(false)
  const [codesOpen, setCodesOpen] = useState(false)
  const [disable2faOpen, setDisable2faOpen] = useState(false)
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<SessionItem | null>(null)

  return (
    <div className="space-y-10">
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Fluxo demonstrativo — em produção seguiríamos com verificação e política da sua
              organização.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className={settingsButtonNeutral} onClick={() => setPwdOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="outline"
              className={cn(
                settingsButtonNeutral,
                "border-0 bg-[var(--rf-accent)] text-white hover:bg-[var(--rf-accent-hover)] hover:text-white"
              )}
              onClick={() => {
                toast.success("Solicitação de alteração de senha registrada (demo).")
                setPwdOpen(false)
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={disable2faOpen} onOpenChange={setDisable2faOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar autenticação em dois fatores?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso reduz a segurança da conta. Você só deverá fazer isso quando trocar de
              dispositivos autenticadores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={settingsButtonNeutral}>Manter ativo</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                toast("Demonstração — 2FA permanece ativo neste exemplo.", {
                  duration: 4000,
                })
              }
            >
              Desativar 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={codesOpen} onOpenChange={setCodesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Códigos de recuperação</DialogTitle>
            <DialogDescription>Guarde em local seguro. Exemplo apenas para demo.</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 font-mono text-[13px] text-foreground">
            {["XK7P-Q2MN-9RST", "L4WZ-HJ8Y-CV3B", "F6NA-DE2U-KP91"].map((c) => (
              <li
                key={c}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2"
              >
                {c}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" className={settingsButtonNeutral} onClick={() => setCodesOpen(false)}>
              Copiei os códigos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget
                ? `A sessão em ${revokeTarget.name} será encerrada.`
                : "Encerrar esta sessão?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={settingsButtonNeutral}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                toast.success(`Sessão encerrada (demo): ${revokeTarget?.name ?? ""}`)
                setRevokeTarget(null)
              }}
            >
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar todas as outras sessões?</AlertDialogTitle>
            <AlertDialogDescription>
              Você permanecerá conectado neste dispositivo. Demais dispositivos precisarão fazer login
              de novo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={settingsButtonNeutral}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                toast.success("Outras sessões encerradas (demonstração).", { duration: 3500 })
              }
            >
              Encerrar todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Senha */}
      <div className="space-y-3">
        <SettingsGroupTitle title="SENHA" />
        <SettingsCard>
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-foreground">Senha atual</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Última alteração há 47 dias
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn("shrink-0", settingsButtonNeutral)}
              onClick={() => setPwdOpen(true)}
            >
              Alterar senha
            </Button>
          </div>
        </SettingsCard>
      </div>

      {/* 2FA */}
      <div className="space-y-3">
        <SettingsGroupTitle title="AUTENTICAÇÃO EM DOIS FATORES" />
        <SettingsCard>
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
            <Button
              variant="outline"
              size="sm"
              className={cn("shrink-0", settingsButtonNeutral)}
              onClick={() => setDisable2faOpen(true)}
            >
              Desativar
            </Button>
          </div>
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-foreground">
                Códigos de recuperação
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                8 códigos disponíveis — use se perder acesso ao app
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn("shrink-0", settingsButtonNeutral)}
              onClick={() => setCodesOpen(true)}
            >
              Ver códigos
            </Button>
          </div>
        </SettingsCard>
      </div>

      {/* Sessões */}
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
                    <p className="text-[14px] font-semibold leading-snug text-foreground">{s.name}</p>
                    {s.current && (
                      <span className="inline-flex items-center rounded-md bg-[#ede9fe] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary dark:bg-primary/15">
                        SESSÃO ATUAL
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.meta}</p>
                </div>
              </div>
              {!s.current && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("shrink-0 sm:self-center", settingsButtonNeutral)}
                  onClick={() => setRevokeTarget(s)}
                >
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
          className="rounded-lg border-destructive/25 bg-destructive/10 px-4 text-[13px] font-semibold text-destructive shadow-none hover:bg-destructive/15 hover:text-destructive dark:bg-destructive/15"
          onClick={() => setRevokeAllOpen(true)}
        >
          Encerrar todas as outras sessões
        </Button>
      </div>
    </div>
  )
}
