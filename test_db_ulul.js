const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://admin_ulul:password123@127.0.0.1:5435/db_ululalbaab_migrasi" }
  }
});
async function run() {
  const count = await prisma.pendaftar.count();
  console.log('Pendaftar count Ulul Albaab:', count);
}
run().then(()=>prisma.$disconnect()).catch(e=>{console.error(e); prisma.$disconnect();});
