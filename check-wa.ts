const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.whatsappLog.findMany({
    where: {
      jenis_notif: 'registration_success',
    },
    orderBy: { created_at: 'desc' },
    take: 10
  });

  console.log("Latest registration_success logs:");
  logs.forEach(l => {
    console.log(`- ID: ${l.id} | Phone: ${l.phone} | Status: ${l.status} | Err: ${l.error_message} | Attempt: ${l.attempt_count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
