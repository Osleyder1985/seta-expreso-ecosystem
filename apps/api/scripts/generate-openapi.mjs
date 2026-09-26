import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV ??= 'test';

const { NestFactory } = await import('@nestjs/core');
const { AppModule } = await import('../dist/app.module.js');
const { createOpenApiDocument } = await import('../dist/openapi.js');

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api');
const document = createOpenApiDocument(app);

const output = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs/api/openapi.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(document, null, 2) + String.fromCharCode(10), 'utf8');

await app.close();
console.log(JSON.stringify({ protocol: 'openapi-generation-v1', openapi: document.openapi, paths: Object.keys(document.paths).length, output }));
