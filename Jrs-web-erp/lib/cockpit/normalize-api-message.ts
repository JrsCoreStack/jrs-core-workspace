/** Extrai mensagem legível do body típico do NestJS / erros JSON. */

export function messageFromResponseData(data: unknown): string {
  if (!data || typeof data !== "object") return ""
  const d = data as Record<string, unknown>
  const m = d.message
  if (typeof m === "string" && m.trim()) return m.trim()
  if (Array.isArray(m) && m.length > 0) {
    const parts = m.map((x) => (typeof x === "string" ? x : String(x))).filter(Boolean)
    if (parts.length) return parts.join("; ")
  }
  if (typeof d.error === "string" && d.error.trim()) return d.error.trim()
  return ""
}
