import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { buildOpenApiConfig } from '../src/openapi';

describe('OpenAPI contract', () => {
  it('generates an OpenAPI 3.1 document for every implemented route', async () => {
    process.env.NODE_ENV = 'test';
    const app = await NestFactory.create(AppModule, { logger: false });
    const document = SwaggerModule.createDocument(app, buildOpenApiConfig());

    expect(document.openapi).toBe('3.1.0');
    expect(document.paths['/api/health']?.get).toBeDefined();
    expect(document.paths['/api/auth/me']?.get).toBeDefined();
    expect(document.paths['/api/auth/admin-probe']?.get).toBeDefined();
    expect(document.paths['/api/auth/me']?.get?.security).toEqual([{ bearerAuth: [] }]);
    expect(document.paths['/api/auth/admin-probe']?.get?.security).toEqual([{ bearerAuth: [] }]);

    await app.close();
  });
});
