import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5436/db_ululalbaab_prod"
    }
  }
});

async function findProd() {
  const pendaftars = await prisma.pendaftar.findMany({
    where: {
      OR: [
        { nama_lengkap: { contains: "Nahla", mode: "insensitive" } },
        { nama_lengkap: { contains: "Iklimah", mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
      jenjang: true,
      jenis_kelamin: true
    }
  });

  console.log(JSON.stringify(pendaftars, null, 2));
}

findProd().finally(() => prisma.$disconnect());
