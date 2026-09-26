import pg from 'pg';
const { Client } = pg;
const app = new Client({ connectionString: process.env.APP_DATABASE_URL });
await app.connect();
await app.query('SELECT 1');
const privileges = await app.query("SELECT privilege_type FROM information_schema.role_table_grants WHERE grantee = current_user AND table_schema = 'public' AND table_name = 'Manifest'");
const granted = new Set(privileges.rows.map((r) => r.privilege_type));
for (const required of ['SELECT', 'INSERT', 'UPDATE', 'DELETE']) {
  if (!granted.has(required)) throw new Error('Missing runtime privilege: ' + required);
}
if (granted.has('TRUNCATE')) throw new Error('Runtime role unexpectedly has TRUNCATE');
await app.end();
console.log(JSON.stringify({ protocol: 'postgres-least-privilege-v1', runtimeDml: 'PASS', truncateDeniedByGrantModel: 'PASS' }));
