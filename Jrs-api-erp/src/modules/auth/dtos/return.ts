export class ReturnAuthDTO {
  token: string;
  expiresIn: string;
  user: {
    id: string;
    name: string;
    email: string;
    totp_secret?: string | null;
    is2fa_enabled?: boolean;
    cpf: string;
  };
  account: {
    id: string;
    name: string;
  };
  accounts?: Array<{
    id: string;
    name: string;
    code: string;
    email: string;
    type: number;
    level: string;
  }>;
  current_account_id?: string | null;
  role: string | null;
  permissions: string[];
}
