
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const arkas = await prisma.pendaftar.findMany({
    where: { nama_lengkap: { contains: 'Arka', mode: 'insensitive' } },
    include: { nilai_ujian: true }
  });
  
  for (const arka of arkas) {
      if (arka && arka.nilai_ujian.length > 0) {
        console.log("Resetting Nilai Wawancara Santri for " + arka.nama_lengkap);
        await prisma.nilaiUjian.update({
          where: { id: arka.nilai_ujian[0].id },
          data: {
            nilai_wawancara_santri: null,
            score_wawancara: null,
            total_score: null,
            nilai_total: null,
            status_kelulusan: "BELUM LENGKAP"
          }
        });
        console.log("Reset successful.");
      }
      // Set status_pendaftaran back to tested
      await prisma.pendaftar.update({
          where: { id: arka.id },
          data: { status_pendaftaran: 'tested' }
      });
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
