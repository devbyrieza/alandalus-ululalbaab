const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const statuses = await prisma.pendaftar.groupBy({
    by: ['status_pendaftaran'],
    _count: true
  });
  console.log('Status Distribution:', JSON.stringify(statuses, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
