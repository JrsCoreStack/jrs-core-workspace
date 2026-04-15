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

  // EVENT_SITE_WEB -> Site de Clientes (https://oticket.com.br/)
  if (source === "EVENT_SITE_WEB") {
    return "Site de Clientes - OTicket Eventos (https://oticket.com.br/)";
  }

  // EVENT_SITE_APP -> Aplicativo de Clientes
  if (source === "EVENT_SITE_APP") {
    return "Aplicativo de Clientes - OTicket Eventos";
  }

  // EVENT_ADMIN_APP -> Aplicativo de Comissários
  if (source === "EVENT_ADMIN_APP") {
    return "Aplicativo de Comissários - OTicket Eventos";
  }

  // Fallback: retorna o valor original
  return externalSource;
}

export default formatExternalSource;
