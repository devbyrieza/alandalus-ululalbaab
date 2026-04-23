import { prisma } from "../src/lib/prisma";

async function listAll() {
  const pendaftars = await prisma.pendaftar.findMany({
    take: 20,
    select: {
      nomor_pendaftaran: true,
      nama_lengkap: true,
      jenis_kelamin: true,
      jenjang: true
    }
  });

  console.log(JSON.stringify(pendaftars, null, 2));
}

listAll().finally(() => prisma.$disconnect());
