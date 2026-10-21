const { PrismaClient } = require('@prisma/client');

async function checkDatabases(port, user, pass, initialDb) {
  const url = `postgresql://${user}:${pass}@127.0.0.1:${port}/${initialDb}`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const dbs = await prisma.$queryRawUnsafe('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log(`Port ${port} databases:`, dbs.map(d => d.datname));
    for (const d of dbs) {
      const dbUrl = `postgresql://${user}:${pass}@127.0.0.1:${port}/${d.datname}`;
      const pDb = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      try {
        const pendaftar = await pDb.$queryRawUnsafe("SELECT id, nomor_pendaftaran, nama_lengkap FROM pendaftar WHERE nomor_pendaftaran LIKE '%27%' OR nomor_pendaftaran LIKE '%SMA%'");
        if (pendaftar && pendaftar.length > 0) {
          console.log(`FOUND IN Port ${port} / DB ${d.datname}:`, pendaftar);
        }
      } catch (e) {
        // table might not exist
      } finally {
        await pDb.$disconnect();
      }
    }
  } catch (err) {
    console.log(`Port ${port} error:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await checkDatabases(5435, 'admin_ulul', 'password123', 'db_ululalbaab_migrasi');
  await checkDatabases(5433, 'postgres', 'nhzYTBmfqk8RUhOoYHmvkbzoN2OhN', 'ppdb_alimam');
  await checkDatabases(5432, 'postgres', 'nhzYTBmfqk8RUhOoYHmvkbzoN2OhN', 'postgres');
}

main();
