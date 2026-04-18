/** Dados mock para telas RitualFlow/Cockpit até integração com oticket-api-erp */

export type AreaSlug =
  | "MARKETING"
  | "COMMERCIAL"
  | "FINANCIAL"
  | "TECHNOLOGY"
  | "OPERATIONAL"
  | "PLAY"

export type RitualType = "daily" | "weekly" | "biweekly" | "monthly" | "strategic"

export interface MockArea {
  id: number
  name: string
  slug: AreaSlug
  color: string
}

export interface MockRitual {
  id: number
  name: string
  area: MockArea
  type: RitualType
  ownerName: string
  dayLabel: string
  startTime: string
  nextDate: string
  active: boolean
  description?: string
}

export interface MockMeeting {
  id: number
  ritualId: number
  date: string
  status: "scheduled" | "in_progress" | "done" | "cancelled" | "not_tracked"
  minutes: string
  topics: string[]
}

export interface MockKpi {
  id: number
  code: string
  name: string
  area: AreaSlug
  unit: string
  goal: number
  current: number
  trend: "up" | "down" | "flat"
  status: "above" | "attention" | "critical" | "empty"
}

export interface MockActionPlan {
  id: number
  title: string
  area: AreaSlug
  ritualId: number | null
  meetingId: number | null
  ownerName: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "planned" | "in_progress" | "blocked" | "delivered" | "archived"
  /** Texto curto exibido em cards bloqueados (mock) */
  blockedNote?: string
}

export const mockAreas: MockArea[] = [
  { id: 1, name: "Comercial", slug: "COMMERCIAL", color: "#2563eb" },
  { id: 2, name: "Marketing", slug: "MARKETING", color: "#db2777" },
  { id: 3, name: "Financeiro", slug: "FINANCIAL", color: "#16a34a" },
  { id: 4, name: "Tecnologia", slug: "TECHNOLOGY", color: "#7c3aed" },
  { id: 5, name: "Operações", slug: "OPERATIONAL", color: "#ca8a04" },
  { id: 6, name: "Play", slug: "PLAY", color: "#0d9488" },
]

export const mockRituals: MockRitual[] = [
  {
    id: 1,
    name: "Daily Comercial",
    area: mockAreas[0],
    type: "daily",
    ownerName: "Equipe Comercial",
    dayLabel: "Seg–Sex",
    startTime: "09:00",
    nextDate: "2026-03-28",
    active: true,
    description: "Alinhamento diário de pipeline e metas.",
  },
  {
    id: 2,
    name: "Ritual Mensal Financeiro",
    area: mockAreas[2],
    type: "monthly",
    ownerName: "CFO",
    dayLabel: "1ª segunda",
    startTime: "14:00",
    nextDate: "2026-04-07",
    active: true,
  },
]

export const mockMeetings: MockMeeting[] = [
  {
    id: 101,
    ritualId: 1,
    date: "2026-03-27",
    status: "done",
    minutes: "Revisamos forecast e bloqueios de contratos. Próximos passos: follow-up com 3 contas.",
    topics: ["Forecast", "Pipeline", "Bloqueios"],
  },
  {
    id: 102,
    ritualId: 1,
    date: "2026-03-26",
    status: "done",
    minutes: "Ata resumida da sessão anterior.",
    topics: ["Metas", "KPIs"],
  },
]

export const mockKpis: MockKpi[] = [
  {
    id: 1,
    code: "K-201",
    name: "Receita líquida",
    area: "COMMERCIAL",
    unit: "R$",
    goal: 1_200_000,
    current: 1_150_000,
    trend: "up",
    status: "attention",
  },
  {
    id: 2,
    code: "K-337",
    name: "Taxa de conversão",
    area: "MARKETING",
    unit: "%",
    goal: 4.5,
    current: 4.2,
    trend: "flat",
    status: "attention",
  },
  {
    id: 3,
    code: "K-102",
    name: "EBITDA",
    area: "FINANCIAL",
    unit: "R$",
    goal: 400_000,
    current: 420_000,
    trend: "up",
    status: "above",
  },
]

