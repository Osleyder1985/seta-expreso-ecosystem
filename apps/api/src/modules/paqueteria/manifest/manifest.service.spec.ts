import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ManifestService } from './manifest.service';

describe('ManifestService contextual authorization', () => {
  const principal = (subject: string, roles = ['operator']) => ({
    subject,
    roles,
    scopes: [],
    claims: {},
  });

  const manifest = {
    id: '11111111-1111-4111-8111-111111111111',
    sourceFileName: 'manifest.xlsx',
    sourceSha256: 'a'.repeat(64),
    sourceImportedAt: new Date(),
    externalReference: null,
    status: 'IMPORTED',
    ownerSubject: 'operator-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function service() {
    const prisma = {
      manifest: {
        findUnique: jest.fn().mockResolvedValue(manifest),
        findMany: jest.fn(),
        create: jest.fn().mockResolvedValue(manifest),
        update: jest.fn().mockResolvedValue(manifest),
      },
      auditRecord: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const authorization = {
      evaluate: jest.fn((context: any) => ({
        decision:
          context.principal.subject === context.resource.ownerSubject ||
          context.principal.roles.includes('admin')
            ? 'allow'
            : 'deny',
        reason:
          context.principal.subject === context.resource.ownerSubject
            ? 'RESOURCE_OWNER_OPERATOR'
            : 'RESOURCE_OWNERSHIP_OR_ROLE_REQUIRED',
        actorSubject: context.principal.subject,
        action: context.action,
        resourceType: context.resource.type,
        resourceId: context.resource.id,
      })),
    };
    return {
      instance: new ManifestService(prisma as never, authorization as never),
      prisma,
      authorization,
    };
  }

  it('allows the owner to read the manifest', async () => {
    const { instance } = service();
    await expect(instance.get(manifest.id, principal('operator-1'))).resolves.toMatchObject({
      id: manifest.id,
    });
  });

  it('blocks a different operator from reading another owner manifest', async () => {
    const { instance } = service();
    await expect(instance.get(manifest.id, principal('operator-2'))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('blocks a different operator from updating another owner manifest', async () => {
    const { instance } = service();
    await expect(
      instance.update(manifest.id, principal('operator-2'), { externalReference: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks mutation after archival through the authorization contract', async () => {
    const { instance, prisma } = service();
    prisma.manifest.findUnique.mockResolvedValueOnce({ ...manifest, status: 'ARCHIVED' });
    await expect(
      instance.update(manifest.id, principal('operator-1'), { externalReference: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.manifest.update).not.toHaveBeenCalled();
  });

  it('creates ownership from the authenticated subject, never from client input', async () => {
    const { instance, prisma } = service();
    await instance.create(principal('operator-9'), {
      sourceFileName: 'manifest.xlsx',
      sourceSha256: 'a'.repeat(64),
    });
    expect(prisma.manifest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ownerSubject: 'operator-9' }),
      }),
    );
  });
});
