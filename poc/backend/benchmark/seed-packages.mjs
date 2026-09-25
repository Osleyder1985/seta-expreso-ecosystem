import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [countArg, connectionString] = process.argv.slice(2);
const count = Number(countArg);
if (!Number.isInteger(count) || count < 1 || !connectionString) {
  throw new Error('Usage: node seed-packages.mjs <count> <databaseUrl>');
}

const benchmarkDir = path.dirname(fileURLToPath(import.meta.url));
const nestjsPackageJson = path.join(benchmarkDir, '..', 'nestjs', 'package.json');
const require = createRequire(nestjsPackageJson);
const { Client } = require('pg');

const client = new Client({ connectionString });
await client.connect();

const ids = [];
try {
  await client.query('BEGIN');
  for (let i = 0; i < count; i++) {
    const result = await client.query(
      'INSERT INTO packages(house,weight_kg,recipient_address) VALUES($1,$2,$3) RETURNING id',
      [`BENCH-${i}`, 1.25, `Benchmark address ${i}`]
    );
    ids.push(result.rows[0].id);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}

process.stdout.write(JSON.stringify(ids));
