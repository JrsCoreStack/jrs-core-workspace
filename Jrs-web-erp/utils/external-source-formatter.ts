/**
 * Formata a fonte externa para exibição
 * @param externalSource - Fonte externa (ex: "EVENT_SITE_WEB", "APP_ADMIN")
 * @returns String formatada da fonte externa
 */
function formatExternalSource(externalSource: string | null | undefined): string {
  if (!externalSource) {
    return "-";
  }

  const source = externalSource.trim();

  // EVENT_SITE_WEB -> canal web (vendas do projeto integrado)
  if (source === "EVENT_SITE_WEB") {
    return "Site de clientes — canal web";
  }

  // EVENT_SITE_APP -> aplicativo de clientes
  if (source === "EVENT_SITE_APP") {
    return "Aplicativo de clientes";
  }

  // EVENT_ADMIN_APP -> aplicativo operacional / comissários
  if (source === "EVENT_ADMIN_APP") {
    return "Aplicativo operacional";
  }

  // Fallback: retorna o valor original
  return externalSource;
}

export default formatExternalSource;
