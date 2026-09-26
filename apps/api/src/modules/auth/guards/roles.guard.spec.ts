import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { REQUIRED_ROLES_KEY } from './roles.decorator';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  it('allows a principal with every required role', () => {
    reflector.getAllAndOverride = jest.fn((key: string) =>
      key === REQUIRED_ROLES_KEY ? ['operator', 'manifest:read'] : undefined,
    );
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['operator', 'manifest:read'] } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a principal missing a required role', () => {
    reflector.getAllAndOverride = jest.fn((key: string) =>
      key === REQUIRED_ROLES_KEY ? ['admin'] : undefined,
    );
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['operator'] } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
