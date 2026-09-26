import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

export const OPENAPI_SPEC_VERSION = '3.1.0';
export const OPENAPI_DOCUMENT_VERSION = '0.1.0';

export function buildOpenApiConfig() {
  return new DocumentBuilder()
    .setOpenAPIVersion(OPENAPI_SPEC_VERSION)
    .setTitle('SETA EXPRESO SURL API')
    .setDescription(
      'Controlled HTTP API contract for the SETA EXPRESO ecosystem. The contract reflects only implemented endpoints; Paquetería endpoints are added when their executable implementation is integrated.',
    )
    .setVersion(OPENAPI_DOCUMENT_VERSION)
    .addTag('Health', 'Operational health endpoints')
    .addTag('Auth', 'OIDC/RBAC identity endpoints')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearerAuth',
    )
    .build();
}

export function createOpenApiDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, buildOpenApiConfig());
}
