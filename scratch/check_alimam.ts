
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking for potential Al-Imam records in Ulul-Albaab DB ---');
  
  const jenjangCounts = await prisma.pendaftar.groupBy({
    by: ['jenjang'],
    _count: { _all: true },
    where: { deleted_at: null }
  });
  console.log('Jenjang counts in Ulul-Albaab:', JSON.stringify(jenjangCounts, null, 2));

  const potentialAlImam = await prisma.pendaftar.findMany({
    where: {
      deleted_at: null,
      OR: [
        { jenjang: { contains: 'SMA', mode: 'insensitive' } },
        { jenjang: { contains: 'Takhassus', mode: 'insensitive' } },
        { jenjang: { contains: 'Imam', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      nama_lengkap: true,
      jenjang: true,
      nomor_pendaftaran: true
    }
  });

  console.log('Potential Al-Imam records found:', potentialAlImam.length);
  if (potentialAlImam.length > 0) {
      console.log('Sample potential Al-Imam records:', JSON.stringify(potentialAlImam.slice(0, 5), null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