export const mockActionPlans: MockActionPlan[] = [
  // ── PLANEJADO (12) ───────────────────────────────────────────────────────
  {
    id: 1,
    title: "Atualizar base de leads com segmentação por ticket médio",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: 101,
    ownerName: "Evandro",
    dueDate: "2026-03-15",
    priority: "high",
    status: "planned",
  },
  {
    id: 2,
    title: "Revisar SLA de atendimento ao produtor parceiro",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-04-02",
    priority: "medium",
    status: "planned",
  },
  {
    id: 3,
    title: "Mapear fluxo de onboarding de novos produtores",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-04-10",
    priority: "low",
    status: "planned",
  },
  {
    id: 4,
    title: "Definir meta de aquisição de produtores Q2",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: null,
    ownerName: "Evandro",
    dueDate: "2026-03-20",
    priority: "high",
    status: "planned",
  },
  {
    id: 5,
    title: "Criar protocolo de gestão de crises operacionais",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-04-15",
    priority: "high",
    status: "planned",
  },
  {
    id: 6,
    title: "Estruturar processo de feedback pós-evento",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-04-05",
    priority: "medium",
    status: "planned",
  },
  {
    id: 7,
    title: "Implementar automação de relatórios financeiros mensais",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2026-04-12",
    priority: "medium",
    status: "planned",
  },
  {
    id: 8,
    title: "Revisar política de preços para produtores pequenos",
    area: "COMMERCIAL",
    ritualId: null,
    meetingId: null,
    ownerName: "Evandro",
    dueDate: "2026-04-25",
    priority: "high",
    status: "planned",
  },
  {
    id: 9,
    title: "Criar base de conhecimento para suporte ao produtor",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-05-01",
    priority: "low",
    status: "planned",
  },
  {
    id: 10,
    title: "Mapear indicadores de satisfação do produtor",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-04-18",
    priority: "medium",
    status: "planned",
  },
  {
    id: 11,
    title: "Revisar fluxo de homologação de novos fornecedores",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-05-10",
    priority: "low",
    status: "planned",
  },
  {
    id: 12,
    title: "Desenvolver dashboard de performance por evento",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-04-30",
    priority: "medium",
    status: "planned",
  },

  // ── EM EXECUÇÃO (8) ──────────────────────────────────────────────────────
  {
    id: 13,
    title: "Implementar automação de e-mails pós-evento",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: 101,
    ownerName: "Evandro",
    dueDate: "2026-03-18",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 14,
    title: "Criar campanha de reativação de clientes inativos Q1",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-03-28",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: 15,
    title: "Migrar pipeline de vendas para novo CRM",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-04-01",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 16,
    title: "Implantar sistema de controle de emissão de notas fiscais",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2026-04-08",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 17,
    title: "Treinar equipe de suporte em nova plataforma de atendimento",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-04-14",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: 18,
    title: "Integrar dados de vendas e marketing no CRM unificado",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: null,
    ownerName: "Evandro",
    dueDate: "2026-04-20",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 19,
    title: "Desenvolver painel de acompanhamento de KPIs semanais",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-04-22",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: 20,
    title: "Implementar programa de indicação para produtores parceiros",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-04-28",
    priority: "medium",
    status: "in_progress",
  },

  // ── BLOQUEADO (3) ────────────────────────────────────────────────────────
  {
    id: 21,
    title: "Definir estrutura de precificação para eventos corporativos",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "João Pedro",
    dueDate: "2026-03-25",
    priority: "high",
    status: "blocked",
    blockedNote: "Aguardando retorno do contador externo para validação fiscal.",
  },
  {
    id: 22,
    title: "Integrar gateway de pagamentos com sistema de ingressos",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-03-30",
    priority: "high",
    status: "blocked",
    blockedNote: "API do parceiro está em manutenção. Previsão de retorno: 22/03.",
  },
  {
    id: 23,
    title: "Aprovar orçamento para nova ferramenta de automação de marketing",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-04-05",
    priority: "medium",
    status: "blocked",
    blockedNote: "Aguardando aprovação do board de diretores na reunião de abril.",
  },

  // ── ENTREGUE (21) ────────────────────────────────────────────────────────
  {
    id: 24,
    title: "Apresentar relatório de NPS Q4 2025 para sócios",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2026-03-10",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 25,
    title: "Revisar contrato com fornecedor de credenciamento",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-03-08",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 26,
    title: "Lançar nova landing page para captação de produtores",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-03-05",
    priority: "high",
    status: "delivered",
  },
  {
    id: 27,
    title: "Fechar parceria com plataforma de streaming para eventos",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: 102,
    ownerName: "Evandro",
    dueDate: "2026-02-28",
    priority: "high",
    status: "delivered",
  },
  {
    id: 28,
    title: "Migrar banco de dados de clientes para novo servidor",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-02-25",
    priority: "high",
    status: "delivered",
  },
  {
    id: 29,
    title: "Capacitar time de vendas em técnicas de upsell",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: null,
    ownerName: "Evandro",
    dueDate: "2026-02-20",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 30,
    title: "Publicar política de privacidade atualizada (LGPD)",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-02-15",
    priority: "high",
    status: "delivered",
  },
  {
    id: 31,
    title: "Criar processo de reconciliação financeira pós-evento",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2026-02-10",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 32,
    title: "Implementar chatbot de triagem para suporte ao produtor",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-02-05",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 33,
    title: "Realizar pesquisa de satisfação com produtores Q4",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2026-01-31",
    priority: "low",
    status: "delivered",
  },
  {
    id: 34,
    title: "Definir e publicar roadmap de produto 2026",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-01-28",
    priority: "high",
    status: "delivered",
  },
  {
    id: 35,
    title: "Renovar acordos de parceria com produtores âncora",
    area: "COMMERCIAL",
    ritualId: 1,
    meetingId: null,
    ownerName: "Evandro",
    dueDate: "2026-01-25",
    priority: "high",
    status: "delivered",
  },
  {
    id: 36,
    title: "Revisão e aprovação do plano estratégico 2026",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2026-01-20",
    priority: "high",
    status: "delivered",
  },
  {
    id: 37,
    title: "Atualizar fluxo de checkout para mobile (reduzir abandono)",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2026-01-15",
    priority: "high",
    status: "delivered",
  },
  {
    id: 38,
    title: "Contratar novo analista de dados para equipe de BI",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2026-01-10",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 39,
    title: "Criar régua de comunicação para retenção de produtores",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2025-12-20",
    priority: "medium",
    status: "delivered",
  },
  {
    id: 40,
    title: "Implementar autenticação de dois fatores na plataforma",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2025-12-15",
    priority: "high",
    status: "delivered",
  },
  {
    id: 41,
    title: "Fechar budget de marketing para Q1 2026",
    area: "MARKETING",
    ritualId: null,
    meetingId: null,
    ownerName: "Vinicius",
    dueDate: "2025-12-10",
    priority: "high",
    status: "delivered",
  },
  {
    id: 42,
    title: "Auditar e limpar base de dados de clientes inativos",
    area: "OPERATIONAL",
    ritualId: null,
    meetingId: null,
    ownerName: "José Pedro",
    dueDate: "2025-12-05",
    priority: "low",
    status: "delivered",
  },
  {
    id: 43,
    title: "Apresentar resultados Q3 para conselho de administração",
    area: "FINANCIAL",
    ritualId: 2,
    meetingId: null,
    ownerName: "Cairo",
    dueDate: "2025-11-30",
    priority: "high",
    status: "delivered",
  },
  {
    id: 44,
    title: "Finalizar integração com sistema de emissão de NF-e",
    area: "TECHNOLOGY",
    ritualId: null,
    meetingId: null,
    ownerName: "Ricardo",
    dueDate: "2025-11-25",
    priority: "high",
    status: "delivered",
  },
]

