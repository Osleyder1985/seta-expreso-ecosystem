import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');

const client = new Client({ connectionString });
await client.connect();

try {
  await client.query('TRUNCATE TABLE packages RESTART IDENTITY CASCADE');
} finally {
  await client.end();
}
