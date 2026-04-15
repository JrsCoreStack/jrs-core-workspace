import "next-auth";
import "next-auth/jwt";
import { Account } from "@/models/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
    accessToken?: string;
    accounts?: Account[];
    role?: string;
    permissions?: string[];
    currentAccountId?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    accessToken?: string;
    accounts?: Account[];
    role?: string;
    permissions?: string[];
    currentAccountId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    accounts?: Account[];
    role?: string;
    permissions?: string[];
    currentAccountId?: string;
  }
}
