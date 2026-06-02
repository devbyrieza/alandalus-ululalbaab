import { PrismaClient } from '@prisma/client';
import { recalculateNilaiUjian } from './src/lib/scoring.js';

const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Nahla Ajwa' } }
  });
  
  if (!pendaftar) {
    console.log("Pendaftar not found");
    return;
  }
  console.log("Found:", pendaftar.nama_lengkap, pendaftar.id);
  
  const result = await recalculateNilaiUjian(pendaftar.id);
  console.log("Recalculate result:");
  console.dir(result, { depth: null });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
