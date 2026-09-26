import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const marker = process.env.BACKUP_RESTORE_MARKER ?? 'backup-restore-ci-probe';
await client.query('CREATE TABLE IF NOT EXISTS public._backup_restore_probe (id text primary key, created_at timestamptz not null default now())');

if (process.env.BACKUP_RESTORE_SEED === 'true') {
  await client.query('INSERT INTO public._backup_restore_probe(id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [marker]);
}

const result = await client.query('SELECT id FROM public._backup_restore_probe WHERE id = $1', [marker]);
if (result.rowCount !== 1) throw new Error('Backup/restore probe is missing: ' + marker);

console.log(JSON.stringify({
  protocol: 'postgres-backup-restore-probe-v1',
  marker,
  probe: 'PASS'
}));

await client.end();
