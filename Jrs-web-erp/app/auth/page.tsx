"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register">("login");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se já está autenticado, redireciona
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  // Mostra loading enquanto verifica a sessão
  if (status === "loading") {
    return null;
  }

  // Se já está autenticado, não renderiza nada (será redirecionado)
  if (status === "authenticated") {
    return null;
  }

  return (
    <>
      {view === "login" ? (
        <LoginForm
          onSwitchToRegister={() => setView("register")}
        />
      ) : (
        <RegisterForm onSwitchToLogin={() => setView("login")} />
      )}
    </>
  );
}
