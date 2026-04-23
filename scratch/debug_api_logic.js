const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// SYNCED LOGIC from list/route.ts
const filterMapping = {
    belum_bayar: ["draft"],
    menunggu_verifikasi_pembayaran: ["payment_verification"],
    sudah_bayar: ["paid", "data_completed", "docs_uploaded", "docs_verified", "scheduled", "exam_scheduled", "testing", "exam_completed", "tested", "announced", "accepted", "enrolled"],
    pembayaran_ditolak: ["payment_rejected"],
    belum_isi_data: ["paid"],
    sudah_isi_data: ["data_completed", "docs_uploaded", "docs_verified", "scheduled", "exam_scheduled", "testing", "exam_completed", "tested", "announced", "accepted", "enrolled"],
    belum_upload_dokumen: ["data_completed"],
    menunggu_verifikasi_dokumen: ["docs_uploaded"],
    dokumen_terverifikasi: ["docs_verified", "scheduled", "exam_scheduled", "testing", "exam_completed", "tested", "announced", "accepted", "enrolled"],
    dokumen_ditolak: ["docs_rejected"],
    terjadwal_ujian: ["scheduled", "exam_scheduled", "testing"],
    belum_ujian: ["draft", "paid", "data_completed", "docs_uploaded", "docs_verified", "scheduled", "exam_scheduled", "testing"],
    sudah_ujian: ["exam_completed", "tested", "announced", "accepted", "enrolled"],
    hasil_ujian: ["announced", "accepted", "enrolled"],
    diterima: ["accepted", "enrolled"],
    belum_daftar_ulang: ["accepted"],
    sudah_daftar_ulang: ["enrolled"],
    cadangan: ["cadangan"],
    ditolak: ["ditolak"]
};

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
  if (tahunAjaranId) where.tahun_ajaran_id = tahunAjaranId;
  return where;
}

async function debug() {
  const status = "belum_ujian";
  const jenjang = "MTs";
  const jenisKelamin = "P";
  const tahunAjaran = ""; // "Semua Tahun Ajaran"

  const baseWhere = getAdminWhereClause(tahunAjaran || undefined);
  const where = { ...baseWhere };

  if (status) {
    const dbStatuses = filterMapping[status];
    if (dbStatuses) {
      where.status_pendaftaran = { in: dbStatuses };
    } else {
      where.status_pendaftaran = status;
    }
  }

  if (jenjang) {
    where.jenjang = { contains: jenjang, mode: "insensitive" };
  }
  if (jenisKelamin) {
    where.jenis_kelamin = { contains: jenisKelamin, mode: "insensitive" };
  }

  console.log('Final Where Clause:', JSON.stringify(where, null, 2));

  const count = await prisma.pendaftar.count({ where });
  console.log('Count:', count);

  const samples = await prisma.pendaftar.findMany({
    where,
    take: 5,
    select: { nama_lengkap: true, status_pendaftaran: true }
  });
  console.log('Samples:', samples);
}

debug().catch(console.error).finally(() => prisma.$disconnect());
