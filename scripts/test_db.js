const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    select: { id: true, nama_lengkap: true, nomor_pendaftaran: true, jenjang: true }
  });
  console.log('Total pendaftar:', pendaftars.length);
  pendaftars.forEach(p => console.log(`[${p.nomor_pendaftaran}] ${p.nama_lengkap} (${p.jenjang})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
