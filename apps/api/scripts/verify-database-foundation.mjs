import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

const extension = await client.query("SELECT extversion FROM pg_extension WHERE extname = 'postgis'");
const spatial = await client.query("SELECT postgis_typmod_dims(a.atttypmod) AS dims, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_attribute a WHERE a.attrelid = 'public."Geolocation"'::regclass AND a.attname = 'location' AND NOT a.attisdropped");
const index = await client.query("SELECT indexname FROM pg_indexes WHERE indexname = 'Geolocation_location_gist_idx'");
const tables = await client.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Manifest','House','PhysicalUnit','Geolocation','Delivery','DeliveryHouse','AuditRecord')");

if (extension.rowCount !== 1) throw new Error('PostGIS extension is not installed');
if (Number(spatial.rows[0].dims) !== 2 || Number(spatial.rows[0].srid) !== 4326 || spatial.rows[0].type !== 'Point') throw new Error('PostGIS geography(Point,4326) policy is incorrect');
if (index.rowCount !== 1) throw new Error('Geolocation GiST index is missing');
if (Number(tables.rows[0].count) !== 7) throw new Error('Expected persistence foundation tables are missing');

console.log(JSON.stringify({
  protocol: 'postgres-postgis-foundation-v1',
  postgis: 'PASS',
  geography4326: 'PASS',
  spatialIndex: 'PASS',
  coreTables: 'PASS'
}));

await client.end();
