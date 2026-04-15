"use client"

import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { COCKPIT_MAIN_CLASS } from "@/lib/cockpit/cockpit-page-shell"
import {
  AlertTriangle,
  Filter,
  Plus,
  LayoutGrid,
  List,
  User,
  Clock,
  BarChart2,
  Pencil,
  MoreHorizontal,
  Trash2,
  Copy,
  X,
  Mic,
  MicOff,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Download,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import api from "@/utils/api"
import { toastApiError } from "@/lib/cockpit/api-error"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type AreaKey =
  | "COMERCIAL"
  | "MARKETING"
  | "FINANCEIRO"
  | "TECNOLOGIA"
  | "OPERACIONAL"
  | "ESTRATEGICO"

type FreqKey = "DAILY" | "SEMANAL" | "QUINZENAL" | "MENSAL" | "ESTRATEGICO"

type RecordState = "idle" | "recording" | "generating" | "done"

interface Participant {
  initials: string
  color: string
}

interface RitualCard {
  id: string
  name: string
  freq: FreqKey
  area: AreaKey
  owner: string
  schedule: string
  durationMin: number
  kpiCount: number
  tracked: number
  total: number
  trackingLabel: string
  participants: Participant[]
  extraParticipants: number
  nextLabel: string
  isToday: boolean
  todayTime?: string
  isNotTracked: boolean
  notTrackedDate?: string
  active: boolean
}

// ─── Ata types ────────────────────────────────────────────────────────────────

interface AtaKpi {
  id: number
  name: string
  metric: string
  goal: string
  unit: string
  selected: boolean
}

interface AtaAction {
  id: number
  title: string
  owner: string
  dueDate: string
  selected: boolean
}

interface AtaContent {
  ritualId: number | string
  ritualName: string
  date: string
  duration: string
  participants: string[]
  transcription: string
  topics: string[]
  decisions: string[]
  actions: AtaAction[]
  kpis: AtaKpi[]
}

// ─── Mock people palette ──────────────────────────────────────────────────────

const PEOPLE: Record<string, string> = {
  EV: "#16a34a", AL: "#7c3aed", MA: "#2563eb", PE: "#ea580c",
  CA: "#0d9488", JA: "#1e40af", LE: "#d97706", IN: "#374151",
  VI: "#db2777", FE: "#dc2626", AN: "#6d28d9", RI: "#0369a1", JO: "#15803d",
}
const p = (initials: string): Participant => ({ initials, color: PEOPLE[initials] ?? "#64748b" })

// ─── Area metadata ────────────────────────────────────────────────────────────

const AREA_META: Record<AreaKey, { label: string; dot: string }> = {
  COMERCIAL:   { label: "Comercial",   dot: "#16a34a" },
  MARKETING:   { label: "Marketing",   dot: "#db2777" },
  FINANCEIRO:  { label: "Financeiro",  dot: "#d97706" },
  TECNOLOGIA:  { label: "Tecnologia",  dot: "#7c3aed" },
  OPERACIONAL: { label: "Operacional", dot: "#2563eb" },
  ESTRATEGICO: { label: "Estratégico", dot: "#0d9488" },
}

const FREQ_LABEL: Record<FreqKey, string> = {
  DAILY: "Diário", SEMANAL: "Semanal", QUINZENAL: "Quinzenal", MENSAL: "Mensal",
  ESTRATEGICO: "Estratégico",
}

// ─── Mock ata generator ───────────────────────────────────────────────────────

function generateAta(ritual: RitualCard): AtaContent {
  const participantNames = ritual.participants.map((p) => {
    const names: Record<string, string> = {
      EV: "Evandro", AL: "Alexandre", MA: "Mateus", PE: "Pedro",
      CA: "Cairo", JA: "João Arantes", LE: "Leonardo", IN: "Ines",
      VI: "Vinícius", FE: "Felipe", AN: "André", RI: "Ricardo", JO: "José Pedro",
    }
    return names[p.initials] ?? p.initials
  })

  const atasByArea: Record<AreaKey, Partial<AtaContent>> = {
    COMERCIAL: {
      transcription: `[09:02] ${participantNames[0] ?? "Evandro"}: Bom dia a todos. Vamos iniciar a reunião de hoje revisando o pipeline e os principais indicadores da semana.\n\n[09:04] ${participantNames[1] ?? "Alexandre"}: Fechamos 3 contratos novos esta semana, totalizando R$ 87.000 em ARR. O ticket médio aumentou 12% em relação ao mês anterior.\n\n[09:07] ${participantNames[0] ?? "Evandro"}: Excelente. Qual é o status das negociações pendentes? Temos 8 oportunidades em estágio avançado.\n\n[09:10] ${participantNames[1] ?? "Alexandre"}: 4 delas têm proposta enviada e aguardam retorno. Prevejo fechar pelo menos 2 ainda esta semana. As outras 4 estão na fase de demonstração.\n\n[09:14] ${participantNames[0] ?? "Evandro"}: Precisamos acelerar o follow-up das oportunidades com mais de 15 dias sem contato. Vamos definir os responsáveis.\n\n[09:18] ${participantNames[2] ?? "Mateus"}: Estou vendo que a taxa de conversão caiu 2 pontos. Pode ser o reflexo do produto novo que ainda não tem materiais adequados.\n\n[09:22] ${participantNames[0] ?? "Evandro"}: Bom ponto. Vamos criar um plano de ação para os materiais de venda. Encerrando: próxima daily amanhã às 09:00.`,
      topics: [
        "Revisão do pipeline e oportunidades em andamento",
        "Análise de contratos fechados na semana (R$ 87.000 ARR)",
        "Taxa de conversão: queda de 2 pontos percentuais",
        "Follow-up de oportunidades com mais de 15 dias sem contato",
        "Materiais de venda para novo produto",
      ],
      decisions: [
        "Realizar follow-up com as 4 oportunidades pendentes até quinta-feira",
        "Alexandre assume responsabilidade de fechar pelo menos 2 contratos na semana",
        "Criar materiais de venda específicos para o novo produto até 03/04",
      ],
      actions: [
        { id: 1, title: "Criar materiais de venda para novo produto", owner: "Mateus", dueDate: "03/04/2026", selected: true },
        { id: 2, title: "Follow-up com as 4 oportunidades em proposta enviada", owner: "Alexandre", dueDate: "01/04/2026", selected: true },
        { id: 3, title: "Mapear oportunidades sem contato há 15+ dias e definir responsáveis", owner: "Evandro", dueDate: "28/03/2026", selected: true },
      ],
      kpis: [
        { id: 1, name: "ARR Semanal", metric: "Receita recorrente anual fechada na semana", goal: "100.000", unit: "R$", selected: true },
        { id: 2, name: "Taxa de Conversão", metric: "% de oportunidades convertidas em contrato", goal: "25", unit: "%", selected: true },
        { id: 3, name: "Ticket Médio", metric: "Valor médio por contrato fechado", goal: "30.000", unit: "R$", selected: false },
        { id: 4, name: "Pipeline em Estágio Avançado", metric: "Qtd. oportunidades em fase de proposta/negociação", goal: "10", unit: "un", selected: false },
      ],
    },
    FINANCEIRO: {
      transcription: `[14:02] ${participantNames[0] ?? "Cairo"}: Iniciando o review financeiro. Temos o fechamento parcial do mês de março.\n\n[14:05] ${participantNames[1] ?? "João Arantes"}: Receita bruta em março: R$ 1,28M — acima do projetado em 6,7%. EBITDA provisório de R$ 312K.\n\n[14:08] ${participantNames[0] ?? "Cairo"}: As despesas operacionais tiveram aumento de 3,2% devido ao contrato de TI renovado. Precisamos revisar o orçamento Q2.\n\n[14:11] ${participantNames[1] ?? "João Arantes"}: O fluxo de caixa está saudável. Temos R$ 870K em caixa disponível. Investimento previsto em marketing para abril: R$ 95K.\n\n[14:15] ${participantNames[0] ?? "Cairo"}: Importante: dois fornecedores com pagamentos em atraso. Total de R$ 43K. Precisamos regularizar até sexta.\n\n[14:20] ${participantNames[2] ?? "Leonardo"}: Proposta de alocação dos R$ 870K: 30% em reserva, 40% para expansão e 30% operacional.\n\n[14:25] ${participantNames[0] ?? "Cairo"}: Aprovado. Encerramos o review. Próxima reunião em 04/04.`,
      topics: [
        "Fechamento parcial de março: receita R$ 1,28M (+6,7% vs projetado)",
        "EBITDA provisório: R$ 312K",
        "Despesas operacionais: aumento de 3,2% (contrato TI)",
        "Fluxo de caixa: R$ 870K disponível",
        "Pagamentos em atraso com fornecedores: R$ 43K",
        "Proposta de alocação de capital",
      ],
      decisions: [
        "Regularizar pagamentos em atraso com fornecedores até sexta-feira (28/03)",
        "Aprovar alocação: 30% reserva / 40% expansão / 30% operacional",
        "Revisar orçamento Q2 considerando aumento de despesas operacionais",
      ],
      actions: [
        { id: 1, title: "Regularizar pagamentos em atraso com fornecedores (R$ 43K)", owner: "Cairo", dueDate: "28/03/2026", selected: true },
        { id: 2, title: "Revisar e ajustar orçamento Q2 com novo cenário de despesas", owner: "Cairo", dueDate: "03/04/2026", selected: true },
        { id: 3, title: "Elaborar relatório de EBITDA final de março", owner: "Leonardo", dueDate: "05/04/2026", selected: true },
      ],
      kpis: [
        { id: 1, name: "EBITDA Mensal", metric: "Resultado operacional antes de depreciação/amortização", goal: "350.000", unit: "R$", selected: true },
        { id: 2, name: "Receita Bruta Mensal", metric: "Total de receita bruta no mês", goal: "1.300.000", unit: "R$", selected: true },
        { id: 3, name: "Saldo de Caixa", metric: "Disponível em conta ao final do mês", goal: "800.000", unit: "R$", selected: true },
        { id: 4, name: "Despesas Operacionais", metric: "% das despesas sobre a receita bruta", goal: "72", unit: "%", selected: false },
      ],
    },
    MARKETING: {
      transcription: `[10:02] ${participantNames[0] ?? "Vinícius"}: Iniciando a reunião semanal de marketing. Vamos revisar as campanhas ativas e os resultados da semana.\n\n[10:05] ${participantNames[1] ?? "Felipe"}: Campanha de captação de produtores: 2.340 leads gerados, CPL de R$ 12,40. CTR das campanhas Google: 4,2%.\n\n[10:09] ${participantNames[0] ?? "Vinícius"}: A conversão de leads para cadastro no site caiu para 18%. Precisamos revisar a landing page de produtores.\n\n[10:13] ${participantNames[2] ?? "André"}: O conteúdo orgânico gerou 15K de alcance no Instagram essa semana. Posts sobre cases de sucesso têm engajamento 3x maior.\n\n[10:16] ${participantNames[0] ?? "Vinícius"}: Ótimo insight. Vamos dobrar a produção de cases. Qual é o status do e-mail marketing de reativação?\n\n[10:19] ${participantNames[1] ?? "Felipe"}: Taxa de abertura: 31%. Cliques: 8,4%. Reativamos 47 produtores inativos, gerando R$ 23K em novas transações.\n\n[10:23] ${participantNames[0] ?? "Vinícius"}: Excelente resultado. Vamos escalar essa campanha. Encerrando: próxima reunião terça às 10h.`,
      topics: [
        "Campanha de captação: 2.340 leads, CPL R$ 12,40",
        "CTR Google Ads: 4,2%",
        "Conversão landing page produtores: 18% (queda)",
        "Conteúdo orgânico Instagram: 15K alcance semanal",
        "E-mail marketing reativação: 31% abertura, 47 produtores reativados",
      ],
      decisions: [
        "Revisar landing page de produtores para melhorar conversão para 25%",
        "Dobrar produção de conteúdo de cases de sucesso",
        "Escalar campanha de e-mail reativação para base completa de inativos",
      ],
      actions: [
        { id: 1, title: "Redesenhar landing page de captação de produtores", owner: "Vinícius", dueDate: "03/04/2026", selected: true },
        { id: 2, title: "Produzir 4 novos cases de sucesso de produtores", owner: "André", dueDate: "07/04/2026", selected: true },
        { id: 3, title: "Escalar campanha de reativação para toda a base inativa", owner: "Felipe", dueDate: "01/04/2026", selected: true },
      ],
      kpis: [
        { id: 1, name: "Leads Semanais", metric: "Total de leads gerados por semana", goal: "3000", unit: "un", selected: true },
        { id: 2, name: "CPL (Custo por Lead)", metric: "Custo médio por lead gerado", goal: "10", unit: "R$", selected: true },
        { id: 3, name: "Conversão LP → Cadastro", metric: "% de visitantes que se cadastram", goal: "25", unit: "%", selected: true },
        { id: 4, name: "CTR Google Ads", metric: "Taxa de cliques nos anúncios", goal: "5", unit: "%", selected: false },
      ],
    },
    TECNOLOGIA: {
      transcription: `[11:02] ${participantNames[0] ?? "Ricardo"}: Iniciando o Sprint Review. Vamos passar pelos itens entregues no sprint 12.\n\n[11:05] ${participantNames[1] ?? "Felipe"}: Entregas do sprint: módulo de relatórios financeiros (concluído), refatoração do checkout mobile (concluído), correção de 8 bugs críticos.\n\n[11:09] ${participantNames[0] ?? "Ricardo"}: Velocidade do sprint: 42 story points. Meta era 40. Ótimo ritmo.\n\n[11:12] ${participantNames[2] ?? "André"}: A performance do checkout melhorou 34% após a refatoração. Tempo médio de carregamento: 1,2s (era 1,8s).\n\n[11:15] ${participantNames[0] ?? "Ricardo"}: Pendências: integração com novo gateway de pagamento bloqueada. API do parceiro voltará dia 22/03.\n\n[11:19] ${participantNames[1] ?? "Felipe"}: Próximo sprint: foco no módulo de notificações e CRM unificado. Estimativa: 38 story points.\n\n[11:23] ${participantNames[0] ?? "Ricardo"}: Aprovado. Próximo review em quinze dias.`,
      topics: [
        "Sprint 12: 42 story points entregues (meta: 40)",
        "Módulo de relatórios financeiros: concluído",
        "Checkout mobile: performance melhorou 34% (1,8s → 1,2s)",
        "8 bugs críticos corrigidos",
        "Bloqueio: integração gateway de pagamento (API em manutenção até 22/03)",
        "Sprint 13: módulo de notificações + CRM unificado",
      ],
      decisions: [
        "Sprint 13 aprovado com foco em notificações e CRM (38 story points)",
        "Aguardar retorno da API do gateway para retomar integração",
        "Monitorar performance do checkout em produção por 2 semanas",
      ],
      actions: [
        { id: 1, title: "Iniciar desenvolvimento do módulo de notificações", owner: "Ricardo", dueDate: "10/04/2026", selected: true },
        { id: 2, title: "Retomar integração com gateway após 22/03", owner: "Felipe", dueDate: "25/03/2026", selected: true },
        { id: 3, title: "Criar relatório de performance do checkout em produção", owner: "André", dueDate: "03/04/2026", selected: false },
      ],
      kpis: [
        { id: 1, name: "Velocidade do Sprint", metric: "Story points entregues por sprint", goal: "42", unit: "pts", selected: true },
        { id: 2, name: "Bugs Críticos Abertos", metric: "Qtd. de bugs críticos em aberto", goal: "0", unit: "un", selected: true },
        { id: 3, name: "Tempo de Carregamento Checkout", metric: "Tempo médio de carregamento do checkout", goal: "1.0", unit: "s", selected: true },
        { id: 4, name: "Cobertura de Testes", metric: "% do código coberto por testes automatizados", goal: "80", unit: "%", selected: false },
      ],
    },
    OPERACIONAL: {
      transcription: `[16:02] ${participantNames[0] ?? "José Pedro"}: Iniciando reunião operacional de março. Vamos revisar os principais indicadores e ocorrências.\n\n[16:05] ${participantNames[1] ?? "Cairo"}: SLA de atendimento ao produtor: 94% (meta: 95%). Tivemos 3 incidentes críticos na semana.\n\n[16:08] ${participantNames[0] ?? "José Pedro"}: Detalhe dos incidentes: 2 relacionados ao credenciamento de eventos de grande porte, 1 falha no sistema de emissão de ingressos.\n\n[16:12] ${participantNames[1] ?? "Cairo"}: Todos os incidentes foram resolvidos em até 4 horas. Precisamos criar um protocolo de escalação mais claro.\n\n[16:15] ${participantNames[0] ?? "José Pedro"}: Concordo. Vamos documentar o playbook de incidentes até semana que vem.\n\n[16:18] ${participantNames[1] ?? "Cairo"}: NPS de produtores do mês: 67 (meta: 70). Principais reclamações: demora no suporte e falta de documentação.\n\n[16:22] ${participantNames[0] ?? "José Pedro"}: Plano de ação para o NPS: criar base de conhecimento e revisar SLA. Encerrando. Próxima reunião em 06/04.`,
      topics: [
        "SLA de atendimento: 94% (1pp abaixo da meta)",
        "3 incidentes críticos na semana (2 credenciamento + 1 emissão ingressos)",
        "Resolução média de incidentes: 4 horas",
        "NPS de produtores: 67 (meta: 70)",
        "Principais reclamações: suporte lento e falta de documentação",
      ],
      decisions: [
        "Criar playbook de incidentes e protocolo de escalação até 03/04",
        "Revisar SLA de atendimento para atingir 96% em abril",
        "Criar base de conhecimento de suporte ao produtor como prioridade Q2",
      ],
      actions: [
        { id: 1, title: "Documentar playbook de incidentes críticos", owner: "José Pedro", dueDate: "03/04/2026", selected: true },
        { id: 2, title: "Criar base de conhecimento de suporte ao produtor", owner: "Cairo", dueDate: "15/04/2026", selected: true },
        { id: 3, title: "Revisar e atualizar SLA de atendimento", owner: "José Pedro", dueDate: "31/03/2026", selected: true },
      ],
      kpis: [
        { id: 1, name: "SLA de Atendimento", metric: "% de chamados resolvidos dentro do prazo", goal: "96", unit: "%", selected: true },
        { id: 2, name: "NPS Produtores", metric: "Net Promoter Score dos produtores", goal: "75", unit: "pts", selected: true },
        { id: 3, name: "Incidentes Críticos / Semana", metric: "Número de incidentes críticos por semana", goal: "0", unit: "un", selected: true },
        { id: 4, name: "Tempo Médio de Resolução", metric: "Tempo médio para resolver incidentes críticos", goal: "2", unit: "h", selected: false },
      ],
    },
    ESTRATEGICO: {
      transcription: `[14:02] ${participantNames[0] ?? "João Arantes"}: Reunião semanal de sócios. Vamos revisar os OKRs do trimestre e alinhar prioridades estratégicas.\n\n[14:06] ${participantNames[1] ?? "Leonardo"}: OKR de expansão: 7 novas cidades ativadas no trimestre (meta: 10). Precisamos acelerar parcerias locais.\n\n[14:10] ${participantNames[0] ?? "João Arantes"}: Receita total Q1: R$ 3,84M — 96% da meta. Temos um gap de R$ 160K para fechar até 31/03.\n\n[14:15] ${participantNames[2] ?? "Cairo"}: Possibilidades para fechar o gap: 2 contratos enterprise já em negociação avançada (R$ 200K combinados).\n\n[14:19] ${participantNames[0] ?? "João Arantes"}: Ótimo. Precisamos decidir sobre a rodada de investimento. Temos 3 propostas de fundos.\n\n[14:24] ${participantNames[1] ?? "Leonardo"}: Recomendo focar nos dois fundos que têm fit com nosso modelo. Due diligence iniciada na semana que vem.\n\n[14:28] ${participantNames[0] ?? "João Arantes"}: Aprovado. Próxima semana vamos alinhar com o jurídico. Encerrando.`,
      topics: [
        "OKR de expansão: 7/10 novas cidades ativadas",
        "Receita Q1: R$ 3,84M (96% da meta) — gap de R$ 160K",
        "2 contratos enterprise em negociação (R$ 200K)",
        "Decisão sobre rodada de investimento: 3 propostas em análise",
        "Due diligence com 2 fundos prioritários",
      ],
      decisions: [
        "Focar esforço de vendas para fechar os 2 contratos enterprise até 31/03",
        "Iniciar due diligence com os 2 fundos prioritários na próxima semana",
        "Acelerar parcerias locais para atingir meta de 10 cidades no Q1",
      ],
      actions: [
        { id: 1, title: "Fechar contratos enterprise em negociação (R$ 200K)", owner: "João Arantes", dueDate: "31/03/2026", selected: true },
        { id: 2, title: "Agendar kick-off de due diligence com os 2 fundos", owner: "Leonardo", dueDate: "01/04/2026", selected: true },
        { id: 3, title: "Mapear parceiros locais para as 3 cidades restantes", owner: "Cairo", dueDate: "07/04/2026", selected: true },
      ],
      kpis: [
        { id: 1, name: "Receita Trimestral (Q1)", metric: "Total de receita no trimestre", goal: "4.000.000", unit: "R$", selected: true },
        { id: 2, name: "Cidades Ativadas", metric: "Número de novas cidades com operação ativa", goal: "10", unit: "un", selected: true },
        { id: 3, name: "Contratos Enterprise", metric: "Número de contratos enterprise fechados", goal: "5", unit: "un", selected: false },
        { id: 4, name: "Runway (meses)", metric: "Meses de caixa disponível com a queima atual", goal: "18", unit: "meses", selected: false },
      ],
    },
  }

  const base = atasByArea[ritual.area] ?? atasByArea.COMERCIAL

  return {
    ritualId: ritual.id,
    ritualName: ritual.name,
    date: "27/03/2026",
    duration: `${ritual.durationMin} min`,
    participants: participantNames.slice(0, 4),
    transcription: base.transcription ?? "",
    topics: base.topics ?? [],
    decisions: base.decisions ?? [],
    actions: (base.actions ?? []).map((a) => ({ ...a, selected: true })),
    kpis: (base.kpis ?? []).map((k) => ({ ...k })),
  }
}

// ─── API normalizer ───────────────────────────────────────────────────────────

const FREQ_MAP: Record<string, FreqKey> = {
  daily: "DAILY",
  weekly: "SEMANAL",
  biweekly: "QUINZENAL",
  monthly: "MENSAL",
  estrategico: "ESTRATEGICO",
  strategic: "ESTRATEGICO",
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

/** Interpreta "Segunda-feira · 09:00" (e opcional horário vindo da API). */
function parseScheduleParts(
  schedule: string,
  fallbackTime?: string,
): { dow: number; hour: number; minute: number } | null {
  const sched = (schedule ?? "").trim()
  if (!sched) return null
  const parts = sched.split("·").map((s) => s.trim())
  const dayPart = stripAccents(parts[0] ?? "")
  const timePart = (parts[1] ?? fallbackTime ?? "09:00").trim()
  const dayPrefixes: [string, number][] = [
    ["domingo", 0],
    ["segunda", 1],
    ["terca", 2],
    ["quarta", 3],
    ["quinta", 4],
    ["sexta", 5],
    ["sabado", 6],
  ]
  let dow: number | undefined
  for (const [prefix, d] of dayPrefixes) {
    if (dayPart.startsWith(prefix)) {
      dow = d
      break
    }
  }
  if (dow === undefined) return null
  const tm = timePart.match(/^(\d{1,2}):(\d{2})/)
  const hour = tm ? parseInt(tm[1], 10) : 9
  const minute = tm ? parseInt(tm[2], 10) : 0
  return { dow, hour, minute }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Próxima ocorrência semanal no dia da semana e horário definidos. */
function nextWeeklyOccurrence(dow: number, hour: number, minute: number, now: Date): Date {
  const result = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  let delta = (dow - result.getDay() + 7) % 7
  if (delta === 0 && result.getTime() <= now.getTime()) delta = 7
  result.setDate(result.getDate() + delta)
  return result
}

/** Próximo dia útil (seg–sex) no horário — ritual diário em dias úteis. */
function nextBusinessMorning(hour: number, minute: number, now: Date): Date {
  for (let add = 0; add < 14; add++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add, hour, minute, 0, 0)
    const day = d.getDay()
    if (day >= 1 && day <= 5 && d.getTime() > now.getTime()) return d
  }
  return nextWeeklyOccurrence(1, hour, minute, now)
}

/** Primeira ocorrência de `dow` no mês corrente (se ainda futura) ou no próximo mês. */
function nextMonthlyOnWeekday(dow: number, hour: number, minute: number, now: Date): Date {
  const firstDowInMonth = (y: number, mo: number) => {
    const d = new Date(y, mo, 1, hour, minute, 0, 0)
    while (d.getMonth() === mo && d.getDay() !== dow) {
      d.setDate(d.getDate() + 1)
    }
    return d.getMonth() === mo ? d : null
  }
  let y = now.getFullYear()
  let mo = now.getMonth()
  let c = firstDowInMonth(y, mo)
  if (c && c.getTime() > now.getTime()) return c
  mo += 1
  if (mo > 11) {
    mo = 0
    y += 1
  }
  c = firstDowInMonth(y, mo)
  return c ?? nextWeeklyOccurrence(dow, hour, minute, now)
}

function computeNextOccurrenceDate(freq: FreqKey, parsed: { dow: number; hour: number; minute: number }, now: Date): Date | null {
  const { dow, hour, minute } = parsed
  switch (freq) {
    case "DAILY":
      return nextBusinessMorning(hour, minute, now)
    case "SEMANAL":
    case "QUINZENAL":
      return nextWeeklyOccurrence(dow, hour, minute, now)
    case "MENSAL":
      return nextMonthlyOnWeekday(dow, hour, minute, now)
    case "ESTRATEGICO":
      /** Avulso: ainda assim mostra a próxima data sugerida pelo dia/hora da agenda, se houver. */
      return nextWeeklyOccurrence(dow, hour, minute, now)
    default:
      return nextWeeklyOccurrence(dow, hour, minute, now)
  }
}

function timeDisplayString(parsed: { hour: number; minute: number } | null, startTime?: string): string {
  const t = (startTime ?? "").trim()
  if (/^\d{1,2}:\d{2}/.test(t)) return t.slice(0, 5)
  if (parsed) return `${pad2(parsed.hour)}:${pad2(parsed.minute)}`
  return "09:00"
}

function normalizeRitual(raw: Record<string, unknown>): RitualCard {
  const participants = (Array.isArray(raw.participants) ? raw.participants : []) as Participant[]
  const freq = FREQ_MAP[(raw.freq as string)?.toLowerCase()] ?? FREQ_MAP[(raw.frequency as string)?.toLowerCase()] ?? (raw.freq as FreqKey) ?? "SEMANAL"
  const nextDateRaw = raw.next_date as string | undefined
  const startTime = raw.start_time as string | undefined
  const scheduleStr = (raw.schedule as string) ?? ""

  const parsed = parseScheduleParts(scheduleStr, startTime)

  let effectiveNext: Date | null = null
  if (nextDateRaw) {
    const d = new Date(nextDateRaw)
    if (!Number.isNaN(d.getTime())) effectiveNext = d
  }
  if (!effectiveNext && parsed) {
    effectiveNext = computeNextOccurrenceDate(freq, parsed, new Date())
  }

  const timeDisp = timeDisplayString(parsed, startTime)

  let nextLabel = "—"
  let isTodayFlag = false

  if (effectiveNext) {
    isTodayFlag = sameCalendarDay(effectiveNext, new Date())
    if (isTodayFlag) {
      nextLabel = `Hoje ${timeDisp}`
    } else {
      nextLabel = `Próx: ${pad2(effectiveNext.getDate())}/${pad2(effectiveNext.getMonth() + 1)}`
      if (effectiveNext.getFullYear() !== new Date().getFullYear()) {
        nextLabel += `/${effectiveNext.getFullYear()}`
      }
    }
  } else if (!parsed) {
    nextLabel = freq === "ESTRATEGICO" ? "Sob demanda" : "—"
  }

  const tracked = (raw.tracked_sessions as number) ?? (raw.tracked_count as number) ?? 0
  const total = (raw.total_sessions as number) ?? (raw.total_count as number) ?? 0

  const refDate = effectiveNext ?? (nextDateRaw ? new Date(nextDateRaw) : undefined)

  return {
    id: String(raw.id ?? ""),
    name: (raw.name as string) ?? "",
    freq,
    area: (raw.area as AreaKey) ?? "COMERCIAL",
    owner: (raw.owner_name as string) ?? "",
    schedule: scheduleStr,
    durationMin: (raw.duration_min as number) ?? (raw.duration_minutes as number) ?? 60,
    kpiCount: (raw.kpi_count as number) ?? 0,
    tracked,
    total,
    trackingLabel: "rastreadas",
    participants,
    extraParticipants: Math.max(0, participants.length - 4),
    nextLabel,
    isToday: isTodayFlag,
    todayTime: isTodayFlag ? timeDisp : undefined,
    isNotTracked: tracked === 0 && total > 0,
    notTrackedDate:
      tracked === 0 && total > 0 && refDate && !Number.isNaN(refDate.getTime())
        ? `${pad2(refDate.getDate())}/${pad2(refDate.getMonth() + 1)}`
        : undefined,
    active: (raw.is_active as boolean) ?? true,
  }
}

// ─── Area tabs ────────────────────────────────────────────────────────────────

const AREA_TABS: { key: AreaKey | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todas as áreas" },
  { key: "COMERCIAL", label: "Comercial" },
  { key: "MARKETING", label: "Marketing" },
  { key: "FINANCEIRO", label: "Financeiro" },
  { key: "TECNOLOGIA", label: "Tecnologia" },
  { key: "OPERACIONAL", label: "Operacional" },
]

// ─── Ritual form ──────────────────────────────────────────────────────────────

interface RitualForm {
  name: string; freq: FreqKey; area: AreaKey; owner: string
  schedule: string; durationMin: string; kpiCount: string; nextLabel: string
}
const EMPTY_FORM: RitualForm = { name: "", freq: "SEMANAL", area: "COMERCIAL", owner: "", schedule: "", durationMin: "60", kpiCount: "0", nextLabel: "" }
function ritualToForm(r: RitualCard): RitualForm {
  let schedule = (r.schedule ?? "").trim()
  if (!schedule) {
    schedule = "Segunda-feira · 09:00"
  }
  return {
    name: r.name,
    freq: r.freq,
    area: r.area,
    owner: r.owner,
    schedule,
    durationMin: String(r.durationMin),
    kpiCount: String(r.kpiCount),
    nextLabel: r.nextLabel,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RituaisPage() {
  const [rituals, setRituals] = useState<RitualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [freq, setFreq] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "lista">("cards")
  const [activeArea, setActiveArea] = useState<AreaKey | "ALL">("ALL")

  const fetchRituals = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/cockpit/rituals", {
        params: { status: "all" },
      })
      const list = Array.isArray(data) ? data : data?.data ?? []
      setRituals(list.map(normalizeRitual))
    } catch (err) {
      console.error("Erro ao carregar rituais:", err)
      toastApiError(err, { fallback: "Erro ao carregar rituais." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRituals() }, [fetchRituals])

  // Record state: ritualId → state
  const [recordStates, setRecordStates] = useState<Record<string, RecordState>>({})
  // Generated atas
  const [atas, setAtas] = useState<Record<string, AtaContent>>({})
  // Open ata modal
  const [openAtaId, setOpenAtaId] = useState<string | number | null>(null)

  // Form modals
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState<RitualForm>(EMPTY_FORM)
  const [newSaving, setNewSaving] = useState(false)
  const [editTarget, setEditTarget] = useState<RitualCard | null>(null)
  const [editForm, setEditForm] = useState<RitualForm>(EMPTY_FORM)
  const [editSaving, setEditSaving] = useState(false)

  const notTrackedRituals = rituals.filter((r) => r.isNotTracked && r.active)

  const filtered = useMemo(() => {
    return rituals.filter((r) => {
      const bySearch = search.trim() === "" || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase())
      const byFreq = freq === "all" || r.freq === freq
      const byArea = activeArea === "ALL" || r.area === activeArea
      const byStatus = statusFilter === "all" || (statusFilter === "ativo" ? r.active : !r.active)
      return bySearch && byFreq && byArea && byStatus
    })
  }, [rituals, search, freq, activeArea, statusFilter])

  function areaCount(key: AreaKey | "ALL") {
    return key === "ALL" ? rituals.length : rituals.filter((r) => r.area === key).length
  }

  // Recording controls
  function startRecording(id: string | number) {
    setRecordStates((s) => ({ ...s, [String(id)]: "recording" }))
  }
  function stopRecording(id: string | number, ritual: RitualCard) {
    setRecordStates((s) => ({ ...s, [String(id)]: "generating" }))
    setTimeout(() => {
      const ata = generateAta(ritual)
      setAtas((a) => ({ ...a, [String(id)]: ata }))
      setRecordStates((s) => ({ ...s, [String(id)]: "done" }))
    }, 2200)
  }

  // Form handlers
  function openNew() { setNewForm(EMPTY_FORM); setShowNew(true) }
  async function saveNew(kpiIds: string[]) {
    if (!newForm.name.trim()) {
      toast.error("Informe o nome do ritual.")
      return
    }
    if (!newForm.owner.trim()) {
      toast.error("Selecione o responsável do ritual.")
      return
    }
    setNewSaving(true)
    try {
      const created = await api.post("/cockpit/rituals", {
        name: newForm.name.trim(),
        freq: newForm.freq,
        area: newForm.area,
        owner_name: newForm.owner.trim(),
        schedule: newForm.schedule.trim() || `${newForm.freq} · 09:00`,
        duration_min: Number(newForm.durationMin) || 60,
        kpi_count: Number(newForm.kpiCount) || 0,
        is_active: true,
        participants: [],
      })
      const ritualId = created?.data?.id
      if (ritualId && Array.isArray(kpiIds)) {
        await api.put(`/cockpit/rituals/${ritualId}/kpis`, { kpi_ids: kpiIds })
      }
      setShowNew(false)
      void fetchRituals()
    } catch (err: unknown) {
      console.error("Erro ao criar ritual:", err)
      toastApiError(err, { fallback: "Erro ao criar ritual." })
    } finally {
      setNewSaving(false)
    }
  }
  function openEdit(r: RitualCard) { setEditTarget(r); setEditForm(ritualToForm(r)) }
  async function saveEdit(kpiIds: string[]) {
    if (!editTarget) return
    if (!editForm.name.trim()) {
      toast.error("Informe o nome do ritual.")
      return
    }
    setEditSaving(true)
    const payload = {
      name: editForm.name.trim(),
      freq: editForm.freq,
      area: editForm.area,
      owner_name: editForm.owner.trim(),
      schedule: editForm.schedule.trim(),
      duration_min: Number(editForm.durationMin) || 60,
      kpi_count: Number(editForm.kpiCount) || 0,
    }
    console.log("PUT /cockpit/rituals/" + editTarget.id, payload)
    try {
      const res = await api.put(`/cockpit/rituals/${editTarget.id}`, payload)
      await api.put(`/cockpit/rituals/${editTarget.id}/kpis`, { kpi_ids: kpiIds ?? [] })
      console.log("PUT response:", res.data)
      setEditTarget(null)
      toast.success("Ritual atualizado!")
      void fetchRituals()
    } catch (err: unknown) {
      console.error("Erro ao editar ritual:", err)
      toastApiError(err, { fallback: "Erro ao editar ritual." })
    } finally {
      setEditSaving(false)
    }
  }
  async function toggleActive(r: RitualCard) {
    try {
      if (r.active) await api.patch(`/cockpit/rituals/${r.id}/archive`)
      else await api.patch(`/cockpit/rituals/${r.id}/reactivate`)
      toast.success(r.active ? "Ritual arquivado." : "Ritual reativado.")
      void fetchRituals()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao alterar status do ritual." })
    }
  }

  async function duplicate(ritual: RitualCard) {
    try {
      await api.post(`/cockpit/rituals/${ritual.id}/duplicate`)
      toast.success("Ritual duplicado.")
      void fetchRituals()
    } catch (e) {
      toastApiError(e, { fallback: "Erro ao duplicar ritual." })
    }
  }

  return (
    <>
      <Header
        title="Rituais"
        description={`${rituals.filter((r) => r.active).length} rituais ativos em 5 áreas — março 2026`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent"><Filter className="h-4 w-4" />Filtrar</Button>
            <Button variant="default" size="sm" className="gap-2" onClick={openNew}><Plus className="h-4 w-4" />Novo Ritual</Button>
          </div>
        }
      />

      <main className={COCKPIT_MAIN_CLASS}>
        {/* Alert banner */}
        {notTrackedRituals.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <strong>{notTrackedRituals.length} rituais não rastreados</strong> nas últimas ocorrências —{" "}
              {notTrackedRituals.map((r, i) => (<span key={r.id}>{i > 0 && " e "}<strong>{r.name}</strong> ({r.notTrackedDate})</span>))}. O responsável foi notificado.
            </span>
          </div>
        )}

        {/* Filter toolbar */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Buscar ritual..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 flex-1 text-sm" />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={freq} onValueChange={setFreq}>
              <SelectTrigger className="h-9 w-full min-w-0 text-sm sm:w-44"><SelectValue placeholder="Todas as frequências" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as frequências</SelectItem>
                {(Object.keys(FREQ_LABEL) as FreqKey[]).map((f) => (<SelectItem key={f} value={f}>{FREQ_LABEL[f]}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full min-w-0 text-sm sm:w-40"><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo / Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
              {(["cards", "lista"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setViewMode(m)} className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all", viewMode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {m === "cards" ? <><LayoutGrid className="h-3.5 w-3.5" />Cards</> : <><List className="h-3.5 w-3.5" />Lista</>}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Area tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {AREA_TABS.map((tab) => {
            const count = areaCount(tab.key); const isActive = activeArea === tab.key
            const dot = tab.key !== "ALL" ? AREA_META[tab.key as AreaKey].dot : undefined
            return (
              <button key={tab.key} type="button" onClick={() => setActiveArea(tab.key)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", isActive ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted/50")}>
                {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}
                {tab.label}
                <span className={cn("ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        {viewMode === "cards" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <RitualCardItem
                key={r.id}
                ritual={r}
                recordState={recordStates[r.id] ?? "idle"}
                onStartRecord={() => startRecording(r.id)}
                onStopRecord={() => stopRecording(r.id, r)}
                onOpenAta={() => setOpenAtaId(r.id)}
                onEdit={() => openEdit(r)}
                onDuplicate={() => void duplicate(r)}
                onToggleActive={() => void toggleActive(r)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
                <span className="text-2xl">🔍</span>
                <span>Nenhum ritual encontrado</span>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setFreq("all"); setStatusFilter("all"); setActiveArea("ALL") }}>Limpar filtros</Button>
              </div>
            )}
          </div>
        )}

        {/* Lista */}
        {viewMode === "lista" && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Ritual</th><th className="px-4 py-3">Área</th><th className="px-4 py-3">Frequência</th><th className="px-4 py-3">Responsável</th><th className="px-4 py-3">Agenda</th><th className="px-4 py-3">Próxima</th><th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const area = AREA_META[r.area]
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-semibold text-foreground"><div className="flex items-center gap-2">{r.isToday && <span className="h-2 w-2 rounded-full bg-primary" />}<span className={cn(!r.active && "line-through opacity-50")}>{r.name}</span>{!r.active && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Inativo</span>}</div></td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: area.dot }} />{area.label}</span></td>
                      <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground ring-1 ring-border">{r.freq}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.schedule} ~{r.durationMin}min</td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-semibold", r.isToday ? "text-primary" : "text-muted-foreground")}>{r.isToday ? `• ${r.nextLabel}` : r.nextLabel}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.isToday && (recordStates[r.id] ?? "idle") === "done" && atas[r.id] ? (
                            <Button variant="outline" size="sm" onClick={() => setOpenAtaId(r.id)} className="h-7 gap-1 text-xs"><FileText className="h-3 w-3" />Ver Ata</Button>
                          ) : !r.isToday && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openEdit(r)}><Pencil className="mr-2 h-3.5 w-3.5" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicate(r)}><Copy className="mr-2 h-3.5 w-3.5" />Duplicar</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => void toggleActive(r)} className="text-amber-600 focus:text-amber-600"><Trash2 className="mr-2 h-3.5 w-3.5" />{r.active ? "Arquivar" : "Reativar"}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <RitualFormModal
        key={showNew ? "novo-aberto" : "novo-fechado"}
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Novo Ritual"
        subtitle="Defina a frequência, área e responsável"
        form={newForm}
        onChange={setNewForm}
        onSave={saveNew}
        saving={newSaving}
        saveLabel="Criar Ritual"
        ritualId={null}
      />
      <RitualFormModal
        key={editTarget?.id ?? "edit-fechado"}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Editar Ritual"
        subtitle={editTarget?.name ?? ""}
        form={editForm}
        onChange={setEditForm}
        onSave={saveEdit}
        saving={editSaving}
        saveLabel="Salvar Alterações"
        ritualId={editTarget?.id ?? null}
      />

      {/* Ata Modal */}
      {openAtaId !== null && atas[openAtaId] && (
        <AtaModal
          ata={atas[openAtaId]}
          onClose={() => setOpenAtaId(null)}
          onUpdateAta={(updated) => setAtas((prev) => ({ ...prev, [openAtaId]: updated }))}
        />
      )}
    </>
  )
}

