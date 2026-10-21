const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5436/db_ululalbaab_prod"
    }
  }
});

async function main() {
  const sessionsCount = await prisma.examSession.count();
  const futureSessionsCount = await prisma.examSession.count({
    where: { is_active: true, start_time: { gte: new Date() } }
  });
  console.log("PROD ExamSessions total:", sessionsCount);
  console.log("PROD Future active sessions:", futureSessionsCount);

  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: "SMA2700004" },
    include: {
      jadwal_ujian: {
        include: { exam_session: true }
      },
      nilai_ujian: true
    }
  });

  if (!pendaftar) {
    console.log("Pendaftar SMA2700004 NOT FOUND in PROD!");
  } else {
    console.log("Pendaftar found in PROD:", {
      id: pendaftar.id,
      nama: pendaftar.nama_lengkap,
      nomor: pendaftar.nomor_pendaftaran,
      jenjang: pendaftar.jenjang,
      status: pendaftar.status_pendaftaran,
      jadwal_ujian_count: pendaftar.jadwal_ujian.length,
      jadwal_ujian: pendaftar.jadwal_ujian.map(j => ({
        id: j.id,
        jenis_ujian: j.jenis_ujian,
        session_title: j.exam_session?.title,
        created_at: j.created_at
      })),
      nilai_ujian: pendaftar.nilai_ujian.map(n => ({
        id: n.id,
        score_quran: n.nilai_tes_quran,
        score_santri: n.nilai_wawancara_santri,
        score_ortu: n.nilai_wawancara_ortu,
        detail_quran: n.detail_quran,
        detail_wawancara: n.detail_wawancara,
        detail_cawalsan: n.detail_cawalsan
      }))
    });
  }

  // Also sample some exam sessions in prod
  const sampleSessions = await prisma.examSession.findMany({
    take: 5,
    orderBy: { start_time: 'desc' }
  });
  console.log("PROD Sample Sessions:", sampleSessions);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
