import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    where: { nomor_pendaftaran: { contains: '2600001' } },
    select: { id: true, nama_lengkap: true, nomor_pendaftaran: true, status_pendaftaran: true }
  });

  console.log('Results:', JSON.stringify(pendaftars, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
