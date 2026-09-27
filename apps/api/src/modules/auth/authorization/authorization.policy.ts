import type {
  AuthorizationContext,
  AuthorizationDecisionRecord,
} from './authorization.types';

export interface AuthorizationPolicy {
  evaluate(context: AuthorizationContext): AuthorizationDecisionRecord;
}

const hasRole = (context: AuthorizationContext, role: string): boolean =>
  context.principal.roles.includes(role);

export class DefaultAuthorizationPolicy implements AuthorizationPolicy {
  evaluate(context: AuthorizationContext): AuthorizationDecisionRecord {
    const base = {
      actorSubject: context.principal.subject,
      action: context.action,
      resourceType: context.resource.type,
      resourceId: context.resource.id,
      organizationId: context.resource.organizationId,
      resourceState: context.resource.state,
    };

    if (context.resource.state === 'archived' &&
        ['update', 'cancel', 'delete', 'archive'].includes(context.action)) {
      return {
        ...base,
        decision: 'deny',
        reason: 'ARCHIVED_RESOURCE_IMMUTABLE',
      };
    }

    if (hasRole(context, 'admin')) {
      return {
        ...base,
        decision: 'allow',
        reason: 'ROLE_ADMIN',
      };
    }

    if (context.resource.ownerSubject &&
        context.resource.ownerSubject === context.principal.subject &&
        hasRole(context, 'operator')) {
      return {
        ...base,
        decision: 'allow',
        reason: 'RESOURCE_OWNER_OPERATOR',
      };
    }

    return {
      ...base,
      decision: 'deny',
      reason: context.resource.ownerSubject
        ? 'RESOURCE_OWNERSHIP_OR_ROLE_REQUIRED'
        : 'RESOURCE_OWNERSHIP_UNRESOLVED',
    };
  }
}