import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    take: 20,
    select: {
      nama_lengkap: true,
      jenis_kelamin: true,
    }
  });

  console.log('Sample Gender Data:');
  console.table(pendaftars);

  const genderCounts = await prisma.pendaftar.groupBy({
    by: ['jenis_kelamin'],
    _count: {
      id: true
    }
  });

  console.log('Gender Counts:');
  console.table(genderCounts);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
