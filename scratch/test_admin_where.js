const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock from src/lib/utils/admin.ts
function getAdminWhereClause(tahunAjaranId) {
  const where = {
    deleted_at: null,
    NOT: [
      {
        AND: [
          { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
          { NOT: { nama_lengkap: { contains: "Rieza Tes", mode: "insensitive" } } }
        ]
      },
      { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
      { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
    ]
  };

  if (tahunAjaranId) {
    where.tahun_ajaran_id = tahunAjaranId;
  }

  return where;
}

async function test() {
  const where = getAdminWhereClause();
  
  // Try to find ANY Putri MTS Enrolled with this where clause
  const finalWhere = {
      ...where,
      jenis_kelamin: { contains: 'P', mode: 'insensitive' },
      jenjang: { contains: 'MTS', mode: 'insensitive' },
      status_pendaftaran: 'enrolled'
  };
  
  console.log('Query Where:', JSON.stringify(finalWhere, null, 2));

  const p = await prisma.pendaftar.findMany({
    where: finalWhere,
    take: 10,
    select: { nama_lengkap: true }
  });
  
  console.log('Results:', p);
  console.log('Count:', p.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
