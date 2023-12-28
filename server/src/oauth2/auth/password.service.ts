// 2. 密码模式 (Resource Owner Password Credentials Grant)
// src/oauth2/password.service.ts

import { Injectable } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';

@Injectable()
export class PasswordService {
  constructor(private readonly oauth2Service: OAuth2Service) {}

  // 密码授权模式 - 发放令牌
  issueTokenWithPasswordGrant(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
  ): any {
    // Implement password grant logic
    // ...

    const client = this.oauth2Service.getClient(clientId);

    if (
      !client ||
      !client.clientSecret ||
      client.clientSecret !== clientSecret
    ) {
      return { error: 'invalid_client' };
    }

    const userId = this.validateUserCredentials(username, password);

    if (!userId) {
      return { error: 'invalid_grant' };
    }

    const accessToken = this.oauth2Service.generateAccessToken(
      clientId,
      userId,
    );

    return {
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      tokenType: 'Bearer',
    };
  }

  // 示例用户验证函数（替换为实际的用户验证逻辑）
  private validateUserCredentials(
    username: string,
    password: string,
  ): string | null {
    if (username === 'user123' && password === 'password123') {
      return 'user123';
    }

    return null;
  }
}
