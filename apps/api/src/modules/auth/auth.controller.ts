import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from './guards/roles.decorator';
import type { AuthPrincipal } from './auth.types';

type AuthenticatedRequest = Request & { user?: AuthPrincipal };

@Controller('auth')
export class AuthController {
  @Get('me')
  @Roles('operator')
  me(@Req() request: AuthenticatedRequest): AuthPrincipal {
    return request.user!;
  }
}
