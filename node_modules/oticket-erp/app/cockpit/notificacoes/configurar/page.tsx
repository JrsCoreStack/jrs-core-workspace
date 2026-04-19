"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  Users,
  Activity,
  ClipboardList,
  MessageSquare,
  Monitor,
  ArrowLeft,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

/* ─── Types ─── */
type ToggleKey =
  | "ritual_lembrete"
  | "ritual_nao_realizada"
  | "ritual_novo_participante"
  | "kpi_meta_critica"
  | "kpi_atualizado_membro"
  | "kpi_meta_atingida"
  | "plano_prazo_vencido"
  | "plano_atribuido"
  | "plano_movido"
  | "mencao_citado"
  | "mencao_resposta"
  | "sistema_relatorio"
  | "sistema_atualizacoes"

type Prefs = Record<ToggleKey, boolean>

const DEFAULT_PREFS: Prefs = {
  ritual_lembrete: true,
  ritual_nao_realizada: true,
  ritual_novo_participante: false,
  kpi_meta_critica: true,
  kpi_atualizado_membro: true,
  kpi_meta_atingida: true,
  plano_prazo_vencido: true,
  plano_atribuido: true,
  plano_movido: false,
  mencao_citado: true,
  mencao_resposta: true,
  sistema_relatorio: true,
  sistema_atualizacoes: false,
}

/* ─── Section card ─── */
function SectionCard({
  icon,
  label,
  iconClass,
  children,
}: {
  icon: React.ReactNode
  label: string
  iconClass: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className={cn("flex h-5 w-5 items-center justify-center", iconClass)}>
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
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="shrink-0"
      />
    </div>
  )
}

/* ─── Main ─── */
export default function ConfigurarNotificacoesPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)

  function set(key: ToggleKey, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Configurações de alertas salvas.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header
        title="Configurar Alertas"
        description="Personalize quais notificações você quer receber"
        actions={
          <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
            <Link href="/cockpit/notificacoes">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        <div className="mx-auto max-w-2xl space-y-4">

          <SectionCard
            icon={<Users className="h-4 w-4" />}
            label="Rituais"
            iconClass="text-primary"
          >
            <ToggleRow
              label="Lembrete antes do ritual"
              desc="Receber aviso 30 min antes da sessão"
              value={prefs.ritual_lembrete}
              onChange={(v) => set("ritual_lembrete", v)}
            />
            <ToggleRow
              label="Reunião não realizada"
              desc="Alertar quando um ritual não for registrado"
              value={prefs.ritual_nao_realizada}
              onChange={(v) => set("ritual_nao_realizada", v)}
            />
            <ToggleRow
              label="Novo participante adicionado"
              desc="Quando alguém for incluído no ritual"
              value={prefs.ritual_novo_participante}
              onChange={(v) => set("ritual_novo_participante", v)}
            />
          </SectionCard>

          <SectionCard
            icon={<Activity className="h-4 w-4" />}
            label="KPIs"
            iconClass="text-chart-2"
          >
            <ToggleRow
              label="Meta crítica ultrapassada"
              desc="Alertar quando um KPI sair da zona segura"
              value={prefs.kpi_meta_critica}
              onChange={(v) => set("kpi_meta_critica", v)}
            />
            <ToggleRow
              label="KPI atualizado por outro membro"
              desc="Notificar quando um KPI vinculado for registrado"
              value={prefs.kpi_atualizado_membro}
              onChange={(v) => set("kpi_atualizado_membro", v)}
            />
            <ToggleRow
              label="Meta mensal atingida"
              desc="Celebrar quando 100% for alcançado"
              value={prefs.kpi_meta_atingida}
              onChange={(v) => set("kpi_meta_atingida", v)}
            />
          </SectionCard>

          <SectionCard
            icon={<ClipboardList className="h-4 w-4" />}
            label="Planos de Ação"
            iconClass="text-amber-500"
          >
            <ToggleRow
              label="Prazo vencido"
              desc="Alertar no dia do vencimento"
              value={prefs.plano_prazo_vencido}
              onChange={(v) => set("plano_prazo_vencido", v)}
            />
            <ToggleRow
              label="Plano atribuído a mim"
              desc="Quando um plano for atribuído ao seu usuário"
              value={prefs.plano_atribuido}
              onChange={(v) => set("plano_atribuido", v)}
            />
            <ToggleRow
              label="Plano movido de coluna"
              desc="Quando um plano que você participa for movido"
              value={prefs.plano_movido}
              onChange={(v) => set("plano_movido", v)}
            />
          </SectionCard>

          <SectionCard
            icon={<MessageSquare className="h-4 w-4" />}
            label="Menções & Comentários"
            iconClass="text-pink-500"
          >
            <ToggleRow
              label="Me mencionaram"
              desc="Alertar quando usarem @seu-nome"
              value={prefs.mencao_citado}
              onChange={(v) => set("mencao_citado", v)}
            />
            <ToggleRow
              label="Resposta ao meu comentário"
              desc="Quando alguém responder algo que você escreveu"
              value={prefs.mencao_resposta}
              onChange={(v) => set("mencao_resposta", v)}
            />
          </SectionCard>

          <SectionCard
            icon={<Monitor className="h-4 w-4" />}
            label="Sistema"
            iconClass="text-muted-foreground"
          >
            <ToggleRow
              label="Relatório semanal automático"
              desc="Receber toda sexta-feira às 18h"
              value={prefs.sistema_relatorio}
              onChange={(v) => set("sistema_relatorio", v)}
            />
            <ToggleRow
              label="Atualizações do sistema"
              desc="Novas versões e manutenções programadas"
              value={prefs.sistema_atualizacoes}
              onChange={(v) => set("sistema_atualizacoes", v)}
            />
          </SectionCard>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 py-3"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando…" : "Salvar configurações"}
          </Button>
        </div>
      </main>
    </>
  )
}
