"use client";

import { useSession } from "next-auth/react";
import { SignInDTO, UserSignIn, UserSignInAlternative, UpdateTokenResponse } from "@/models/auth";
import { signInUser, signUpUser, updateToken } from "@/utils/auth-utils";
import api from "@/utils/api";
import { useCallback } from "react";

/**
 * Hook para operações de autenticação em Client Components
 */
export const useAuthService = () => {
  const { data: session } = useSession();

  /**
   * Cria uma instância do axios com token de autenticação
   */
  const getAuthenticatedApi = () => {
    const token = session?.accessToken;
    
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    
    return api;
  };

  /**
   * Faz login do usuário
   */
  const SIGNIN = useCallback(
    async (data: SignInDTO): Promise<UserSignIn | UserSignInAlternative | undefined> => {
      const result = await signInUser(data);
      if (!result) {
        throw new Error("Login failed");
      }
      return result;
    },
    []
  );

  /**
   * Faz registro de novo usuário
   */
  const SIGNUP = useCallback(
    async (data: SignInDTO): Promise<UserSignIn | UserSignInAlternative | undefined> => {
      const result = await signUpUser(data);
      if (!result) {
        throw new Error("Sign up failed");
      }
      return result;
    },
    []
  );

  /**
   * Faz requisição autenticada (com token)
   */
  const authenticatedRequest = useCallback(
    async <T = any>(method: "get" | "post" | "put" | "delete", endpoint: string, data?: any): Promise<T> => {
      const authenticatedApi = getAuthenticatedApi();
      const response = await authenticatedApi[method]<T>(endpoint, data);
      return response.data;
    },
    [session]
  );

  /**
   * Atualiza o token para uma conta específica
   */
  const UPDATETOKEN = useCallback(
    async (
      token: string | undefined,
      account_id: string,
    ): Promise<UpdateTokenResponse | undefined> => {
      const result = await updateToken(token, account_id);
      if (!result) {
        throw new Error("Update token failed");
      }
      return result;
    },
    []
  );

  return {
    SIGNIN,
    SIGNUP,
    authenticatedRequest,
    UPDATETOKEN,
    isAuthenticated: !!session,
  };
};
