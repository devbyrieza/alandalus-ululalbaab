const { Client } = require('pg');

const urls = [
  'postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi',
  'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/ppdb_alimam',
  'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/siakad_alimam',
  'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5432/ppdb_alandalus',
  'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5432/ppdb_andalus',
  'postgresql://admin_ulul:password123@127.0.0.1:5435/postgres',
  'postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/postgres',
];

async function check() {
  for (const url of urls) {
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      // list databases on this server
      const dbRes = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
      console.log(`\nServer connected (${url.split('@')[1]}): DBs:`, dbRes.rows.map(r => r.datname));
      await client.end();
    } catch (e) {
      // ignore
    }
  }
}

check();
