import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5432/db_ululalbaab_migrasi",
    },
  },
});

async function run() {
  const dbs =
    await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false;`;
  console.log("Databases on 72.61.141.50:5432 ->", dbs);
}
run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
