import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5432/db_ululalbaab_prod"
    }
  }
});

async function findProd() {
  try {
    const pendaftars = await prisma.pendaftar.findMany({
      where: {
        OR: [
          { nama_lengkap: { contains: "Nahla", mode: "insensitive" } },
          { nama_lengkap: { contains: "Iklimah", mode: "insensitive" } }
        ]
      },
      take: 1
    });
    console.log(JSON.stringify(pendaftars, null, 2));
  } catch (e) {
    console.error("Failed on port 5432");
  }
}

findProd().finally(() => prisma.$disconnect());
