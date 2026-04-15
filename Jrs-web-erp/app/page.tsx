export default function Home() {
  // Home público: sempre inicia no login
  // (o middleware garante proteção das rotas privadas, mas esse redirect evita cair no template).
  const { redirect } = require("next/navigation") as typeof import("next/navigation");
  redirect("/auth");
}
