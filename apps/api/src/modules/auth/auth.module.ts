import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { OidcAuthGuard } from './guards/oidc-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OidcTokenVerifier } from './oidc/oidc-token-verifier';
import { AuthController } from './auth.controller';
import { AuthorizationService } from './authorization/authorization.service';

@Module({
  controllers: [AuthController],
  providers: [
    OidcTokenVerifier,
    AuthorizationService,
    { provide: APP_GUARD, useClass: OidcAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [OidcTokenVerifier, AuthorizationService],
})
export class AuthModule {}
