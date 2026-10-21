const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ULUL ALBAAB DB INSPECTION ===');
  const taList = await prisma.tahunAjaran.findMany();
  console.log('Tahun Ajaran:', taList.map(t => ({ id: t.id, nama: t.nama, is_active: t.is_active })));
  
  const totalSessions = await prisma.examSession.count();
  console.log('Total Sessions in DB:', totalSessions);
  
  const recentSessions = await prisma.examSession.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  });
  console.log('Recent 5 Sessions:', recentSessions);

  const allProfiles = await prisma.profile.findMany({
    select: { id: true, full_name: true, role: true, email: true, phone: true, jenis_kelamin: true, google_meet_link: true }
  });
  console.log(`Total Profiles in DB: ${allProfiles.length}`);
  console.log('Sample/All Profiles:', allProfiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