// ─── RitualCardItem ───────────────────────────────────────────────────────────

function RitualCardItem({
  ritual: r, recordState, onStartRecord, onStopRecord, onOpenAta, onEdit, onDuplicate, onToggleActive,
}: {
  ritual: RitualCard; recordState: RecordState
  onStartRecord: () => void; onStopRecord: () => void; onOpenAta: () => void
  onEdit: () => void; onDuplicate: () => void; onToggleActive: () => void
}) {
  const area = AREA_META[r.area]
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (recordState === "recording") {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [recordState])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // Ponto 2: <35% de sessões rastreadas → tudo vermelho
  const trackingPct = r.total > 0 ? (r.tracked / r.total) * 100 : 100
  const isLowTracking = trackingPct < 35

  // Cor da linha de KPIs
  const trackingColor = isLowTracking
    ? "text-red-600 dark:text-red-400"
    : r.tracked === 0
      ? "text-red-500"
      : r.tracked < r.total
        ? "text-amber-600"
        : "text-emerald-600"

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md", !r.active && "opacity-60")}>
      {/* Top banner */}
      {r.isToday && (
        <div className={cn("flex items-center gap-2 px-4 py-2 text-xs font-semibold", recordState === "recording" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400")}>
          {recordState === "recording" ? (
            <><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Gravando... {formatTime(elapsed)}</>
          ) : recordState === "generating" ? (
            <><Sparkles className="h-3.5 w-3.5 animate-pulse" />Gerando ata com IA...</>
          ) : recordState === "done" ? (
            <><CheckCircle2 className="h-3.5 w-3.5" />Ata pronta · {r.todayTime}</>
          ) : (
            <><span className="h-2 w-2 rounded-full bg-emerald-500" />Ritual de hoje — {r.todayTime}</>
          )}
        </div>
      )}
      {r.isNotTracked && recordState === "idle" && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />Última sessão não rastreada · {r.notTrackedDate}
        </div>
      )}

      <div className="p-4">
        {/* Ponto 4: Título ACIMA das badges */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug text-foreground">{r.name}</h3>

          {/* Ponto 7: botão Gravar / Ata ao lado dos 3 pontos */}
          <div className="flex shrink-0 items-center gap-0.5">
            {r.isToday && recordState === "idle" && (
              <button type="button" onClick={onStartRecord} title="Gravar reunião"
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                <Mic className="h-3 w-3" />Gravar
              </button>
            )}
            {r.isToday && recordState === "recording" && (
              <button type="button" onClick={onStopRecord}
                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive/20">
                <MicOff className="h-3 w-3" />{formatTime(elapsed)}
              </button>
            )}
            {r.isToday && recordState === "generating" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                <Sparkles className="h-3 w-3 animate-pulse" />IA…
              </span>
            )}
            {r.isToday && recordState === "done" && (
              <Button variant="default" size="sm" onClick={onOpenAta} className="h-7 gap-1 text-[11px]">
                <FileText className="h-3 w-3" />Ver Ata
              </Button>
            )}
            {!r.isToday && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit} title="Editar ritual">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Mais opções">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-3.5 w-3.5" />Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-3.5 w-3.5" />Duplicar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleActive} className="text-amber-600 focus:text-amber-600"><Trash2 className="mr-2 h-3.5 w-3.5" />{r.active ? "Arquivar ritual" : "Reativar ritual"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Ponto 4: badges abaixo do título */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground ring-1 ring-border">{r.freq}</span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: area.dot + "18", color: area.dot }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: area.dot }} />{area.label}
          </span>
          {/* Ponto 5: bolinha verde + texto verde, sem fundo */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />{r.active ? "Ativo" : "Inativo"}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>Responsável: <span className="font-semibold text-foreground">{r.owner}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{r.schedule} ~{r.durationMin}min</span>
          </div>
          {/* Ponto 6: sem negrito no "N KPIs vinculados"; baixo rastreamento → linha inteira vermelha */}
          <div className={cn("flex items-center gap-2", isLowTracking && "text-red-600 dark:text-red-400")}>
            <BarChart2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              {r.kpiCount} KPIs vinculados · <span className={cn("font-semibold", trackingColor)}>{r.tracked}/{r.total}</span> {r.trackingLabel}
            </span>
          </div>
        </div>

        {/* Ponto 3: footer com avatars + data na mesma linha */}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2">
            {/* Avatares inline */}
            <div className="flex -space-x-1.5">
              {r.participants.map((pt, i) => (
                <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white dark:border-card" style={{ backgroundColor: pt.color }}>{pt.initials}</div>
              ))}
              {r.extraParticipants > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">+{r.extraParticipants}</div>
              )}
            </div>

            {/* Data / status */}
            {r.isToday ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {r.nextLabel}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{r.nextLabel}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── AtaModal ─────────────────────────────────────────────────────────────────

function AtaModal({ ata, onClose, onUpdateAta }: { ata: AtaContent; onClose: () => void; onUpdateAta: (a: AtaContent) => void }) {
  const [openSection, setOpenSection] = useState<string | null>("transcricao")
  const [kpisSaved, setKpisSaved] = useState(false)
  const [actionsSaved, setActionsSaved] = useState(false)

  function toggleSection(s: string) { setOpenSection((o) => (o === s ? null : s)) }

  function toggleKpi(id: number) {
    onUpdateAta({ ...ata, kpis: ata.kpis.map((k) => k.id === id ? { ...k, selected: !k.selected } : k) })
  }
  function toggleAction(id: number) {
    onUpdateAta({ ...ata, actions: ata.actions.map((a) => a.id === id ? { ...a, selected: !a.selected } : a) })
  }

  const selectedKpis = ata.kpis.filter((k) => k.selected)
  const selectedActions = ata.actions.filter((a) => a.selected)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <div className="shrink-0 bg-primary px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-primary-foreground">Ata da Reunião</DialogTitle>
              </DialogHeader>
              <p className="mt-1 text-xs text-primary-foreground/70">{ata.ritualName} · {ata.date} · {ata.duration}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ata.participants.map((pt) => (
                  <span key={pt} className="rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-medium text-primary-foreground/80">{pt}</span>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-0.5 h-7 w-7 p-0 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Transcrição */}
          <AtaSection icon={<Mic className="h-4 w-4" />} title="Transcrição" open={openSection === "transcricao"} onToggle={() => toggleSection("transcricao")} badge={null}>
            <div className="rounded-xl bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-line">{ata.transcription}</div>
          </AtaSection>

          {/* Tópicos */}
          <AtaSection icon={<ClipboardList className="h-4 w-4" />} title="Tópicos Discutidos" open={openSection === "topicos"} onToggle={() => toggleSection("topicos")} badge={`${ata.topics.length}`}>
            <ul className="space-y-2">
              {ata.topics.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{t}
                </li>
              ))}
            </ul>
          </AtaSection>

          {/* Decisões */}
          <AtaSection icon={<CheckCircle2 className="h-4 w-4" />} title="Decisões Tomadas" open={openSection === "decisoes"} onToggle={() => toggleSection("decisoes")} badge={`${ata.decisions.length}`}>
            <ul className="space-y-2">
              {ata.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{d}
                </li>
              ))}
            </ul>
          </AtaSection>

          {/* Planos de Ação */}
          <AtaSection icon={<ClipboardList className="h-4 w-4 text-sky-600" />} title="Planos de Ação" open={openSection === "acoes"} onToggle={() => toggleSection("acoes")} badge={`${selectedActions.length}/${ata.actions.length}`} badgeColor="sky">
            <div className="space-y-2">
              {ata.actions.map((action) => (
                <label key={action.id} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors", action.selected ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/50")}>
                  <input type="checkbox" checked={action.selected} onChange={() => toggleAction(action.id)} className="mt-0.5 h-4 w-4 rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{action.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{action.owner}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{action.dueDate}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {!actionsSaved ? (
              <Button variant="default" className="mt-3 w-full" onClick={() => setActionsSaved(true)}>
                Criar {selectedActions.length} Plano{selectedActions.length !== 1 ? "s" : ""} de Ação
              </Button>
            ) : (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />{selectedActions.length} plano{selectedActions.length !== 1 ? "s" : ""} criado{selectedActions.length !== 1 ? "s" : ""} com sucesso!
              </div>
            )}
          </AtaSection>

          {/* KPIs Sugeridos */}
          <AtaSection icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} title="KPIs Sugeridos pela IA" open={openSection === "kpis"} onToggle={() => toggleSection("kpis")} badge={`${selectedKpis.length}/${ata.kpis.length}`} badgeColor="emerald">
            <div className="space-y-2">
              {ata.kpis.map((kpi) => (
                <label key={kpi.id} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors", kpi.selected ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/50")}>
                  <input type="checkbox" checked={kpi.selected} onChange={() => toggleKpi(kpi.id)} className="mt-0.5 h-4 w-4 rounded" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{kpi.name}</span>
                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Meta: {kpi.goal} {kpi.unit}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{kpi.metric}</div>
                  </div>
                </label>
              ))}
            </div>
            {!kpisSaved ? (
              <Button variant="default" className="mt-3 w-full gap-2" onClick={() => setKpisSaved(true)}>
                <Sparkles className="h-4 w-4" />Criar {selectedKpis.length} KPI{selectedKpis.length !== 1 ? "s" : ""} selecionado{selectedKpis.length !== 1 ? "s" : ""}
              </Button>
            ) : (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />{selectedKpis.length} KPI{selectedKpis.length !== 1 ? "s" : ""} criado{selectedKpis.length !== 1 ? "s" : ""} com sucesso!
              </div>
            )}
          </AtaSection>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AtaSection({ icon, title, open, onToggle, badge, children }: {
  icon: React.ReactNode; title: string; open: boolean; onToggle: () => void
  badge: string | null; badgeColor?: string; children: React.ReactNode
}) {
  return (
    <div className="border-b border-border">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-muted-foreground">{icon}</span>{title}
          {badge && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{badge}</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}

// ─── RitualFormModal ──────────────────────────────────────────────────────────

const RITUAL_FREQ = [
  { value: "DAILY",       label: "Daily — diário (dias úteis)" },
  { value: "SEMANAL",     label: "Semanal" },
  { value: "QUINZENAL",   label: "Quinzenal" },
  { value: "MENSAL",      label: "Mensal" },
  { value: "ESTRATEGICO", label: "Estratégico (avulso)" },
]
const RITUAL_AREAS = [
  { value: "COMERCIAL",   label: "Comercial" },
  { value: "MARKETING",   label: "Marketing" },
  { value: "FINANCEIRO",  label: "Financeiro" },
  { value: "TECNOLOGIA",  label: "Tecnologia" },
  { value: "OPERACIONAL", label: "Operacional" },
  { value: "ESTRATEGICO", label: "Estratégico" },
]
const RITUAL_OWNERS    = ["Evandro","Vinicius","Cairo","Ricardo","José Pedro","João Arantes"]
const RITUAL_WEEKDAYS  = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira"]
const RITUAL_DURATIONS = ["15 min","30 min","45 min","60 min","90 min","120 min"]
const RITUAL_COLORS    = ["#0ea5e9","#8b5cf6","#f59e0b","#16a34a","#e8325f","#1a4a35","#64748b","#0d9488"]

type KpiOption = { id: string; label: string }

/* Shared field classes — solid border on every control */
const FIELD  = "space-y-1.5"
const LABEL  = "block text-[13px] font-medium text-foreground"
const REQ    = <span className="text-destructive"> *</span>
const HINT   = "text-[11px] text-muted-foreground"
const SEC    = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
/* Native input — always shows solid border */
const INPUT  = [
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
  "placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400",
  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500",
].join(" ")
/* SelectTrigger — force same solid border as native input */
const STRIG  = [
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
  "focus:border-gray-500 focus:ring-1 focus:ring-gray-400",
  "dark:border-zinc-600 dark:bg-zinc-900 dark:text-white",
  "[&>span]:text-sm",
].join(" ")

function RitualFormModal({ open, onClose, title, form, onChange, onSave, saving, saveLabel, ritualId }: {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  form: RitualForm
  onChange: (f: RitualForm) => void
  onSave: (kpiIds: string[]) => void
  saving: boolean
  saveLabel: string
  /** Se definido, carrega KPIs já vinculados ao ritual (edição). */
  ritualId: string | null
}) {
  const set = (key: keyof RitualForm) => (val: string) => onChange({ ...form, [key]: val })
  const canSave = form.name.trim() !== "" && form.owner.trim() !== ""

  const [color,     setColor]     = useState(RITUAL_COLORS[0])
  const [kpiOptions, setKpiOptions] = useState<KpiOption[]>([])
  const [kpiToAdd,   setKpiToAdd]   = useState<string>("")
  const [selectedKpiIds, setSelectedKpiIds] = useState<string[]>([])
  const [agenda,    setAgenda]    = useState("")
  const [startDate, setStartDate] = useState("")

  useEffect(() => {
    // Mantém kpiCount do form coerente com seleção (para persistir no backend)
    const next = String(selectedKpiIds.length)
    if (form.kpiCount !== next) onChange({ ...form, kpiCount: next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKpiIds.length])

  /** Lista todos os KPIs cadastrados (filtro por área do ritual batia com slugs diferentes e esvaziava o select). */
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get("/cockpit/kpis")
        const list = Array.isArray(data) ? data : data?.data ?? []
        const mapped: KpiOption[] = list
          .map((k: unknown) => {
            if (!k || typeof k !== "object") return null
            const obj = k as Record<string, unknown>
            const id = String(obj.id ?? "")
            const code = String(obj.code_ref ?? obj.code ?? "").trim()
            const name = String(obj.name ?? "").trim()
            const area = String(obj.area ?? "").trim()
            if (!id || !name) return null
            const base = code ? `${code} — ${name}` : name
            const label = area ? `${base} · ${area}` : base
            return { id, label }
          })
          .filter((k: KpiOption | null): k is KpiOption => !!k)
        if (!cancelled) setKpiOptions(mapped)
      } catch {
        if (!cancelled) setKpiOptions([])
      }
    })()
    return () => { cancelled = true }
  }, [open])

  /** Novo ritual: limpa chips; Editar: busca vínculos salvos no backend. */
  useEffect(() => {
    if (!open) return
    if (!ritualId) {
      setSelectedKpiIds([])
      setKpiToAdd("")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/cockpit/rituals/${ritualId}/kpis`)
        const ids = Array.isArray(data?.kpi_ids) ? data.kpi_ids.map((x: unknown) => String(x)) : []
        if (!cancelled) setSelectedKpiIds(ids)
      } catch {
        if (!cancelled) setSelectedKpiIds([])
      }
    })()
    return () => { cancelled = true }
  }, [open, ritualId])

  function addKpi(id: string) {
    if (!id) return
    setSelectedKpiIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setKpiToAdd("")
  }

  function removeKpi(id: string) {
    setSelectedKpiIds((prev) => prev.filter((x) => x !== id))
  }

  // Parse schedule to extract weekday and time
  const schedParts = form.schedule.split("·").map((s) => s.trim())
  const weekday = schedParts[0] || "Segunda-feira"
  const time = schedParts[1] || "09:00"
  const duration = `${form.durationMin} min`

  function setWeekday(w: string) { onChange({ ...form, schedule: `${w} · ${time}` }) }
  function setTime(t: string) { onChange({ ...form, schedule: `${weekday} · ${t}` }) }
  function setDuration(d: string) { onChange({ ...form, durationMin: String(parseInt(d) || 60) }) }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">Formulário de ritual</SheetDescription>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <span className="text-[15px] font-semibold text-foreground">{title}</span>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">

            {/* ── INFORMAÇÕES BÁSICAS ── */}
            <p className={SEC}>Informações Básicas</p>

            <div className={FIELD}>
              <label className={LABEL}>Nome{REQ}</label>
              <input
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Ex: Daily Comercial, Semanal Marketing…"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Frequência{REQ}</label>
                <Select value={form.freq} onValueChange={set("freq")}>
                  <SelectTrigger className={STRIG}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RITUAL_FREQ.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Área{REQ}</label>
                <Select value={form.area} onValueChange={set("area")}>
                  <SelectTrigger className={STRIG}><SelectValue placeholder="Selecionar…" /></SelectTrigger>
                  <SelectContent>
                    {RITUAL_AREAS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={FIELD}>
              <label className={LABEL}>Responsável{REQ}</label>
              <Select value={form.owner || ""} onValueChange={set("owner")}>
                <SelectTrigger className={STRIG}><SelectValue placeholder="Selecionar responsável…" /></SelectTrigger>
                <SelectContent>
                  {RITUAL_OWNERS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className={HINT}>O responsável conduz a sessão e é notificado caso o ritual não seja iniciado</p>
            </div>

            {/* ── AGENDA ── */}
            <p className={SEC}>Agenda</p>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Dia da semana{REQ}</label>
                <Select value={weekday} onValueChange={setWeekday}>
                  <SelectTrigger className={STRIG}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RITUAL_WEEKDAYS.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Horário{REQ}</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={cn(INPUT, "font-mono")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={FIELD}>
                <label className={LABEL}>Duração estimada</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className={STRIG}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RITUAL_DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={FIELD}>
                <label className={LABEL}>Data de início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            {/* ── CONTEÚDO E IDENTIDADE ── */}
            <p className={SEC}>Conteúdo e Identidade</p>

            <div className={FIELD}>
              <label className={LABEL}>
                Pauta padrão{" "}
                <span className="font-normal text-muted-foreground">(perguntas norteadoras)</span>
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                rows={4}
                placeholder={"Quais são os números de hoje?\nQuais bloqueios existem?\nQuais foram as entregas desde a última reunião?"}
                className={cn(INPUT, "h-auto resize-y py-2.5")}
              />
              <p className={HINT}>Exibida como guia no início de cada sessão</p>
            </div>

            <div className={FIELD}>
              <label className={LABEL}>Cor de identificação</label>
              <div className="flex flex-wrap gap-2">
                {RITUAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ background: c }}
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-full transition-all",
                      color === c
                        ? "ring-[3px] ring-foreground ring-offset-2"
                        : "hover:scale-110"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className={FIELD}>
              <label className={LABEL}>KPIs vinculados</label>
              <div className="space-y-2">
                <Select value={kpiToAdd} onValueChange={(v) => { setKpiToAdd(v); addKpi(v) }}>
                  <SelectTrigger className={STRIG}><SelectValue placeholder="Adicionar KPI…" /></SelectTrigger>
                  <SelectContent>
                    {kpiOptions.length === 0 ? (
                      <SelectItem value="__empty" disabled>Nenhum KPI encontrado</SelectItem>
                    ) : (
                      kpiOptions.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedKpiIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedKpiIds.map((id) => {
                      const label = kpiOptions.find((k) => k.id === id)?.label ?? id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => removeKpi(id)}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground hover:bg-muted/70"
                          title="Remover KPI"
                        >
                          <span className="max-w-[260px] truncate">{label}</span>
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              <p className={HINT}>KPIs vinculados são exibidos e podem ser atualizados durante a sessão</p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-background px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={() => onSave(selectedKpiIds)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {saving ? "Salvando…" : saveLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