export function getRitualById(id: number): MockRitual | undefined {
  return mockRituals.find((r) => r.id === id)
}

export function getMeetingsByRitual(ritualId: number): MockMeeting[] {
  return mockMeetings.filter((m) => m.ritualId === ritualId).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getMeetingById(meetingId: number): MockMeeting | undefined {
  return mockMeetings.find((m) => m.id === meetingId)
}

export function getKpiById(id: number): MockKpi | undefined {
  return mockKpis.find((k) => k.id === id)
}

export function getKpisByRitualArea(areaSlug: AreaSlug): MockKpi[] {
  return mockKpis.filter((k) => k.area === areaSlug)
}

const statusLabels: Record<MockActionPlan["status"], string> = {
  planned: "Planejado",
  in_progress: "Em andamento",
  blocked: "Bloqueado",
  delivered: "Entregue",
  archived: "Arquivado",
}

export function actionPlanStatusLabel(s: MockActionPlan["status"]): string {
  return statusLabels[s]
}

export function meetingStatusLabel(
  s: MockMeeting["status"]
): string {
  const map: Record<MockMeeting["status"], string> = {
    scheduled: "Agendada",
    in_progress: "Em andamento",
    done: "Encerrada",
    cancelled: "Cancelada",
    not_tracked: "Não rastreada",
  }
  return map[s]
}
