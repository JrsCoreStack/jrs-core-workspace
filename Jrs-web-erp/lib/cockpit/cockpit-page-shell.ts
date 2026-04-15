import { cn } from "@/lib/utils"

/**
 * `<main>` padrão das telas do cockpit: padding mobile, sem overflow horizontal,
 * scroll vertical no painel (com sidebar colapsável).
 */
export const COCKPIT_MAIN_CLASS = cn(
  "flex-1 min-h-0 space-y-4 overflow-x-hidden overflow-y-auto p-4 sm:space-y-6 sm:p-6",
)
