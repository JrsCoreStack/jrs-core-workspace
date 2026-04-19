"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Clock,
  DollarSign,
  Bell,
  Eye,
  Type,
  ArrowLeft,
  Save,
  ChevronRight,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"
import { toast } from "sonner"

/* ─── Section wrapper ─── */
function Section({
  icon,
  label,
  iconClass = "text-muted-foreground",
  children,
}: {
  icon: React.ReactNode
  label: string
  iconClass?: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className={cn("flex h-4 w-4 items-center justify-center", iconClass)}>
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

/* ─── Toggle row ─── */
function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm text-card-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} className="shrink-0" />
    </div>
  )
}

/* ─── Info row (link) ─── */
function InfoRow({
  icon,
  label,
  value,
  href = "#",
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <span className="flex-1 text-sm text-card-foreground">{label}</span>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm text-muted-foreground">{value}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      </div>
    </Link>
  )
}

/* ─── Theme option ─── */
function ThemeOption({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

/* ─── Main ─── */
export default function PreferenciasPage() {
  const { theme, setTheme } = useTheme()

  const [pushNotif, setPushNotif] = useState(true)
  const [emailDiario, setEmailDiario] = useState(false)
  const [reducirAnim, setReducirAnim] = useState(false)
  const [textoMaior, setTextoMaior] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    toast.success("Preferências salvas com sucesso.")
    setSaving(false)
  }

  const currentTheme = theme ?? "system"

  return (
    <>
      <Header
        title="Preferências"
        description="Personalize sua experiência no sistema"
        actions={
          <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
            <Link href="/cockpit/perfil">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao perfil
            </Link>
          </Button>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        <div className="mx-auto max-w-2xl space-y-4">

          {/* Aparência */}
          <Section
            icon={<Sun className="h-4 w-4" />}
            label="Aparência"
            iconClass="text-primary"
          >
            <div className="p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Escolha o tema do sistema
              </p>
              <div className="flex gap-3">
                <ThemeOption
                  id="light"
                  label="Light"
                  icon={<Sun className="h-5 w-5" />}
                  active={currentTheme === "light"}
                  onClick={() => setTheme("light")}
                />
                <ThemeOption
                  id="dark"
                  label="Dark"
                  icon={<Moon className="h-5 w-5" />}
                  active={currentTheme === "dark"}
                  onClick={() => setTheme("dark")}
                />
                <ThemeOption
                  id="system"
                  label="Sistema"
                  icon={<Monitor className="h-5 w-5" />}
                  active={currentTheme === "system"}
                  onClick={() => setTheme("system")}
                />
              </div>
            </div>
          </Section>

          {/* Idioma & Região */}
          <Section
            icon={<Globe className="h-4 w-4" />}
            label="Idioma & Região"
          >
            <InfoRow
              icon={<Globe className="h-4 w-4" />}
              label="Idioma"
              value="Português (BR)"
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Fuso horário"
              value="GMT-3 · Brasília"
            />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Moeda padrão"
              value="BRL — R$"
            />
          </Section>

          {/* Notificações */}
          <Section
            icon={<Bell className="h-4 w-4" />}
            label="Notificações"
          >
            <ToggleRow
              label="Push notifications"
              desc="Receber alertas no dispositivo"
              value={pushNotif}
              onChange={setPushNotif}
            />
            <ToggleRow
              label="E-mail diário"
              desc="Resumo das atividades todo dia"
              value={emailDiario}
              onChange={setEmailDiario}
            />
            <Link
              href="/cockpit/notificacoes/configurar"
              className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm text-card-foreground">Configurações avançadas</p>
              <span className="text-sm font-semibold text-primary">Configurar →</span>
            </Link>
          </Section>

          {/* Acessibilidade */}
          <Section
            icon={<Eye className="h-4 w-4" />}
            label="Acessibilidade"
          >
            <ToggleRow
              label="Reduzir animações"
              desc="Para sensibilidade a movimento"
              value={reducirAnim}
              onChange={setReducirAnim}
            />
            <ToggleRow
              label="Texto maior"
              desc="Aumentar o tamanho da fonte"
              value={textoMaior}
              onChange={setTextoMaior}
            />
          </Section>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2 py-3">
            <Save className="h-4 w-4" />
            {saving ? "Salvando…" : "Salvar preferências"}
          </Button>
        </div>
      </main>
    </>
  )
}
