// 1.授权码模式 (Authorization Code Grant)
// src/oauth2/authorization-code.service.ts

import { Injectable } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthorizationCodeService {
  private readonly secretKey = 'your-secret-key';
  private readonly encryptionKey = this.generateEncryptionKey(this.secretKey);
  private readonly algorithm = 'aes-256-cbc';

  constructor(private readonly oauth2Service: OAuth2Service) {}

  // 生成并加密授权码
  generateAuthorizationCode(
    clientId: string,
    redirectUri: string,
    userId: string,
  ): string {
    const code = this.generateRandomCode();
    const authorizationCode = {
      clientId,
      redirectUri,
      userId,
      expiresAt: new Date(Date.now() + 600000), // 10 minutes
    };

    const encryptedCode = this.encryptAuthorizationCode(
      code,
      authorizationCode,
    );

    // 使用未加密的授权码作为键值存储
    this.oauth2Service.storeAuthorizationCode(code, authorizationCode);
    return encryptedCode;
  }

  // 解密并获取token
  exchangeAuthorizationCodeForToken(encryptedCode: string): any {
    const decryptedCode = this.decryptAuthorizationCode(encryptedCode);

    const token =
      this.oauth2Service.exchangeAuthorizationCodeForToken(decryptedCode);

    console.log('获取exchangeAuthorizationCodeForToken', token);
    if (token && new Date(token.expires_at) > new Date()) {
      this.oauth2Service.invalidateAuthorizationCode(decryptedCode);
      return token;
    }

    return null;
  }

  // 生成随机授权码
  private generateRandomCode(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // 加密授权码
  private encryptAuthorizationCode(
    code: string,
    authorizationCode: any,
  ): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey),
      iv,
    );

    let encryptedCode = cipher.update(code, 'utf8', 'hex');
    encryptedCode += cipher.final('hex');
    encryptedCode = `${iv.toString('hex')}:${encryptedCode}`;
    console.log('加密code', code, encryptedCode);
    return encryptedCode;
  }

  // 解密授权码
  private decryptAuthorizationCode(encryptedCode: string): string {
    const [ivHex, encryptedCodeHex] = encryptedCode.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    console.log('解密code', ivHex, encryptedCodeHex, encryptedCode);
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey),
      iv,
    );
    let decryptedCode = decipher.update(encryptedCodeHex, 'hex', 'utf8');
    decryptedCode += decipher.final('utf8');
    console.log('解密code', encryptedCode, decryptedCode);
    return decryptedCode;
  }

  // 生成密钥
  private generateEncryptionKey(secretKey: string): string {
    // 这里使用 SHA-256 哈希函数来生成 32 字节的密钥
    const hash = crypto.createHash('sha256').update(secretKey).digest();
    const copiedBuf = Uint8Array.prototype.slice.call(hash);
    const encryptionKey = copiedBuf.toString('hex').slice(0, 32);
    // 048af2438891a89a3536ac09cc96ccbd
    console.log('generateEncryptionKey', secretKey, encryptionKey);
    return encryptionKey;
  }
}
