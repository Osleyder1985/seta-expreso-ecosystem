import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from './guards/roles.decorator';
import type { AuthPrincipal } from './auth.types';

type AuthenticatedRequest = Request & { user?: AuthPrincipal };

@ApiTags('Auth')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: 'Authentication required or access token rejected.' })
@ApiForbiddenResponse({ description: 'Authenticated principal lacks the required role.' })
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Return the authenticated principal' })
  @ApiOkResponse({ description: 'Authenticated principal.', schema: { type: 'object', required: ['subject', 'roles', 'scopes', 'claims'], properties: { subject: { type: 'string' }, username: { type: 'string' }, roles: { type: 'array', items: { type: 'string' } }, scopes: { type: 'array', items: { type: 'string' } }, claims: { type: 'object', additionalProperties: true } } } })
  @Get('me')
  @Roles('operator')
  me(@Req() request: AuthenticatedRequest): AuthPrincipal {
    return request.user!;
  }

  @ApiOperation({ summary: 'Verify administrative authorization' })
  @ApiOkResponse({ description: 'Administrative authorization accepted.', schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['ok'] } } } })
  @Get('admin-probe')
  @Roles('admin')
  adminProbe(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
