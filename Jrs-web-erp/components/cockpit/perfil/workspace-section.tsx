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
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  SettingRow,
  SettingsCard,
  SettingsGroupTitle,
  settingsButtonNeutral,
  settingsButtonPrimary,
} from "./shared"

const rowPadding = "px-6 py-5 sm:py-6"
const rfSelectTrigger =
  "w-full min-w-0 rounded-lg border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)] font-[family-name:var(--rf-font-body)] text-[var(--rf-text-primary)] hover:bg-[var(--rf-bg-hover)]"

export function WorkspaceSection({ workspaceName }: { workspaceName: string }) {
  const baselineName = workspaceName || "OTicket Tecnologia Ltda"
  const baselineSlug = "oticket"
  const baselineTz = "america-sao-paulo"
  const baselineCurrency = "brl"
  const baselineLang = "pt-br"
  const baselineWeekStart = "monday"

  const [name, setName] = useState(baselineName)
  const [slug, setSlug] = useState(baselineSlug)
  const [tz, setTz] = useState(baselineTz)
  const [currency, setCurrency] = useState(baselineCurrency)
  const [lang, setLang] = useState(baselineLang)
  const [weekStart, setWeekStart] = useState(baselineWeekStart)
  const [saving, setSaving] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pickedFileLabel, setPickedFileLabel] = useState<string | null>(null)
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(baselineName)
  }, [baselineName])

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Configurações do workspace atualizadas.")
    setSaving(false)
  }

  function handleCancel() {
    setName(baselineName)
    setSlug(baselineSlug)
    setTz(baselineTz)
    setCurrency(baselineCurrency)
    setLang(baselineLang)
    setWeekStart(baselineWeekStart)
    toast.message("Alterações descartadas.")
  }

  function onLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setPickedFileLabel(f.name)
      setUploadDialogOpen(true)
    }
    e.target.value = ""
  }

  function confirmLogoUpload() {
    toast.success(
      pickedFileLabel
        ? `Logo atualizada (${pickedFileLabel}).`
        : "Logo atualizada."
    )
    setUploadDialogOpen(false)
    setPickedFileLabel(null)
  }

  return (
    <div className="space-y-10">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/svg+xml,.svg,.png"
        className="sr-only"
        tabIndex={-1}
        onChange={onLogoFileChange}
      />

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Confirmar logo</DialogTitle>
            <DialogDescription>
              {pickedFileLabel
                ? `Arquivo selecionado: ${pickedFileLabel}. Confirmar uso como logo da empresa?`
                : "Confirmar atualização da logo?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className={settingsButtonNeutral}
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="default" className={settingsButtonPrimary} onClick={confirmLogoUpload}>
              Confirmar upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteWorkspaceOpen} onOpenChange={setDeleteWorkspaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados serão removidos de forma permanente. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={settingsButtonNeutral}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() => toast.error("Demonstração — exclusão não executada.")}
            >
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed",
                    "border-[color:var(--rf-accent-border)] bg-[var(--rf-bg-elevated)] outline-none transition-colors",
                    "hover:border-[var(--rf-accent)] hover:bg-[var(--rf-accent-soft)]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--rf-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rf-bg-surface)]"
                  )}
                  aria-label="Selecionar logo da empresa"
                >
                  <ImageIcon className="size-5 text-[var(--rf-text-muted)]" strokeWidth={1.6} />
                </button>
                <div className="flex flex-col items-start gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("gap-2", settingsButtonNeutral)}
                    onClick={() => fileRef.current?.click()}
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
                className="w-full min-w-0 rounded-lg border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)]"
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
                className="w-full min-w-0 rounded-lg border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)] font-mono text-[12.5px]"
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
              className="shrink-0 rounded-lg border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive dark:bg-destructive/15"
              onClick={() => setDeleteWorkspaceOpen(true)}
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
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={saving}
          onClick={() => void handleSave()}
          className={cn("w-full sm:w-auto", settingsButtonPrimary, "px-5")}
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  )
}
