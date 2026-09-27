import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthorizationService } from '../../auth/authorization/authorization.service';
import type { AuthPrincipal } from '../../auth/auth.types';
import type { AuthorizationAction, AuthorizationDecisionRecord } from '../../auth/authorization/authorization.types';
import type { CreateManifestDto, UpdateManifestDto } from './manifest.dto';

@Injectable()
export class ManifestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async list(principal: AuthPrincipal) {
    const decision = this.authorization.evaluate({
      principal: { subject: principal.subject, roles: principal.roles, scopes: principal.scopes },
      action: 'read',
      resource: { type: 'ManifestCollection', id: 'collection', ownerSubject: principal.subject, state: 'active' },
    });
    await this.audit({
      actorSubject: decision.actorSubject,
      action: decision.action,
      resourceType: decision.resourceType,
      resourceId: decision.resourceId,
      outcome: decision.decision,
      reason: decision.reason,
    });
    if (decision.decision !== 'allow') {
      throw new ForbiddenException('Manifest listing is not authorized');
    }
    const isAdmin = principal.roles.includes('admin');
    return this.prisma.manifest.findMany({
      where: isAdmin ? undefined : { ownerSubject: principal.subject },
      orderBy: { createdAt: 'desc' },
      select: this.selection(),
    });
  }

  async get(id: string, principal: AuthPrincipal) {
    const manifest = await this.prisma.manifest.findUnique({
      where: { id },
      select: this.selection(),
    });
    if (!manifest) throw new NotFoundException('Manifest not found');

    const decision = await this.authorize(principal, 'read', manifest);
    if (decision.decision !== 'allow') {
      throw new NotFoundException('Manifest not found');
    }
    return manifest;
  }

  async create(principal: AuthPrincipal, dto: CreateManifestDto) {
    const decision = this.authorization.evaluate({
      principal: { subject: principal.subject, roles: principal.roles, scopes: principal.scopes },
      action: 'create',
      resource: { type: 'Manifest', id: 'new', ownerSubject: principal.subject, state: 'active' },
    });
    await this.audit({
      actorSubject: decision.actorSubject,
      action: decision.action,
      resourceType: decision.resourceType,
      resourceId: decision.resourceId,
      outcome: decision.decision,
      reason: decision.reason,
    });
    if (decision.decision !== 'allow') {
      throw new ForbiddenException('Manifest creation is not authorized');
    }

    const manifest = await this.prisma.manifest.create({
      data: {
        sourceFileName: dto.sourceFileName,
        sourceSha256: dto.sourceSha256,
        externalReference: dto.externalReference,
        ownerSubject: principal.subject,
        status: 'IMPORTED',
      },
      select: this.selection(),
    });

    await this.audit({
      actorSubject: principal.subject,
      action: 'create',
      resourceType: 'Manifest',
      resourceId: manifest.id,
      outcome: 'allow',
      reason: 'RESOURCE_CREATED_WITH_AUTHENTICATED_OWNER',
    });
    return manifest;
  }

  async update(id: string, principal: AuthPrincipal, dto: UpdateManifestDto) {
    const manifest = await this.prisma.manifest.findUnique({
      where: { id },
      select: this.selection(),
    });
    if (!manifest) throw new NotFoundException('Manifest not found');

    const action: AuthorizationAction =
      dto.status === 'ARCHIVED' ? 'archive' : 'update';
    const decision = await this.authorize(principal, action, manifest);
    if (decision.decision !== 'allow') {
      throw new ForbiddenException('Manifest operation is not authorized');
    }

    const updated = await this.prisma.manifest.update({
      where: { id },
      data: {
        ...(dto.externalReference !== undefined
          ? { externalReference: dto.externalReference }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      select: this.selection(),
    });

    return updated;
  }

  private async authorize(
    principal: AuthPrincipal,
    action: AuthorizationAction,
    manifest: { id: string; ownerSubject: string | null; status: string },
  ): Promise<AuthorizationDecisionRecord> {
    const resourceState =
      manifest.status === 'ARCHIVED'
        ? 'archived'
        : manifest.status === 'CANCELLED'
          ? 'cancelled'
          : 'active';

    const decision = this.authorization.evaluate({
      principal: {
        subject: principal.subject,
        roles: principal.roles,
        scopes: principal.scopes,
      },
      action,
      resource: {
        type: 'Manifest',
        id: manifest.id,
        ownerSubject: manifest.ownerSubject ?? undefined,
        state: resourceState,
      },
    });

    await this.audit({
      actorSubject: decision.actorSubject,
      action: decision.action,
      resourceType: decision.resourceType,
      resourceId: decision.resourceId,
      outcome: decision.decision,
      reason: decision.reason,
    });
    return decision;
  }

  private async audit(input: {
    actorSubject: string;
    action: string;
    resourceType: string;
    resourceId: string;
    outcome: string;
    reason: string;
  }): Promise<void> {
    try {
      await this.prisma.auditRecord.create({ data: input });
    } catch {
      throw new InternalServerErrorException(
        'Authorization audit could not be persisted',
      );
    }
  }

  private selection() {
    return {
      id: true,
      sourceFileName: true,
      sourceSha256: true,
      sourceImportedAt: true,
      externalReference: true,
      status: true,
      ownerSubject: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}
