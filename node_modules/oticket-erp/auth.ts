import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { signInUser } from "@/utils/auth-utils";
import { SignInDTO } from "@/models/auth";

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
        cpf: { label: "CPF", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.password) {
          return null;
        }

        try {
          // Remove formatação do CPF (pontos e traços)
          const cpfClean = (credentials.cpf as string).replace(/\D/g, "");
          
          const signInData: SignInDTO = {
            cpf: cpfClean,
            password: credentials.password as string,
          };

          const data = await signInUser(signInData);

          if (!data) {
            return null;
          }

          // Ajuste aqui conforme a estrutura da resposta da sua API
          // Exemplo esperado: { user: { id, email, name }, token: "...", accounts: [...], role: "...", permissions: [...] }
          if ("user" in data && data.user && data.token) {
            const user = data.user as any; // Type assertion para permitir _id
            return {
              id: user.id || user._id || String(user.id || user._id),
              email: user.email,
              name: user.name || user.username || user.email,
              accessToken: data.token || data.accessToken,
              accounts: data.accounts || [],
              role: data.role,
              permissions: data.permissions || [],
            };
          }

          // Se sua API retorna de forma diferente, ajuste aqui
          // Exemplo alternativo: { id, email, name, token, accounts, role, permissions }
          if ("id" in data && data.id && data.email) {
            return {
              id: String(data.id),
              email: data.email,
              name: data.name || data.username || data.email,
              accessToken: data.token || data.accessToken,
              accounts: data.accounts || [],
              role: data.role,
              permissions: data.permissions || [],
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
