/** Abas da tela de configurações (?tab=…) — usado pela sidebar drill-down e pela página. */

export type PerfilSettingsTabId =
  | "workspace"
  | "membros"
  | "faturamento"
  | "seguranca"
  | "notificacoes"
  | "perfil"

export const PERFIL_SETTINGS_TAB_IDS: PerfilSettingsTabId[] = [
  "workspace",
  "membros",
  "faturamento",
  "seguranca",
  "notificacoes",
  "perfil",
]

export function parsePerfilTabParam(
  raw: string | null
): PerfilSettingsTabId | null {
  if (!raw) return null
  return PERFIL_SETTINGS_TAB_IDS.includes(raw as PerfilSettingsTabId)
    ? (raw as PerfilSettingsTabId)
    : null
}

const SOCIO_ONLY = new Set<PerfilSettingsTabId>([
  "workspace",
  "membros",
  "faturamento",
])

export function isSocioOnlyTab(tab: PerfilSettingsTabId): boolean {
  return SOCIO_ONLY.has(tab)
}
