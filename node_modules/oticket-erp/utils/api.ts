import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { messageFromResponseData } from "@/lib/cockpit/normalize-api-message";
import { reportCockpitTelemetry } from "@/lib/cockpit/telemetry";

/**
 * Base URL das chamadas à API JRS ERP.
 * - Browser sem NEXT_PUBLIC_API_URL: /api-proxy → rewrite em next.config (evita CORS em dev).
 * - Browser com NEXT_PUBLIC_API_URL: chamada direta (CORS deve permitir).
 * - Servidor (NextAuth, RSC): API_URL → NEXT_PUBLIC_API_URL → http://127.0.0.1:8081.
 *   Servidor NUNCA usa /api-proxy (não existe no Node).
 */
function getApiBaseUrl(): string {
  const serverUrl = process.env.API_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== "undefined") {
    if (publicUrl) return publicUrl.replace(/\/$/, "");
    return "/api-proxy";
  }

  if (serverUrl) return serverUrl.replace(/\/$/, "");
  if (publicUrl) return publicUrl.replace(/\/$/, "");
  return "http://127.0.0.1:8081";
}

// Cria instância sem baseURL fixa — definida por requisição para não congelar no bundle server/client
const api: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// JWT em toda requisição feita no browser (rotas com AuthGuard na API ERP).
// getSession() é mais confiável que defaults.headers (evita 401 antes do useEffect do ApiAuthSync).
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        const token =
          session && typeof session === "object" && "accessToken" in session
            ? (session as { accessToken?: string }).accessToken
            : undefined;
        if (typeof token === "string" && token.length > 0) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        /* sessão indisponível */
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

function buildNormalizedReject(params: {
  status: number;
  message: string;
  data: unknown;
  method?: string;
  path?: string;
}) {
  const { status, message, data, method, path } = params;
  const finalMessage =
    (message && String(message).trim()) ||
    (status === 0
      ? "Erro de conexão. Verifique sua internet."
      : "Ocorreu um erro na requisição.");

  const report4xx =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_COCKPIT_TELEMETRY_4XX === "1" &&
    status >= 400 &&
    status < 500;

  if (status >= 500 || status === 0 || report4xx) {
    reportCockpitTelemetry({
      level: status >= 500 || status === 0 ? "error" : "warn",
      action: `${method ?? "?"} ${path ?? ""}`.trim(),
      message: finalMessage,
      status,
      method,
      path,
    });
  }

  return Promise.reject({
    isNormalizedApiError: true as const,
    status,
    message: finalMessage,
    data,
  });
}

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase();
    const path =
      (error.config?.baseURL ? String(error.config.baseURL).replace(/\/$/, "") : "") +
      (error.config?.url ?? "");

    if (error.response) {
      const status = error.response.status;
      const fromBody = messageFromResponseData(error.response.data);
      const message =
        fromBody ||
        (typeof (error.response.data as { message?: unknown })?.message === "string"
          ? String((error.response.data as { message: string }).message)
          : "") ||
        error.message;

      return buildNormalizedReject({
        status,
        message,
        data: error.response.data,
        method,
        path: path || error.config?.url,
      });
    }
    if (error.request) {
      const base = error.config?.baseURL ?? getApiBaseUrl();
      return buildNormalizedReject({
        status: 0,
        message:
          "Não foi possível contatar a API. Confira se o servidor está no ar (ex.: oticket-api-erp na porta 8081).",
        data: {
          code: "ECONN_NETWORK" as const,
          attemptedBaseURL: base,
          hint:
            "Em dev, o front usa o proxy /api-proxy → 127.0.0.1:8081 (next.config). Ajuste COCKPIT_API_ORIGIN se a API estiver em outra porta. Com NEXT_PUBLIC_API_URL definido, o browser chama essa URL direto.",
        },
        method,
        path: path || error.config?.url,
      });
    }
    return buildNormalizedReject({
      status: 0,
      message: error.message,
      data: null,
      method,
      path: path || error.config?.url,
    });
  }
);

export default api;
