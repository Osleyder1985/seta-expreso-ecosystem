import { DefaultAuthorizationPolicy } from './authorization.policy';

describe('DefaultAuthorizationPolicy', () => {
  const policy = new DefaultAuthorizationPolicy();

  const base = {
    principal: {
      subject: 'operator-1',
      roles: ['operator'],
      scopes: [],
    },
    action: 'read' as const,
    resource: {
      type: 'House',
      id: 'house-1',
      ownerSubject: 'operator-1',
      organizationId: 'org-1',
      state: 'active' as const,
    },
  };

  it('allows an operator to access an owned active resource', () => {
    expect(policy.evaluate(base)).toMatchObject({
      decision: 'allow',
      reason: 'RESOURCE_OWNER_OPERATOR',
    });
  });

  it('denies an operator accessing another subject-owned resource', () => {
    expect(policy.evaluate({
      ...base,
      resource: { ...base.resource, ownerSubject: 'operator-2' },
    })).toMatchObject({
      decision: 'deny',
      reason: 'RESOURCE_OWNERSHIP_OR_ROLE_REQUIRED',
    });
  });

  it('denies mutation of an archived resource', () => {
    expect(policy.evaluate({
      ...base,
      action: 'update',
      resource: { ...base.resource, state: 'archived' },
    })).toMatchObject({
      decision: 'deny',
      reason: 'ARCHIVED_RESOURCE_IMMUTABLE',
    });
  });

  it('allows admin access without treating admin as resource ownership', () => {
    expect(policy.evaluate({
      ...base,
      principal: { ...base.principal, subject: 'admin-1', roles: ['admin'] },
      resource: { ...base.resource, ownerSubject: 'operator-1' },
    })).toMatchObject({
      decision: 'allow',
      reason: 'ROLE_ADMIN',
    });
  });

  it('does not silently allow a resource whose ownership is unresolved', () => {
    expect(policy.evaluate({
      ...base,
      resource: { ...base.resource, ownerSubject: undefined },
    })).toMatchObject({
      decision: 'deny',
      reason: 'RESOURCE_OWNERSHIP_UNRESOLVED',
    });
  });
});