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
import { ImageIcon, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Section, SettingRow } from "./shared"

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <Check className="size-3" strokeWidth={2.5} />
          Sócio — acesso total
        </span>
      </div>

      <Section title="Identidade da empresa">
        <SettingRow
          label="Logo da empresa"
          description="Exibida na sidebar e nos relatórios exportados."
          control={
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
                <ImageIcon className="size-5 text-muted-foreground/70" strokeWidth={1.6} />
              </div>
              <div className="flex flex-col items-start gap-1">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  Fazer upload
                </Button>
                <span className="text-[10.5px] text-muted-foreground">
                  PNG ou SVG · Máx 2MB
                </span>
              </div>
            </div>
          }
        />
        <SettingRow
          label="Nome da empresa"
          description="Aparece em relatórios e e-mails enviados."
          control={
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full sm:w-[260px]"
            />
          }
        />
        <SettingRow
          label="Slug do workspace"
          description={`URL de acesso: orbit.com.br/${slug}`}
          control={
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())}
              className="w-full font-mono text-[12.5px] sm:w-[200px]"
            />
          }
        />
      </Section>

      <Section title="Preferências regionais">
        <SettingRow
          label="Fuso horário"
          description="Usado nos horários de rituais e notificações."
          control={
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="america-sao-paulo">
                  América/São Paulo (UTC-3)
                </SelectItem>
                <SelectItem value="america-fortaleza">
                  América/Fortaleza (UTC-3)
                </SelectItem>
                <SelectItem value="america-manaus">
                  América/Manaus (UTC-4)
                </SelectItem>
                <SelectItem value="america-belem">América/Belém (UTC-3)</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <SettingRow
          label="Moeda padrão"
          description="Usada nos KPIs financeiros."
          control={
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full sm:w-[240px]">
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
          label="Idioma"
          description="Idioma padrão de todos os membros."
          control={
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-full sm:w-[240px]">
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
          label="Início da semana"
          description="Afeta o calendário e relatórios semanais."
          control={
            <Select value={weekStart} onValueChange={setWeekStart}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Domingo</SelectItem>
                <SelectItem value="monday">Segunda-feira</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </Section>

      <Section title="Zona de perigo">
        <SettingRow
          label="Excluir workspace"
          description="Remove permanentemente todos os dados. Essa ação é irreversível."
          danger
          control={
            <Button variant="destructive" size="sm">
              Excluir workspace
            </Button>
          }
        />
      </Section>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className="bg-transparent">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  )
}
