"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  SettingRow,
  SettingsCard,
  SettingsGroupTitle,
  settingsButtonNeutral,
} from "./shared"

const rowPadding = "px-6 py-5 sm:py-6"
const rfSelectTrigger =
  "w-full min-w-0 rounded-xl border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)] font-[family-name:var(--rf-font-body)] text-[var(--rf-text-primary)] hover:bg-[var(--rf-bg-hover)]"

export function WorkspaceSection({ workspaceName }: { workspaceName: string }) {
  const [name, setName] = useState(workspaceName || "OTicket Tecnologia Ltda")
  const [slug, setSlug] = useState("oticket")
  const [tz, setTz] = useState("america-sao-paulo")
  const [currency, setCurrency] = useState("brl")
  const [lang, setLang] = useState("pt-br")
  const [weekStart, setWeekStart] = useState("monday")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Configurações do workspace atualizadas.")
    setSaving(false)
  }

  return (
    <div className="space-y-10">
      {/* — Identidade — */}
      <div className="space-y-3">
        <SettingsGroupTitle title="Identidade da empresa" />
        <SettingsCard className="divide-y divide-[color:var(--rf-border-subtle)]">
          <SettingRow
            className={cn(rowPadding, "border-b-0")}
            label="Logo da empresa"
            description="Exibida na sidebar e nos relatórios exportados."
            control={
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[color:var(--rf-border-strong)] bg-[var(--rf-bg-elevated)]">
                  <ImageIcon className="size-5 text-[var(--rf-text-muted)]" strokeWidth={1.6} />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", settingsButtonNeutral)}
                  >
                    Fazer upload
                  </Button>
                  <span className="text-[10.5px] text-[var(--rf-text-secondary)]">
                    PNG ou SVG · Máx 2MB
                  </span>
                </div>
              </div>
            }
          />
          <SettingRow
            className={cn(rowPadding, "border-b-0")}
            label="Nome da empresa"
            description="Aparece em relatórios e e-mails enviados."
            control={
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-w-0 rounded-xl border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)]"
              />
            }
          />
          <SettingRow
            className={cn(rowPadding, "border-b-0 last:border-b-0")}
            label="Slug do workspace"
            description={`URL de acesso: orbit.com.br/${slug || "slug"}`}
            control={
              <Input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())
                }
                className="w-full min-w-0 rounded-xl border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)] font-mono text-[12.5px]"
              />
            }
          />
        </SettingsCard>
      </div>

      {/* — Preferências regionais — */}
      <div className="space-y-3">
        <SettingsGroupTitle title="Preferências regionais" />
        <SettingsCard className="divide-y divide-[color:var(--rf-border-subtle)]">
          <SettingRow
            className={cn(rowPadding, "border-b-0")}
            label="Fuso horário"
            description="Usado nos horários de rituais e notificações."
            control={
              <Select value={tz} onValueChange={setTz}>
                <SelectTrigger className={rfSelectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america-sao-paulo">
                    América/São Paulo (UTC-3)
                  </SelectItem>
                  <SelectItem value="america-fortaleza">
                    América/Fortaleza (UTC-3)
                  </SelectItem>
                  <SelectItem value="america-manaus">América/Manaus (UTC-4)</SelectItem>
                  <SelectItem value="america-belem">América/Belém (UTC-3)</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            className={cn(rowPadding, "border-b-0")}
            label="Moeda padrão"
            description="Usada nos KPIs financeiros."
            control={
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className={rfSelectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brl">BRL — Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="usd">USD — Dólar Americano ($)</SelectItem>
                  <SelectItem value="eur">EUR — Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            className={cn(rowPadding, "border-b-0")}
            label="Idioma"
            description="Idioma padrão de todos os membros."
            control={
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className={rfSelectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-br">Português (BR)</SelectItem>
                  <SelectItem value="en-us">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingRow
            className={cn(rowPadding, "border-b-0 last:border-b-0")}
            label="Início da semana"
            description="Afeta o calendário e relatórios semanais."
            control={
              <Select value={weekStart} onValueChange={setWeekStart}>
                <SelectTrigger className={rfSelectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Domingo</SelectItem>
                  <SelectItem value="monday">Segunda-feira</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsCard>
      </div>

      {/* — Zona de perigo — */}
      <div className="space-y-3">
        <SettingsGroupTitle title="Zona de perigo" />
        <SettingsCard className="border-destructive/20 bg-destructive/5 shadow-none dark:bg-destructive/8">
          <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", rowPadding)}>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-snug text-destructive">
                Excluir workspace
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--rf-text-secondary)]">
                Remove permanentemente todos os dados. Essa ação é irreversível.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive dark:bg-destructive/15"
            >
              Excluir workspace
            </Button>
          </div>
        </SettingsCard>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className={cn("w-full sm:w-auto", settingsButtonNeutral)}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="w-full rounded-xl bg-[var(--rf-accent)] px-5 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(123,97,255,0.35)] hover:bg-[var(--rf-accent-hover)] sm:w-auto"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  )
}
