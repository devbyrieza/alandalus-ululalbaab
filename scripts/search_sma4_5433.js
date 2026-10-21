const { PrismaClient } = require('@prisma/client');

async function checkDb(dbName) {
  const url = `postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@127.0.0.1:5433/${dbName}`;
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const res = await p.$queryRawUnsafe("SELECT id, nomor_pendaftaran, nama_lengkap, jenjang FROM pendaftar WHERE nomor_pendaftaran = 'SMA2700004'");
    console.log(`[${dbName}] result:`, res);
  } catch (e) {
    console.log(`[${dbName}] error:`, e.message);
  } finally {
    await p.$disconnect();
  }
}

async function main() {
  await checkDb('ppdb_putra');
  await checkDb('ppdb_putri');
  await checkDb('ppdb_alimam');
}

main();
