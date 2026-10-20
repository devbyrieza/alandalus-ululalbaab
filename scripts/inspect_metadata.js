const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const ta = await prisma.tahunAjaran.findMany();
  console.log('Tahun Ajaran:', ta.map(t => ({ id: t.id, nama: t.nama, is_active: t.is_active })));

  const profiles = await prisma.profile.findMany({
    where: { role: { not: 'pendaftar' } },
    select: { id: true, full_name: true, role: true, email: true }
  });
  console.log('Staff profiles:', profiles);
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
