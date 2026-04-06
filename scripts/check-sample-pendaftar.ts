/**
 * CEK SATU DATA PENDAFTAR SECARA LENGKAP
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  // Ambil profil yang memiliki data lengkap (tempat lahir & tanggal lahir tidak null)
  const sample = await prisma.pendaftar.findFirst({
    where: {
      tempat_lahir: { not: null },
      tanggal_lahir: { not: null },
      orang_tua: { isNot: null }
    },
    include: {
      orang_tua: true
    }
  });

  if (sample) {
    console.log("=== DATA PENDAFTAR ===");
    console.log(`Nama Lengkap   : ${sample.nama_lengkap}`);
    console.log(`No. Pendaftaran: ${sample.nomor_pendaftaran}`);
    console.log(`Tempat Lahir   : ${sample.tempat_lahir}`);
    console.log(`Tanggal Lahir  : ${sample.tanggal_lahir}`);
    console.log(`Alamat Lengkap : ${sample.alamat?.substring(0,50)}...`);
    console.log(`Provinsi       : ${sample.provinsi}`);
    
    console.log("\n=== DATA ORANG TUA ===");
    console.log(`Nama Ayah      : ${sample.orang_tua?.nama_ayah || '-'}`);
    console.log(`Pekerjaan Ayah : ${sample.orang_tua?.pekerjaan_ayah || '-'}`);
    console.log(`Nama Ibu       : ${sample.orang_tua?.nama_ibu || '-'}`);
    console.log(`No HP Ayah     : ${sample.orang_tua?.no_hp_ayah || '-'}`);
  } else {
    console.log("Tidak ada data lengkap ditemukan.");
  }
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
