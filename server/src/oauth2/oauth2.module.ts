import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
import { OAuth2Controller } from './oauth2.controller';
import { OAuth2Service } from './auth/oauth2.service';
import { AuthorizationCodeService } from './auth/authorization-code.service';
import { PasswordService } from './auth/password.service';
import { ClientCredentialsService } from './auth/client-credentials.service';
import { ImplicitService } from './auth/implicit.service';

@Module({
  controllers: [OAuth2Controller],
  providers: [
    OAuth2Service,
    AuthorizationCodeService,
    PasswordService,
    ClientCredentialsService,
    ImplicitService,
  ],
})
export class OAuth2Module {}
