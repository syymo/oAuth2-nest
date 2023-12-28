// 3. 客户端凭证模式 (Client Credentials Grant)
// src/oauth2/client-credentials.service.ts

import { Injectable } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';

@Injectable()
export class ClientCredentialsService {
  constructor(private readonly oauth2Service: OAuth2Service) {}

  // 客户端凭证模式 - 发放令牌
  issueTokenWithClientCredentialsGrant(
    clientId: string,
    clientSecret: string,
  ): any {
    // Implement client credentials grant logic
    // ...

    const client = this.oauth2Service.getClient(clientId);

    if (
      !client ||
      !client.clientSecret ||
      client.clientSecret !== clientSecret
    ) {
      return { error: 'invalid_client' };
    }

    const accessToken = this.oauth2Service.generateAccessToken(clientId, null); // No user ID

    return {
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
    };
  }
}
