import { SignInDTO, UserSignIn, UserSignInAlternative, UpdateTokenResponse } from "@/models/auth";
import api from "@/utils/api";

/**
 * Funções utilitárias de autenticação
 * Podem ser usadas tanto em Server Components quanto em Client Components
 */

/**
 * Faz login do usuário
 */
export async function signInUser(
  data: SignInDTO
): Promise<UserSignIn | UserSignInAlternative | null> {
  try {
    const response = await api.post<UserSignIn | UserSignInAlternative>("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Sign in error:", error);
    return null;
  }
}

/**
 * Faz registro de novo usuário
 */
export async function signUpUser(
  data: SignInDTO
): Promise<UserSignIn | UserSignInAlternative | null> {
  try {
    const response = await api.post<UserSignIn | UserSignInAlternative>("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Sign up error:", error);
    return null;
  }
}

/**
 * Valida token de autenticação
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await api.get("/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Atualiza o token para uma conta específica
 */
export async function updateToken(
  token: string | undefined,
  account_id: string
): Promise<UpdateTokenResponse | null> {
  try {
    const response = await api.post<UpdateTokenResponse>("/auth/token/update", {
      token: token,
      account_id: account_id,
    });
    return response.data;
  } catch (error) {
    console.error("Update token error:", error);
    return null;
  }
}
