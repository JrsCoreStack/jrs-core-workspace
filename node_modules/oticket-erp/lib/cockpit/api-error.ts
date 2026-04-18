import { toast } from "sonner"
import { AxiosError } from "axios"
import { messageFromResponseData } from "./normalize-api-message"

/** Objeto rejeitado pelo interceptor em `utils/api.ts` */
export type NormalizedApiError = {
  readonly isNormalizedApiError: true
  status: number
  message: string
  data: unknown
}

export function isNormalizedApiError(e: unknown): e is NormalizedApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as NormalizedApiError).isNormalizedApiError === true
  )
}

/** Extrai mensagem amigável a partir de qualquer erro de API (axios normalizado ou legado). */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro. Tente novamente."
): string {
  if (isNormalizedApiError(error)) {
    const m = error.message?.trim()
    return m || fallback
  }
  if (error instanceof AxiosError) {
    const fromData = messageFromResponseData(error.response?.data)
    if (fromData) return fromData
    if (error.message) return error.message
    return fallback
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim()
  if (typeof error === "object" && error !== null && "message" in error) {
    const m = (error as { message?: unknown }).message
    if (typeof m === "string" && m.trim()) return m.trim()
  }
  return fallback
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (isNormalizedApiError(error)) return error.status
  if (error instanceof AxiosError) return error.response?.status
  return undefined
}

/** Toast de erro com mensagem extraída do backend (telemetria 5xx/rede fica no `utils/api`). */
export function toastApiError(
  error: unknown,
  options?: { fallback?: string }
): void {
  const msg = getApiErrorMessage(error, options?.fallback)
  toast.error(msg)
}
