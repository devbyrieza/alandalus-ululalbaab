const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const statsIL = await prisma.pendaftar.groupBy({
    by: ['status_pendaftaran'],
    where: {
      jenis_kelamin: 'P',
      jenjang: 'IL'
    },
    _count: true
  });
  console.log('Stats for Putri IL:', statsIL);
}

main().catch(console.error).finally(() => prisma.$disconnect());
