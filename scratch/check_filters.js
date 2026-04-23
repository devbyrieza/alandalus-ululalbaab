const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const jenjanga = await prisma.pendaftar.findMany({
    distinct: ['jenjang'],
    select: { jenjang: true }
  });
  console.log('Distinct Jenjang:', jenjanga);

  const genders = await prisma.pendaftar.findMany({
    distinct: ['jenis_kelamin'],
    select: { jenis_kelamin: true }
  });
  console.log('Distinct Genders:', genders);
  
  const countP = await prisma.pendaftar.count({
    where: { jenis_kelamin: 'P' }
  });
  console.log('Count Gender P:', countP);

  const countEnrolled = await prisma.pendaftar.count({
    where: { status_pendaftaran: 'enrolled' }
  });
  console.log('Count Enrolled:', countEnrolled);
}

check().catch(console.error).finally(() => prisma.$disconnect());
