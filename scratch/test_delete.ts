import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDelete() {
  const targetId = "602d33be-512c-4977-bc6d-062828b61c47"; // ID for IMAN SETIAWAN (I found it from previous list or I'll search for it)
  
  // Find IMAN SETIAWAN first
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: "IMAN SETIAWAN" },
    include: {
        tahun_ajaran: true,
        orang_tua: true,
        dokumen: true,
        pembayaran: true,
        jadwal_ujian: true,
        nilai_ujian: true,
        pengumuman: true,
        rapor: true,
        prestasi: true,
        kesehatan: true,
        asrama: true,
        hasil_seleksi: true,
        reservasi: true,
        whatsapp_logs: true,
    }
  });

  if (!pendaftar) {
    console.log("Pendaftar not found");
    return;
  }

  console.log("Found pendaftar:", pendaftar.nama_lengkap);

  try {
    const result = await prisma.$transaction([
      prisma.pendaftarBackup.create({
        data: {
          pendaftar_id: pendaftar.id,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nama_lengkap: pendaftar.nama_lengkap,
          backup_data: JSON.parse(JSON.stringify(pendaftar)),
          deleted_by: null, // Simulate null for now
          deleted_by_name: "Test Script",
        },
      }),
      prisma.pendaftar.update({
        where: { id: pendaftar.id },
        data: {
          deleted_at: new Date(),
          deleted_by: null,
          updated_at: new Date(),
        },
      }),
    ]);
    console.log("Soft delete successful");
  } catch (err) {
    console.error("Error in transaction:", err);
  }
}

testDelete().finally(() => prisma.$disconnect());
