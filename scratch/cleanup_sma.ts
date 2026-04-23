
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up SMA records from Ulul-Albaab DB ---');
  
  const deleted = await prisma.pendaftar.deleteMany({
    where: {
      OR: [
        { jenjang: { equals: 'SMA', mode: 'insensitive' } },
        { jenjang: { startsWith: 'SMA ', mode: 'insensitive' } },
        { jenjang: { equals: 'SMI', mode: 'insensitive' } } // SMI is mentioned as SMA Putri prefix
      ]
    }
  });

  console.log(`Successfully deleted ${deleted.count} SMA records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
