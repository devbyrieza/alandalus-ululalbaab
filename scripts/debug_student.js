const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: {
      OR: [
        { nomor_pendaftaran: { contains: "SMA2700004" } },
        { nama_lengkap: { contains: "Muhammad", mode: "insensitive" } }
      ]
    },
    include: {
      jadwal_ujian: {
        include: { exam_session: true, nilai_ujian: true }
      },
      nilai_ujian: true
    }
  });

  console.log("Pendaftar:", {
    id: pendaftar?.id,
    nomor_pendaftaran: pendaftar?.nomor_pendaftaran,
    nama_lengkap: pendaftar?.nama_lengkap,
    status_pendaftaran: pendaftar?.status_pendaftaran,
    jenjang: pendaftar?.jenjang,
    jenis_kelamin: pendaftar?.jenis_kelamin,
    tahun_ajaran_id: pendaftar?.tahun_ajaran_id,
  });

  console.log("Booked Jadwal count:", pendaftar?.jadwal_ujian?.length);
  pendaftar?.jadwal_ujian?.forEach(j => {
    console.log("- Jadwal:", j.id, j.exam_session?.title, j.tanggal_ujian);
  });

  // Now let's simulate the query from undangan-seleksi route for this pendaftar
  const availableSessions = await prisma.examSession.findMany({
    where: {
      is_active: true,
      start_time: { gte: new Date() }
    },
    include: {
      _count: { select: { bookings: true } }
    },
    orderBy: { start_time: "asc" }
  });

  console.log("Available sessions from DB:", availableSessions.length);
  if (availableSessions.length > 0) {
    console.log("Sample session 1:", availableSessions[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
