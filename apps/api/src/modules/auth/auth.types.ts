export type AuthPrincipal = {
  subject: string;
  username?: string;
  roles: string[];
  scopes: string[];
  claims: Record<string, unknown>;
};
