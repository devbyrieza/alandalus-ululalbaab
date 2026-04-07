import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Normalizing Gender data in DB...');

  // Normalize Laki-laki -> L
  const resultL = await prisma.pendaftar.updateMany({
    where: {
      OR: [
        { jenis_kelamin: 'Laki-laki' },
        { jenis_kelamin: 'laki-laki' },
        { jenis_kelamin: 'LAKI-LAKI' }
      ]
    },
    data: {
      jenis_kelamin: 'L'
    }
  });

  // Normalize Perempuan -> P
  const resultP = await prisma.pendaftar.updateMany({
    where: {
      OR: [
        { jenis_kelamin: 'Perempuan' },
        { jenis_kelamin: 'perempuan' },
        { jenis_kelamin: 'PEREMPUAN' }
      ]
    },
    data: {
      jenis_kelamin: 'P'
    }
  });

  console.log(`✅ Normalized ${resultL.count} Male records to 'L'`);
  console.log(`✅ Normalized ${resultP.count} Female records to 'P'`);
  
  // Optional: check for any other weird values
  const remaining = await prisma.pendaftar.groupBy({
    by: ['jenis_kelamin'],
    _count: { id: true },
    where: {
      NOT: [
        { jenis_kelamin: 'L' },
        { jenis_kelamin: 'P' }
      ]
    }
  });

  if (remaining.length > 0) {
    console.log('⚠️ Warning: Some weird values still exist:');
    console.table(remaining);
  } else {
    console.log('✨ All gender data is now consistent (L/P).');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
