import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Arka' } },
    include: { dokumen: true }
  });
  console.log(JSON.stringify(p, null, 2));
}
main();
