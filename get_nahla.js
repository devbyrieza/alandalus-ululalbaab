const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Nahla Ajwa' } },
    include: {
      nilai_ujian: true,
    }
  });
  console.dir(pendaftar, { depth: null });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
