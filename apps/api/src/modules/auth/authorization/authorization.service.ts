import { Injectable } from '@nestjs/common';
import type {
  AuthorizationContext,
  AuthorizationDecisionRecord,
} from './authorization.types';
import { DefaultAuthorizationPolicy } from './authorization.policy';

@Injectable()
export class AuthorizationService {
  private readonly policy = new DefaultAuthorizationPolicy();

  evaluate(context: AuthorizationContext): AuthorizationDecisionRecord {
    return this.policy.evaluate(context);
  }
}
