export interface OAuth2Token {
  clientId: string;
  redirectUri: string;
  userId: string;
  expiresAt: Date;
}

export interface Token {
  clientId: string;
  userId: string;
  expiresAt: Date;
}
