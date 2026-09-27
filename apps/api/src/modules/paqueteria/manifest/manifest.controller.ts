import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthPrincipal } from '../../auth/auth.types';
import { CreateManifestDto, ManifestIdParamDto, UpdateManifestDto } from './manifest.dto';
import { ManifestService } from './manifest.service';

type AuthenticatedRequest = Request & { user?: AuthPrincipal };

@ApiTags('Paquetería / Manifest')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: 'Authentication required or token rejected.' })
@ApiForbiddenResponse({ description: 'Authenticated principal is not authorized for the requested operation.' })
@Controller('paqueteria/manifests')
export class ManifestController {
  constructor(private readonly manifests: ManifestService) {}

  @Get()
  @ApiOperation({ summary: 'List manifests in the caller scope' })
  @ApiOkResponse({ description: 'Authorized manifests.' })
  list(@Req() request: AuthenticatedRequest) {
    return this.manifests.list(request.user!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a manifest by identifier' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Manifest returned when accessible.' })
  @ApiNotFoundResponse({ description: 'Manifest does not exist or is not visible to the caller.' })
  get(
    @Param() params: ManifestIdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.manifests.get(params.id, request.user!);
  }

  @Post()
  @ApiOperation({ summary: 'Create an owned manifest' })
  @ApiOkResponse({ description: 'Manifest created.' })
  create(
    @Body() dto: CreateManifestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.manifests.create(request.user!, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update or archive an owned manifest' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Manifest updated.' })
  @ApiNotFoundResponse({ description: 'Manifest does not exist.' })
  update(
    @Param() params: ManifestIdParamDto,
    @Body() dto: UpdateManifestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.manifests.update(params.id, request.user!, dto);
  }
}
