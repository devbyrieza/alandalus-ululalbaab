const { PrismaClient } = require('@prisma/client');

async function check(url) {
  const prisma = new PrismaClient({
    datasourceUrl: url
  });
  try {
    const res = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false;`;
    console.log("Success with", url);
    console.log("Databases:", res.map(r => r.datname));
  } catch(e) {
    console.log("Failed", url, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await check("postgresql://postgres:postgres@localhost:5432/postgres");
  await check("postgresql://admin_ulul:password123@localhost:5432/postgres");
  await check("postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5432/postgres");
  await check("postgresql://admin_ulul:password123@localhost:5435/db_ululalbaab_migrasi");
  await check("postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi");
}
run();
