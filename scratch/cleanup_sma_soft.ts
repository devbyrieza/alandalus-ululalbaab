
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Soft-deleting SMA records from Ulul-Albaab DB ---');
  
  const updated = await prisma.pendaftar.updateMany({
    where: {
      deleted_at: null,
      OR: [
        { jenjang: { equals: 'SMA', mode: 'insensitive' } },
        { jenjang: { startsWith: 'SMA ', mode: 'insensitive' } },
        { jenjang: { equals: 'SMI', mode: 'insensitive' } }
      ]
    },
    data: {
      deleted_at: new Date()
    }
  });

  console.log(`Successfully soft-deleted ${updated.count} SMA records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
