export type AuthorizationAction =
  | 'read'
  | 'create'
  | 'update'
  | 'cancel'
  | 'archive'
  | 'delete'
  | 'execute';

export type AuthorizationDecision = 'allow' | 'deny';

export type AuthorizationResourceState =
  | 'active'
  | 'archived'
  | 'cancelled';

export type AuthorizationResource = {
  type: string;
  id: string;
  ownerSubject?: string;
  organizationId?: string;
  state?: AuthorizationResourceState;
};

export type AuthorizationContext = {
  principal: {
    subject: string;
    roles: readonly string[];
    scopes: readonly string[];
  };
  action: AuthorizationAction;
  resource: AuthorizationResource;
};

export type AuthorizationDecisionRecord = {
  decision: AuthorizationDecision;
  reason: string;
  actorSubject: string;
  action: AuthorizationAction;
  resourceType: string;
  resourceId: string;
  organizationId?: string;
  resourceState?: AuthorizationResourceState;
};