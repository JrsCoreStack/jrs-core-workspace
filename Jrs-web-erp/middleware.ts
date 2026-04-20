import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Rotas públicas que não precisam de autenticação
  // /api-proxy/* é o proxy reverso para a API NestJS — nunca bloquear aqui
  const publicRoutes = ["/auth", "/api/auth", "/api-proxy"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Se está na rota de auth e já está logado, redireciona para o cockpit
  if (pathname.startsWith("/auth") && isLoggedIn) {
    return NextResponse.redirect(new URL("/cockpit", req.url));
  }

  // Se não está logado e não está em rota pública, redireciona para login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
