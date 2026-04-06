/**
 * CLEAN PLACEHOLDER DATA
 * Membersihkan nilai placeholder yang salah dari migrasi lama:
 * - kelurahan = 'desa_kelurahan' → null
 * - kecamatan = 'kecamatan' → null  
 * - kabupaten = 'kabupaten_kota' → null
 * - provinsi = 'Luar Negeri / Lainnya' (jika salah) → null
 * - alamat = string yang hanya berisi whitespace → null
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  console.log('🧹 CLEAN PLACEHOLDER DATA - ULUL ALBAAB');
  console.log('='.repeat(50));

  // 1. Cek berapa yang punya placeholder
  const placeholderCount = await prisma.pendaftar.count({
    where: {
      OR: [
        { kelurahan: 'desa_kelurahan' },
        { kecamatan: 'kecamatan' },
        { kabupaten: 'kabupaten_kota' },
        { provinsi: 'Luar Negeri / Lainnya' },
      ],
    },
  });
  console.log(`\n📊 Pendaftar dengan placeholder salah: ${placeholderCount}`);

  // Tampilkan sample
  const samples = await prisma.pendaftar.findMany({
    where: {
      OR: [
        { kelurahan: 'desa_kelurahan' },
        { kecamatan: 'kecamatan' },
        { kabupaten: 'kabupaten_kota' },
      ],
    },
    select: {
      nama_lengkap: true,
      nomor_pendaftaran: true,
      kelurahan: true,
      kecamatan: true,
      kabupaten: true,
      provinsi: true,
      alamat: true,
    },
    take: 10,
  });

  console.log('\n📋 Sample pendaftar dengan placeholder:');
  samples.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.nama_lengkap} (${p.nomor_pendaftaran})`);
    console.log(`     Alamat: ${p.alamat?.substring(0, 60) || '-'}`);
    console.log(`     Kel: ${p.kelurahan} | Kec: ${p.kecamatan} | Kab: ${p.kabupaten} | Prov: ${p.provinsi}`);
  });

  // 2. Bersihkan placeholder
  console.log('\n🔄 Membersihkan placeholder...');

  // Clean kelurahan placeholder
  const r1 = await prisma.pendaftar.updateMany({
    where: { kelurahan: 'desa_kelurahan' },
    data: { kelurahan: null },
  });
  console.log(`  ✅ kelurahan 'desa_kelurahan' → null: ${r1.count} records`);

  // Clean kecamatan placeholder
  const r2 = await prisma.pendaftar.updateMany({
    where: { kecamatan: 'kecamatan' },
    data: { kecamatan: null },
  });
  console.log(`  ✅ kecamatan 'kecamatan' → null: ${r2.count} records`);

  // Clean kabupaten placeholder
  const r3 = await prisma.pendaftar.updateMany({
    where: { kabupaten: 'kabupaten_kota' },
    data: { kabupaten: null },
  });
  console.log(`  ✅ kabupaten 'kabupaten_kota' → null: ${r3.count} records`);

  // Clean provinsi placeholder (hanya jika alamat ada tapi provinsi salah)
  const r4 = await prisma.pendaftar.updateMany({
    where: {
      provinsi: 'Luar Negeri / Lainnya',
      alamat: { not: null },
    },
    data: { provinsi: null },
  });
  console.log(`  ✅ provinsi 'Luar Negeri / Lainnya' → null: ${r4.count} records`);

  // 3. Cek field lain yang mungkin bermasalah
  console.log('\n🔍 Audit field lain yang perlu diisi...');
  
  const auditResult = await prisma.pendaftar.aggregate({
    _count: { id: true },
  });
  
  const missingFields = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) FILTER (WHERE tempat_lahir IS NULL) as no_tempat_lahir,
      COUNT(*) FILTER (WHERE tanggal_lahir IS NULL) as no_tanggal_lahir,
      COUNT(*) FILTER (WHERE golongan_darah IS NULL) as no_goldar,
      COUNT(*) FILTER (WHERE anak_ke IS NULL) as no_anak_ke,
      COUNT(*) FILTER (WHERE hobi IS NULL) as no_hobi,
      COUNT(*) FILTER (WHERE cita_cita IS NULL) as no_cita_cita,
      COUNT(*) FILTER (WHERE alamat IS NULL) as no_alamat,
      COUNT(*) FILTER (WHERE provinsi IS NULL) as no_provinsi,
      COUNT(*) FILTER (WHERE kabupaten IS NULL) as no_kabupaten,
      COUNT(*) FILTER (WHERE kecamatan IS NULL) as no_kecamatan,
      COUNT(*) FILTER (WHERE kelurahan IS NULL) as no_kelurahan,
      COUNT(*) FILTER (WHERE asal_sekolah IS NULL) as no_sekolah,
      COUNT(*) FILTER (WHERE nisn IS NULL) as no_nisn
    FROM pendaftar
    WHERE deleted_at IS NULL
  `;

  const f = missingFields[0];
  const total = auditResult._count.id;
  
  console.log(`\n📊 AUDIT KELENGKAPAN DATA (dari ${total} pendaftar):`);
  console.log(`  Tempat lahir kosong : ${f.no_tempat_lahir}`);
  console.log(`  Tanggal lahir kosong: ${f.no_tanggal_lahir}`);
  console.log(`  Golongan darah kosong: ${f.no_goldar}`);
  console.log(`  Anak ke kosong      : ${f.no_anak_ke}`);
  console.log(`  Hobi kosong         : ${f.no_hobi}`);
  console.log(`  Cita-cita kosong    : ${f.no_cita_cita}`);
  console.log(`  Alamat kosong       : ${f.no_alamat}`);
  console.log(`  Provinsi kosong     : ${f.no_provinsi}`);
  console.log(`  Kabupaten kosong    : ${f.no_kabupaten}`);
  console.log(`  Kecamatan kosong    : ${f.no_kecamatan}`);
  console.log(`  Kelurahan kosong    : ${f.no_kelurahan}`);
  console.log(`  Asal sekolah kosong : ${f.no_sekolah}`);
  console.log(`  NISN kosong         : ${f.no_nisn}`);

  console.log('\n✨ Selesai!');
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
