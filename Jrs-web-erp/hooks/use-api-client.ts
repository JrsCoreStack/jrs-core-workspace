"use client";

import { useSession } from "next-auth/react";
import api from "@/utils/api";
import { AxiosRequestConfig } from "axios";

/**
 * Hook para fazer requisições autenticadas à API em Client Components
 * 
 * @deprecated Use useAuthService ou crie hooks específicos em hooks/
 */
export function useApiClient() {
  const { data: session } = useSession();

  const fetchWithAuth = async <T = any>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ) => {
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
  };

  return { fetchWithAuth, isAuthenticated: !!session };
}
