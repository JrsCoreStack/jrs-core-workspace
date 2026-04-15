/**
 * Telemetria leve no cliente: log estruturado opcional + beacon HTTP opcional.
 * - NEXT_PUBLIC_COCKPIT_TELEMETRY=1 — loga no console (útil em dev/staging).
 * - NEXT_PUBLIC_COCKPIT_TELEMETRY_URL — POST JSON (fire-and-forget) em erros de API.
 */

export type CockpitTelemetryLevel = "error" | "warn" | "info"

export type CockpitTelemetryPayload = {
  level: CockpitTelemetryLevel
  /** Ex.: GET /cockpit/kpis, ritual.save */
  action: string
  message: string
  status?: number
  path?: string
  method?: string
}

function envEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COCKPIT_TELEMETRY === "1"
}

function telemetryUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_COCKPIT_TELEMETRY_URL?.trim()
  return u || undefined
}

export function reportCockpitTelemetry(payload: CockpitTelemetryPayload): void {
  if (typeof window === "undefined") return

  const body = {
    source: "oticket-web-erp",
    namespace: "cockpit",
    ts: new Date().toISOString(),
    href: typeof window !== "undefined" ? window.location?.href : undefined,
    ...payload,
  }

  if (envEnabled()) {
    const line = `[cockpit:telemetry] ${JSON.stringify(body)}`
    if (payload.level === "error") console.error(line)
    else if (payload.level === "warn") console.warn(line)
    else console.info(line)
  }

  const url = telemetryUrl()
  if (!url) return

  try {
    const json = JSON.stringify(body)
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" })
      navigator.sendBeacon(url, blob)
      return
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}
