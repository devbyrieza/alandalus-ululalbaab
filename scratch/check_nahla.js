const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { 
      nama_lengkap: { contains: 'Nahla', mode: 'insensitive' } 
    },
    include: { 
      pembayaran: true,
      whatsapp_logs: {
        orderBy: { created_at: 'desc' },
        take: 5
      }
    }
  });

  console.log(JSON.stringify(pendaftar, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
