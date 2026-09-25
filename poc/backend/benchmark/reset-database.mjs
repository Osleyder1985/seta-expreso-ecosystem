import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const benchmarkDir = path.dirname(fileURLToPath(import.meta.url));
const nestjsPackageJson = path.join(benchmarkDir, '..', 'nestjs', 'package.json');
const require = createRequire(nestjsPackageJson);
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');

const client = new Client({ connectionString });
await client.connect();

try {
  await client.query('TRUNCATE TABLE packages RESTART IDENTITY CASCADE');
} finally {
  await client.end();
}
