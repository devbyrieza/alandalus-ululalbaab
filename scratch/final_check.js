const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.pendaftar.count({
    where: {
      jenis_kelamin: 'P',
      jenjang: { in: ['MTS', 'MTs'] },
      status_pendaftaran: 'enrolled',
      deleted_at: null
    }
  });
  console.log('Final Count for Putri MTs Enrolled:', count);
}

check().catch(console.error).finally(() => prisma.$disconnect());
