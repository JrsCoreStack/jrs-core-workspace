import { ExternalSource } from "../enums/external_source.enum";

export const externalSourceFormat = (externalSource: string) => {
  switch (externalSource) {
    case 'site_clientes':
      return ExternalSource.EVENT_SITE_WEB;
    case 'app_admin':
      return ExternalSource.EVENT_ADMIN_APP;
    case 'app_clientes':
      return ExternalSource.EVENT_SITE_APP;
  }
};