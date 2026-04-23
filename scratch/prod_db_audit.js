const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- PRODUCTION DB AUDIT (via .env) ---');
  
  const totalRaw = await prisma.pendaftar.count();
  console.log('Total Pendaftar (including deleted/tests):', totalRaw);

  const notDeleted = await prisma.pendaftar.count({
    where: { deleted_at: null }
  });
  console.log('Not Deleted (deleted_at is null):', notDeleted);

  const statusCounts = await prisma.pendaftar.groupBy({
    by: ['status_pendaftaran'],
    _count: true
  });
  console.log('Status Distribution:', JSON.stringify(statusCounts, null, 2));

  const jenjangCounts = await prisma.pendaftar.groupBy({
    by: ['jenjang'],
    _count: true
  });
  console.log('Jenjang Distribution:', JSON.stringify(jenjangCounts, null, 2));

  // Check for the "filtering out" conditions
  const tests = await prisma.pendaftar.count({
    where: {
      OR: [
        { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
        { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
        { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
      ]
    }
  });
  console.log('Records matching "Tes/Test/Bypass" filters:', tests);

  // Sample data to see what we are missing
  const samples = await prisma.pendaftar.findMany({
    take: 10,
    orderBy: { created_at: 'desc' },
    select: { nama_lengkap: true, status_pendaftaran: true, deleted_at: true, jenjang: true }
  });
  console.log('Recent 10 Samples:', JSON.stringify(samples, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
