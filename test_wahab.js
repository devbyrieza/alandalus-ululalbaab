const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst({
    where: { username: 'wahabrajasam' }
  });
  console.log(profile);
}

main().catch(console.error).finally(() => prisma.$disconnect());
