const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const genders = await prisma.pendaftar.findMany({
    distinct: ['jenis_kelamin'],
    select: { jenis_kelamin: true }
  });
  console.log('Unique genders:', genders);

  const statuses = await prisma.pendaftar.findMany({
    distinct: ['status_pendaftaran'],
    select: { status_pendaftaran: true }
  });
  console.log('Unique statuses:', statuses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
