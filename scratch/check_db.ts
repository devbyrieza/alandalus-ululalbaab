import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.pendaftar.count();
  console.log('Total Pendaftar:', count);
  
  const latest = await prisma.pendaftar.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    select: { id: true, nama_lengkap: true, nomor_pendaftaran: true }
  });
  
  console.log('Latest 5:', JSON.stringify(latest, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
