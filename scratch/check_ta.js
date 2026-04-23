const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tas = await prisma.pendaftar.findMany({
    distinct: ['tahun_ajaran_id'],
    select: { tahun_ajaran_id: true }
  });
  console.log('Distinct TA IDs in Pendaftar:', JSON.stringify(tas, null, 2));

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { is_active: true }
  });
  console.log('Active TA in DB:', JSON.stringify(activeTA, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
