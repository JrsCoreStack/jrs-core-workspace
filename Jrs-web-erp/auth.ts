import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { signInUser } from "@/utils/auth-utils";
import {
  SignInDTO,
  type Account,
  type UserSignIn,
  type UserSignInAlternative,
} from "@/models/auth";

export const config = {
  pages: {
    signIn: "/auth",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");
      
      if (isOnAuthPage) {
        if (isLoggedIn) {
          return false; // Middleware vai redirecionar
        }
        return true;
      }
      
      if (!isLoggedIn) {
        return false; // Middleware vai redirecionar
      }
      
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.accounts = user.accounts;
        token.role = user.role;
        token.permissions = user.permissions;
        token.currentAccountId = user.currentAccountId;
      }
      
      // Quando a sessão for atualizada (ex: troca de conta), atualizar o token
      if (trigger === "update" && session) {
        if (session.accessToken !== undefined) {
          token.accessToken = session.accessToken as string;
        }
        
        if (session.role !== undefined) {
          token.role = session.role as string | undefined;
        }
        
        if (session.permissions !== undefined) {
          token.permissions = session.permissions as string[] | undefined;
        }
        
        if (session.accounts) {
          token.accounts = session.accounts;
        }
        
        if (session.currentAccountId !== undefined) {
          token.currentAccountId = session.currentAccountId as string | undefined;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.accounts = token.accounts;
        session.role = token.role as string | undefined;
        session.permissions = token.permissions as string[] | undefined;
        session.currentAccountId = token.currentAccountId as string | undefined;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        // aceita o campo como "cpf" — formulário deve enviar { cpf, password }
        cpf: { label: "CPF", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginValue = (credentials?.cpf as string | undefined)?.trim();
        if (!loginValue || !credentials?.password) {
          return null;
        }

        try {
          const cpfClean = loginValue.replace(/\D/g, "");

          const signInData: SignInDTO = {
            cpf: cpfClean,
            password: credentials.password as string,
          };

          const data = await signInUser(signInData);
          if (!data) return null;

          type LoginPayload = UserSignIn | UserSignInAlternative;
          const payload = data as LoginPayload & { current_account_id?: string };

          let id: string;
          let email: string;
          let name: string;
          let token: string | undefined;
          let accounts: Account[] = [];
          let role: string | undefined;
          let permissions: string[] = [];

          if ("user" in data && data.user) {
            const u = data.user;
            id = String(u.id ?? u._id ?? "");
            email = u.email ?? "";
            name = (u.name ?? u.email ?? "") || "";
            token = data.token ?? data.accessToken;
            accounts = data.accounts ?? [];
            role = data.role;
            permissions = data.permissions ?? [];
          } else {
            const alt = data as UserSignInAlternative;
            id = alt.id;
            email = alt.email;
            name = (alt.name ?? alt.email ?? "") || "";
            token = alt.token ?? alt.accessToken;
            accounts = alt.accounts ?? [];
            role = alt.role;
            permissions = alt.permissions ?? [];
          }

          if (!token) return null;

          const currentAccountId =
            typeof payload.current_account_id === "string"
              ? payload.current_account_id
              : undefined;

          return {
            id,
            email,
            name,
            accessToken: token,
            accounts,
            role,
            permissions,
            currentAccountId,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
