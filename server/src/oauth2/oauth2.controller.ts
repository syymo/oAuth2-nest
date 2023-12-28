import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { OAuth2Service } from './auth/oauth2.service';
import { AuthorizationCodeService } from './auth/authorization-code.service';
import { PasswordService } from './auth/password.service';
import { ClientCredentialsService } from './auth/client-credentials.service';
import { ImplicitService } from './auth/implicit.service';

@Controller('oauth2')
export class OAuth2Controller {
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly authorizationCodeService: AuthorizationCodeService,
    private readonly passwordService: PasswordService,
    private readonly clientCredentialsService: ClientCredentialsService,
    private readonly implicitService: ImplicitService,
  ) {}

  @Get('authorize')
  authorize(
    @Query('response_type') responseType: string,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('scope') scope: string,
    @Query('state') state: string,
  ) {
    console.log('====authorize====', responseType, clientId, redirectUri);
    if (responseType === 'code') {
      return this.handleAuthorizationCode(clientId, redirectUri, state);
    } else if (responseType === 'token') {
      return this.handleImplicitGrant(
        clientId,
        redirectUri,
        responseType,
        state,
      );
    } else {
      return { url: redirectUri + '?error=unsupported_response_type' };
    }
  }

  @Post('token')
  issueToken(@Body() body) {
    const { grant_type: grantType } = body;
    console.log('====token grantType====', grantType);
    switch (grantType) {
      case 'authorization_code':
        return this.issueTokenWithAuthorizationCode(body);
      case 'password':
        return this.issueTokenWithPasswordGrant(body);
      case 'client_credentials':
        return this.issueTokenWithClientCredentialsGrant(body);
      default:
        return { error: 'unsupported_grant_type' };
    }
  }

  @Get('refresh')
  refreshToken(@Query('refresh_token') refreshToken: string) {
    const newTokens =
      this.oauth2Service.exchangeRefreshTokenForToken(refreshToken);
    console.log('====refreshToken====', newTokens);
    if (newTokens) {
      return {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        token_type: newTokens.token_type,
        expires_at: newTokens.expires_at,
      };
    } else {
      return {
        error: 'invalid_grant',
        error_description: 'Invalid refresh token',
      };
    }
  }

  // 处理授权码模式请求
  private handleAuthorizationCode(
    clientId: string,
    redirectUri: string,
    state: string,
  ) {
    const client = this.oauth2Service.getClient(clientId);
    if (
      !client ||
      !client.redirectUris.includes(redirectUri) ||
      !client.grants.includes('authorization_code')
    ) {
      return { url: redirectUri + '?error=invalid_request' };
    }

    const userId = 'user123';
    const authorizationCode =
      this.authorizationCodeService.generateAuthorizationCode(
        clientId,
        redirectUri,
        userId,
      );

    return { url: `${redirectUri}?code=${authorizationCode}&state=${state}` };
  }

  // 处理隐式授权模式请求
  @Redirect()
  private handleImplicitGrant(
    clientId: string,
    redirectUri: string,
    responseType: string,
    state: string,
  ) {
    const client = this.oauth2Service.getClient(clientId);
    console.log(
      '====handleImplicitGrant====',
      clientId,
      redirectUri,
      responseType,
      state,
      client,
    );
    if (
      !client ||
      !client.redirectUris.includes(redirectUri) ||
      !client.grants.includes('implicit')
    ) {
      return { url: redirectUri + '?error=invalid_request' };
    }

    const authorizationCode = this.implicitService.issueTokenWithImplicitGrant(
      clientId,
      redirectUri,
      responseType,
    );
    if (authorizationCode.error) {
      return { url: `${redirectUri}?error=${authorizationCode.error}` };
    }
    const accessToken = authorizationCode.access_token;
    const url = `${redirectUri}#access_token=${accessToken.accessToken}&expires_at=${accessToken.expiresAt}&token_type=${authorizationCode.token_type}&state=${state}`;
    console.log(`====handleImplicitGrant====`, authorizationCode, url);
    return {
      url,
    };
  }

  // 发放令牌 - 根据授权码
  private issueTokenWithAuthorizationCode(body: any) {
    console.log('====issueTokenWithAuthorizationCode====', body);
    const {
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    } = body;

    const token =
      this.authorizationCodeService.exchangeAuthorizationCodeForToken(code);

    if (!token) {
      return { error: 'invalid_grant' };
    }
    console.log('====issueTokenWithAuthorizationCode====', token);
    return {
      access_token: token.access_token,
      token_type: 'Bearer',
      expires_at: token.expires_at,
      refresh_token: token.refresh_token,
    };
  }

  // 发放令牌 - 密码授权模式
  private issueTokenWithPasswordGrant(body: any) {
    const {
      username,
      password,
      client_id: clientId,
      client_secret: clientSecret,
    } = body;

    const token = this.passwordService.issueTokenWithPasswordGrant(
      username,
      password,
      clientId,
      clientSecret,
    );
    console.log('===issueTokenWithPasswordGrant===', token);
    if (token && token.accessToken && token.expiresAt) {
      return {
        access_token: token.accessToken,
        token_type: 'Bearer',
        expires_at: token.expiresAt,
      };
    }

    return { error: 'invalid_grant' };
  }

  // 发放令牌 - 客户端凭证模式
  private issueTokenWithClientCredentialsGrant(body: any) {
    const { client_id: clientId, client_secret: clientSecret } = body;

    const token =
      this.clientCredentialsService.issueTokenWithClientCredentialsGrant(
        clientId,
        clientSecret,
      );
    console.log('===issueTokenWithClientCredentialsGrant===', token);

    if (token && token.accessToken && token.expiresAt) {
      return {
        access_token: token.accessToken,
        token_type: 'Bearer',
        expires_at: token.expiresAt,
      };
    }

    return { error: 'invalid_client' };
  }
}
