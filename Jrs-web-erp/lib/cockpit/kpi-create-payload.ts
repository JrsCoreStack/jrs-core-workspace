/**
 * Corpo esperado por POST /cockpit/kpis (CreateCockpitKpiDTO no oticket-api-erp).
 * month_goal e annual_goal devem ser string (validação @IsString no backend).
 */

const AREA_SLUG: Record<string, string> = {
  Comercial: "COMERCIAL",
  Marketing: "MARKETING",
  Financeiro: "FINANCEIRO",
  Tecnologia: "TECNOLOGIA",
  Operacional: "OPERACIONAL",
  "Estratégico": "STRATEGIC",
  Estrategico: "STRATEGIC",
  Play: "PLAY",
}

const KPI_TYPE_FROM_KEY: Record<string, string> = {
  monetary: "Monetário",
  percentage: "Percentual",
  quantity: "Quantidade",
  index: "Índice",
}

const KPI_LABELS = new Set(["Monetário", "Percentual", "Quantidade", "Índice"])

/** Primeiro segmento antes de " — " nas opções longas de consolidação */
export function aggregationFromConsolidationLabel(consolidation: string): string {
  const first = consolidation.split(" — ")[0]?.trim()
  if (first && ["Soma", "Média", "Último valor", "Máximo", "Acumulado"].includes(first)) {
    if (first === "Acumulado") return "Soma"
    return first
  }
  return "Soma"
}

function resolveArea(area: string): string {
  if (AREA_SLUG[area]) return AREA_SLUG[area]
  return area
}

function resolveKpiType(kpiType: string): string {
  if (KPI_LABELS.has(kpiType)) return kpiType
  return KPI_TYPE_FROM_KEY[kpiType] ?? "Monetário"
}

export function buildCreateKpiBody(input: {
  name: string
  code?: string | null
  /** slug COMERCIAL ou rótulo "Comercial" */
  area: string
  /** "Monetário" | "monetary" | … */
  kpiType: string
  unit: string
  inputFrequency: string
  aggregation: string
  monthGoal: number
  annualGoal: number
  ownerName: string
  isCockpit: boolean
  ritualId?: string | null
  /** Desvio % abaixo do qual o KPI fica crítico (positivo, ex.: 15 = &lt; -15%). Padrão 15. */
  criticalDeviationThresholdPct?: number
  /** Faixa de atenção (≤ crítico), padrão 5. */
  attentionDeviationThresholdPct?: number
}): Record<string, unknown> {
  const name = input.name.trim()
  const area = resolveArea(input.area)
  const code = input.code?.trim()
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  return {
    name,
    metric: name,
    month_goal: String(input.monthGoal ?? 0),
    annual_goal: String(input.annualGoal ?? 0),
    unit: input.unit?.trim() ?? "",
    area,
    code_ref: code ? code : null,
    kpi_type: resolveKpiType(input.kpiType),
    aggregation: input.aggregation,
    input_frequency: input.inputFrequency,
    owner_name: input.ownerName.trim(),
    is_cockpit: input.isCockpit,
    critical_deviation_threshold_pct: String(
      input.criticalDeviationThresholdPct != null && Number.isFinite(input.criticalDeviationThresholdPct)
        ? input.criticalDeviationThresholdPct
        : 15,
    ),
    attention_deviation_threshold_pct: String(
      input.attentionDeviationThresholdPct != null && Number.isFinite(input.attentionDeviationThresholdPct)
        ? input.attentionDeviationThresholdPct
        : 5,
    ),
    ...(input.ritualId && uuidLike.test(input.ritualId) ? { ritual_id: input.ritualId } : {}),
  }
}
