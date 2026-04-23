
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Deep Audit ---');
  
  // Check active TA
  const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
  console.log('Active TA:', activeTA?.id, activeTA?.nama);

  // Check Clarisa specifically
  const clarisa = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Clarisa', mode: 'insensitive' } },
    select: {
      id: true,
      nama_lengkap: true,
      status_pendaftaran: true,
      jenjang: true,
      jenis_kelamin: true,
      tahun_ajaran_id: true,
      deleted_at: true
    }
  });
  console.log('Clarisa Detail:', JSON.stringify(clarisa, null, 2));

  // Check total matches for currently selected filters in screenshot
  const screenshotFilters = {
    deleted_at: null,
    status_pendaftaran: 'enrolled',
    jenjang: { contains: 'MTs', mode: 'insensitive' },
    jenis_kelamin: { contains: 'P', mode: 'insensitive' },
    tahun_ajaran_id: activeTA?.id,
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

  const count = await prisma.pendaftar.count({ where: screenshotFilters as any });
  console.log('Screenshot Filters Count:', count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
