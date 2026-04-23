import { prisma } from "../src/lib/prisma";

async function checkNomors() {
  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      nomor_pendaftaran: {
        in: ["MTA2600001", "MTI2600001", "MTA2600002", "MTI2600002"]
      }
    },
    select: {
      nomor_pendaftaran: true,
      nama_lengkap: true,
      jenis_kelamin: true,
      jenjang: true
    }
  });

  console.log(JSON.stringify(pendaftars, null, 2));
}

checkNomors().finally(() => prisma.$disconnect());
