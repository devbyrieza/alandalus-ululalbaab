const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const counts = await prisma.pendaftar.groupBy({
    by: ['jenjang', 'jenis_kelamin'],
    _count: true
  });
  console.log('Counts by Jenjang/Gender:', JSON.stringify(counts, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
