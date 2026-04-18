import { auth } from "@/auth";
import api from "@/utils/api";
import { AxiosRequestConfig } from "axios";

/**
 * Cliente HTTP para fazer requisições autenticadas à API
 * Use este utilitário em Server Components ou Server Actions
 * 
 * @deprecated Use authService ou crie services específicos em services/
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {}
) {
  const session = await auth();

  // Adiciona o token de autenticação se disponível
  const config: AxiosRequestConfig = {
    ...options,
    headers: {
      ...options.headers,
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
  };

  const response = await api<T>(endpoint, config);
  return response.data;
}
