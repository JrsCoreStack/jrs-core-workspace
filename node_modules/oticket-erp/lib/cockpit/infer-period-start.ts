/** Alinhado a `infer-period-start` no oticket-api-erp (rótulos tipo "Abr 2026"). */

export function inferPeriodStartFromLabel(periodLabel: string): string | null {
  const t = String(periodLabel ?? "").trim()
  if (!t) return null

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return t

  const MONTH_MAP: Record<string, number> = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  }

  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null

  const year = Number(parts[parts.length - 1])
  if (!Number.isFinite(year) || year < 1970 || year > 2100) return null

  const monToken = parts[0].toLowerCase().replace(/\./g, "").slice(0, 3)
  const monthIdx = MONTH_MAP[monToken]
  if (monthIdx === undefined) return null

  const mm = String(monthIdx + 1).padStart(2, "0")
  return `${year}-${mm}-01`
}
