/** Shared constants for cockpit module — replaces mock-data imports */

export const COCKPIT_AREAS = [
  { slug: "COMMERCIAL", name: "Comercial", color: "#2563eb" },
  { slug: "MARKETING", name: "Marketing", color: "#db2777" },
  { slug: "FINANCIAL", name: "Financeiro", color: "#16a34a" },
  { slug: "TECHNOLOGY", name: "Tecnologia", color: "#7c3aed" },
  { slug: "OPERATIONAL", name: "Operacional", color: "#ca8a04" },
  { slug: "STRATEGIC", name: "Estratégico", color: "#0f766e" },
  { slug: "PLAY", name: "Play", color: "#0d9488" },
] as const

export type AreaSlug = (typeof COCKPIT_AREAS)[number]["slug"]

const AREA_ALIAS: Record<string, AreaSlug> = {
  COMERCIAL: "COMMERCIAL",
  COMMERCIAL: "COMMERCIAL",
  MARKETING: "MARKETING",
  FINANCEIRO: "FINANCIAL",
  FINANCIAL: "FINANCIAL",
  TECNOLOGIA: "TECHNOLOGY",
  TECHNOLOGY: "TECHNOLOGY",
  OPERACIONAL: "OPERATIONAL",
  OPERAÇÕES: "OPERATIONAL",
  OPERATIONAL: "OPERATIONAL",
  ESTRATEGICO: "STRATEGIC",
  STRATEGIC: "STRATEGIC",
  PLAY: "PLAY",
}

export function normalizeAreaSlug(value: string): AreaSlug | string {
  const key = String(value ?? "").trim().toUpperCase()
  return AREA_ALIAS[key] ?? value
}

export function areaLabel(slug: string): string {
  const normalized = normalizeAreaSlug(slug)
  return COCKPIT_AREAS.find((a) => a.slug === normalized)?.name ?? slug
}

export function areaColor(slug: string): string {
  const normalized = normalizeAreaSlug(slug)
  return COCKPIT_AREAS.find((a) => a.slug === normalized)?.color ?? "#64748b"
}

export const ACTION_PLAN_STATUS_LABELS: Record<string, string> = {
  planned: "Planejado",
  in_progress: "Em Execução",
  blocked: "Bloqueado",
  delivered: "Entregue",
  archived: "Arquivado",
}

export const MEETING_STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  done: "Realizado",
  cancelled: "Cancelado",
  not_tracked: "Não rastreado",
}

export const KPI_STATUS_LABELS: Record<string, string> = {
  above: "Atingindo Meta",
  attention: "Em Atenção",
  critical: "Crítico",
  empty: "Sem Atualização",
}

export const OWNERS = ["Evandro", "Vinicius", "Cairo", "Ricardo", "José Pedro", "João Arantes"]
