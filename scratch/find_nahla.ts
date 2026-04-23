import { prisma } from "../src/lib/prisma";

async function findNahla() {
  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: "Nahla"
      }
    },
    select: {
      nomor_pendaftaran: true,
      nama_lengkap: true
    }
  });

  console.log(JSON.stringify(pendaftars, null, 2));
}

findNahla().finally(() => prisma.$disconnect());
