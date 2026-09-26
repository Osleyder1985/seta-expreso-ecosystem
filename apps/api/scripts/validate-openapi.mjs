import { readFile } from 'node:fs/promises';
import { validate } from '@scalar/openapi-validator';

const path = new URL('../../../docs/api/openapi.json', import.meta.url);
const document = JSON.parse(await readFile(path, 'utf8'));

if (document.openapi !== '3.1.0') {
  throw new Error('Expected OpenAPI 3.1.0, received ' + document.openapi);
}

const result = validate(document);
if (!result.valid) {
  console.error(JSON.stringify(result.errors, null, 2));
  process.exit(1);
}

const paths = Object.keys(document.paths ?? {});
const requiredPaths = ['/api/health', '/api/auth/me', '/api/auth/admin-probe'];
for (const path of requiredPaths) {
  if (!paths.includes(path)) throw new Error('Missing documented path: ' + path);
}

const me = document.paths['/api/auth/me']?.get;
const adminProbe = document.paths['/api/auth/admin-probe']?.get;
for (const [name, operation] of [['/api/auth/me', me], ['/api/auth/admin-probe', adminProbe]]) {
  const security = operation?.security;
  if (!Array.isArray(security) || !security.some((entry) => entry?.bearerAuth)) {
    throw new Error('Missing bearerAuth security requirement: ' + name);
  }
}

const health = document.paths['/api/health']?.get;
if (Array.isArray(health?.security) && health.security.length > 0) {
  throw new Error('Health endpoint must remain public in the OpenAPI contract');
}

console.log(JSON.stringify({
  protocol: 'openapi-validation-v2',
  openapi: document.openapi,
  schema: 'PASS',
  requiredPaths: 'PASS',
  security: 'PASS',
}));
