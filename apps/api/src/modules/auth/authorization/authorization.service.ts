import { Injectable } from '@nestjs/common';
import type {
  AuthorizationContext,
  AuthorizationDecisionRecord,
} from './authorization.types';
import {
  DefaultAuthorizationPolicy,
  type AuthorizationPolicy,
} from './authorization.policy';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly policy: AuthorizationPolicy = new DefaultAuthorizationPolicy(),
  ) {}

  evaluate(context: AuthorizationContext): AuthorizationDecisionRecord {
    return this.policy.evaluate(context);
  }
}