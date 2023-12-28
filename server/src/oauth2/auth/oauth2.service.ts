// src/oauth2/oauth2.service.ts

import { Injectable } from '@nestjs/common';
import { OAuth2Token, Token } from '../oauth2-token.model';

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Shanghai', // 根据需要调整时区
};

const formattedDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', options).format(date);

@Injectable()
export class OAuth2Service {
  private clients = [
    {
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      grants: [
        'authorization_code',
        'password',
        'client_credentials',
        'implicit',
      ],
      redirectUris: [
        'http://localhost:7010/oauth2/callback',
        'http://localhost:5173/auth-login/callback',
      ],
    },
    {
      clientId: 'client123',
      clientSecret: 'secret123',
      grants: ['authorization_code', 'implicit'],
      redirectUris: [
        'http://localhost:7010/oauth2/callback',
        'http://localhost:5173/auth-login/callback',
      ],
    },
  ];

  // 授权码存储
  private authorizationCodes = new Map<string, OAuth2Token>();
  // 令牌存储
  private accessTokens = new Map<string, Token>();
  // 刷新令牌存储
  private refreshTokens = new Map<string, Token>(); // 令牌有效期（以秒为单位），根据实际需求调整

  // 获取客户端
  getClient(clientId: string): any {
    return this.clients.find((client) => client.clientId === clientId);
  }

  // 存储授权码
  storeAuthorizationCode(code: string, authorizationCode: any) {
    console.log('storeAuthorizationCode', code, authorizationCode);
    this.authorizationCodes.set(code, authorizationCode);
  }

  generateAccessToken(
    clientId: string,
    userId: string,
  ): { accessToken: string; expiresAt: string } {
    const expiresIn = 3600; // 令牌有效期（以秒为单位），根据实际需求调整
    const accessToken = this.generateRandomToken(); // 生成令牌

    // const refreshExpiresIn = 2592000; // 刷新令牌有效期，默认30天
    // const refreshToken = this.generateRandomToken(); // 生成刷新令牌

    // 计算令牌过期时间
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    // const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

    // 存储令牌及相关信息
    this.storeAccessToken(accessToken, clientId, userId, expiresAt);
    // this.storeRefreshToken(refreshToken, clientId, userId, refreshExpiresAt);
    console.log('generateAccessToken', accessToken, expiresAt);
    return { accessToken, expiresAt: formattedDate(expiresAt) };
  }

  private storeAccessToken(
    accessToken: string,
    clientId: string,
    userId: string,
    expiresAt: Date,
  ) {
    // 实际项目中可能需要将令牌存储在数据库或缓存中
    // 这里简化为在内存中存储
    this.accessTokens.set(accessToken, {
      clientId,
      userId,
      expiresAt,
    });
  }

  private generateRefreshToken(clientId: string, userId: string): string {
    const refreshExpiresIn = 2592000; // 刷新令牌有效期，默认30天
    const refreshToken = this.generateRandomToken(); // 生成刷新令牌

    // 计算令牌过期时间
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

    // 存储令牌及相关信息
    this.storeRefreshToken(refreshToken, clientId, userId, refreshExpiresAt);

    return refreshToken;
  }

  private storeRefreshToken(
    refreshToken: string,
    clientId: string,
    userId: string,
    expiresAt: Date,
  ) {
    // 实际项目中可能需要将刷新令牌存储在数据库或缓存中
    // 这里简化为在内存中存储
    this.refreshTokens.set(refreshToken, {
      clientId,
      userId,
      expiresAt,
    });
  }

  // 生成随机访问令牌
  private generateRandomToken(): string {
    return Math.random().toString(36).slice(-8);
  }

  // 根据授权码获取令牌
  exchangeAuthorizationCodeForToken(code: string): any {
    const authorizationCode = this.authorizationCodes.get(code);
    console.log('exchangeAuthorizationCodeForToken', code, authorizationCode);

    if (authorizationCode) {
      // 生成访问令牌和 refresh token
      const token = this.generateAccessToken(
        authorizationCode.clientId,
        authorizationCode.userId,
      );
      const refreshToken = this.generateRefreshToken(
        authorizationCode.clientId,
        authorizationCode.userId,
      );
      const accessToken = token.accessToken;

      // 返回访问令牌和 refresh token 信息，包括过期时间
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_at: token.expiresAt,
      };
    }

    return null;
  }

  // 根据刷新令牌获取新的访问令牌
  exchangeRefreshTokenForToken(refreshToken: string): any {
    const refreshTokenInfo = this.refreshTokens.get(refreshToken);

    if (refreshTokenInfo) {
      // 生成新的访问令牌和新的 refresh token
      const newToken = this.generateAccessToken(
        refreshTokenInfo.clientId,
        refreshTokenInfo.userId,
      );
      const newAccessToken = newToken.accessToken;
      const newRefreshToken = this.generateRefreshToken(
        refreshTokenInfo.clientId,
        refreshTokenInfo.userId,
      );

      // 删除旧的 refresh token
      delete this.refreshTokens[refreshToken];

      // 返回新的访问令牌和新的 refresh token 信息，包括过期时间
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_at: newToken.expiresAt,
      };
    }

    return null;
  }

  // 作废授权码
  invalidateAuthorizationCode(code: string) {
    this.authorizationCodes.delete(code);
  }

  // 作废访问令牌
  invalidateAccessToken(accessToken: string) {
    this.accessTokens.delete(accessToken);
  }

  // 作废刷新令牌
  invalidateRefreshToken(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
  }
}
