const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
  console.log(JSON.stringify(ta));
}

main().catch(console.error).finally(() => prisma.$disconnect());
