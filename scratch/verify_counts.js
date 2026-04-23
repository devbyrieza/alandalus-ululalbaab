const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.pendaftar.count({
    where: {
      jenis_kelamin: 'P',
      jenjang: 'MTS'
    }
  });
  console.log('Count of Putri MTs:', result);

  const stats = await prisma.pendaftar.groupBy({
    by: ['status_pendaftaran'],
    where: {
      jenis_kelamin: 'P',
      jenjang: 'MTS'
    },
    _count: true
  });
  console.log('Stats for Putri MTs:', stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
