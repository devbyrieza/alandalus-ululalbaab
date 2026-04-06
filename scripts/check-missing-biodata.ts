/**
 * CEK PENDAFTAR YANG BIODATA-NYA MASIH KOSONG
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  const missing = await prisma.pendaftar.findMany({
    where: {
      OR: [
        { tempat_lahir: null },
        { tanggal_lahir: null },
      ],
    },
    select: {
      nomor_pendaftaran: true,
      nik: true,
      nama_lengkap: true,
      jenjang: true,
      tempat_lahir: true,
      tanggal_lahir: true,
      created_at: true,
    },
    orderBy: { nomor_pendaftaran: 'asc' },
  });

  console.log(`\n📋 PENDAFTAR DENGAN BIODATA TIDAK LENGKAP: ${missing.length} orang\n`);
  console.log('No | Nomor Daftar | Nama Lengkap                        | Jenjang | NIK              | Tgl Daftar');
  console.log('-'.repeat(110));

  missing.forEach((p, i) => {
    const tgl = p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-';
    const nama = p.nama_lengkap.padEnd(35).substring(0, 35);
    console.log(`${String(i+1).padStart(2)} | ${p.nomor_pendaftaran.padEnd(12)} | ${nama} | ${(p.jenjang || '-').padEnd(7)} | ${p.nik.padEnd(16)} | ${tgl}`);
  });

  console.log('-'.repeat(110));
  console.log(`\nTotal: ${missing.length} pendaftar\n`);
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
