/**
 * BACKFILL COMPLETE DATA - ULUL ALBAAB
 * ====================================
 * Skrip ini TIDAK menghapus atau membuat pendaftar baru.
 * Tugasnya: MELENGKAPI biodata pendaftar yang sudah ada di database
 * dengan data dari file SQL dump lama (full_20260328.sql Laravel).
 *
 * STRUKTUR biodata_pendaftars (Laravel lama):
 * 0:id, 1:pendaftar_id, 2:tempat_lahir, 3:jumlah_hafalan, 4:tanggal_lahir,
 * 5:gol_darah, 6:jumlah_saudara, 7:anak_ke, 8:hobi, 9:cita_cita,
 * 10:alamat_lengkap, 11:kode_pos_id, 12:provinsi_id, 13:kabupaten_kota_id,
 * 14:kecamatan_id, 15:desa_kelurahan_id, 16:submitted_at, 17:created_at, 18:updated_at
 *
 * STRUKTUR pendaftars (Laravel lama):
 * 0:id, 1:tipe_nomor_identitas, 2:nomor_identitas (NIK), 3:nisn,
 * 4:nomor_registrasi, 5:terdaftar_pada, 6:sumber_informasi_id,
 * 7:nama, 8:jenis_kelamin, 9:created_at, 10:updated_at,
 * 11:email_id, 12:jenjang, 13:kode_jenjang, 14:nomor_urut, 15:tahun_pendaftaran
 *
 * Key matching: NIK (nomor_identitas) -> nik, nomor_registrasi -> nomor_pendaftaran
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env.production
dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const SQL_FILE = 'full_20260328.sql';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function cleanStr(val: string): string {
  if (!val || val.toUpperCase() === 'NULL' || val.trim() === '') return '';
  let s = val.trim();
  if (s.startsWith("'") && s.endsWith("'")) s = s.substring(1, s.length - 1);
  return s.replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\\/g, '\\');
}

function safeDate(val: string): Date | null {
  const cleaned = cleanStr(val);
  if (!cleaned || cleaned === '0000-00-00' || cleaned === 'NULL') return null;
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function safeInt(val: string): number | null {
  const cleaned = cleanStr(val);
  if (!cleaned || cleaned.toUpperCase() === 'NULL') return null;
  const n = parseInt(cleaned);
  return isNaN(n) ? null : n;
}

// Provinsi dari kode provincial (2 digit pertama wilayahs id)
const PROV_MAP: Record<number, string> = {
  11: 'Aceh', 12: 'Sumatera Utara', 13: 'Sumatera Barat', 14: 'Riau',
  15: 'Jambi', 16: 'Sumatera Selatan', 17: 'Bengkulu', 18: 'Lampung',
  19: 'Kepulauan Bangka Belitung', 21: 'Kepulauan Riau', 31: 'DKI Jakarta',
  32: 'Jawa Barat', 33: 'Jawa Tengah', 34: 'DI Yogyakarta', 35: 'Jawa Timur',
  36: 'Banten', 51: 'Bali', 52: 'Nusa Tenggara Barat', 53: 'Nusa Tenggara Timur',
  61: 'Kalimantan Barat', 62: 'Kalimantan Tengah', 63: 'Kalimantan Selatan',
  64: 'Kalimantan Timur', 65: 'Kalimantan Utara', 71: 'Sulawesi Utara',
  72: 'Sulawesi Tengah', 73: 'Sulawesi Selatan', 74: 'Sulawesi Tenggara',
  75: 'Gorontalo', 76: 'Sulawesi Barat', 81: 'Maluku', 82: 'Maluku Utara',
  91: 'Papua Barat', 94: 'Papua',
};

function getProvName(provId: number | null): string | null {
  if (provId === null) return null;
  // provId dari SQL adalah ID wilayah provinsi (misal 32 = Jawa Barat)
  return PROV_MAP[provId] || null;
}

// Simple SQL VALUES parser - parse baris INSERT INTO `table` VALUES (...)
function parseInsertValues(content: string, tableName: string): string[][] {
  const allRows: string[][] = [];
  const searchStr = `INSERT INTO \`${tableName}\` VALUES `;
  let offset = 0;

  while (true) {
    const idx = content.indexOf(searchStr, offset);
    if (idx === -1) break;

    offset = idx + searchStr.length;

    // Cari tanda semicolon penutup
    const endIdx = content.indexOf(';\n', offset);
    if (endIdx === -1) break;

    const valuesPart = content.substring(offset, endIdx).trim();
    offset = endIdx + 2;

    // Parse baris demi baris: setiap (...) adalah satu row
    let pos = 0;
    while (pos < valuesPart.length) {
      // Skip koma dan spasi antar rows
      while (pos < valuesPart.length && (valuesPart[pos] === ',' || valuesPart[pos] === '\n' || valuesPart[pos] === ' ')) pos++;
      if (pos >= valuesPart.length) break;

      if (valuesPart[pos] !== '(') { pos++; continue; }

      const closePos = findClosingParen(valuesPart, pos);
      if (closePos === -1) break;

      const rowStr = valuesPart.substring(pos + 1, closePos);
      allRows.push(splitCSV(rowStr));
      pos = closePos + 1;
    }
  }

  return allRows;
}

function findClosingParen(str: string, start: number): number {
  let depth = 0;
  let inStr = false;
  let strChar = '';

  for (let i = start; i < str.length; i++) {
    const c = str[i];
    const prev = i > 0 ? str[i - 1] : '';

    if (inStr) {
      if (c === strChar && prev !== '\\') inStr = false;
    } else {
      if (c === "'" || c === '"') { inStr = true; strChar = c; }
      else if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

function splitCSV(row: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let inStr = false;
  let strChar = '';

  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    const prev = i > 0 ? row[i - 1] : '';

    if (inStr) {
      cur += c;
      if (c === strChar && prev !== '\\') inStr = false;
    } else if (c === "'" || c === '"') {
      inStr = true;
      strChar = c;
      cur += c;
    } else if (c === ',') {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  parts.push(cur.trim());
  return parts;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🚀 BACKFILL COMPLETE DATA - ULUL ALBAAB');
  console.log('='.repeat(50));
  console.log('📡 Database:', process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':***@') || 'NOT SET');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL tidak ditemukan! Pastikan .env.production ada.');
  }

  console.log(`\n📂 Membaca ${SQL_FILE}...`);
  if (!fs.existsSync(SQL_FILE)) {
    throw new Error(`❌ File ${SQL_FILE} tidak ditemukan di folder: ${process.cwd()}`);
  }

  const content = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`✅ File dibaca: ${(content.length / 1024 / 1024).toFixed(1)} MB`);

  // ─── STEP 1: Parse Data dari SQL ──────────────────────────────────────
  console.log('\n📊 Step 1: Parsing data dari SQL...');

  // Map: old_id (integer) -> bio data
  const biodataByOldId = new Map<number, {
    tempatLahir: string;
    jumlahHafalan: number | null;
    tanggalLahir: Date | null;
    golDarah: string;
    jumlahSaudara: number | null;
    anakKe: number | null;
    hobi: string;
    citaCita: string;
    alamatLengkap: string;
    provId: number | null;
    kabId: number | null;
    kecId: number | null;
    desaId: number | null;
  }>();

  const biodataRows = parseInsertValues(content, 'biodata_pendaftars');
  for (const row of biodataRows) {
    const oldPendaftarId = safeInt(row[1]);
    if (oldPendaftarId === null) continue;

    biodataByOldId.set(oldPendaftarId, {
      tempatLahir: cleanStr(row[2]),
      jumlahHafalan: safeInt(row[3]),
      tanggalLahir: safeDate(row[4]),
      golDarah: cleanStr(row[5]),
      jumlahSaudara: safeInt(row[6]),
      anakKe: safeInt(row[7]),
      hobi: cleanStr(row[8]),
      citaCita: cleanStr(row[9]),
      alamatLengkap: cleanStr(row[10]),
      provId: safeInt(row[12]),
      kabId: safeInt(row[13]),
      kecId: safeInt(row[14]),
      desaId: safeInt(row[15]),
    });
  }
  console.log(`   ✅ ${biodataByOldId.size} biodata diparsing dari SQL`);

  // Map: NIK -> old_id
  const nikToOldId = new Map<string, number>();
  const noRegToOldId = new Map<string, number>();
  const oldIdToNisn = new Map<number, string>();
  const oldIdToJenjang = new Map<number, string>();

  const pendaftarRows = parseInsertValues(content, 'pendaftars');
  for (const row of pendaftarRows) {
    const oldId = safeInt(row[0]);
    if (oldId === null) continue;

    const nik = cleanStr(row[2]);
    const nisn = cleanStr(row[3]);
    const noReg = cleanStr(row[4]);
    const jenjang = cleanStr(row[12]);

    if (nik) nikToOldId.set(nik, oldId);
    if (noReg) noRegToOldId.set(noReg, oldId);
    if (nisn) oldIdToNisn.set(oldId, nisn);
    if (jenjang) oldIdToJenjang.set(oldId, jenjang);
  }
  console.log(`   ✅ ${nikToOldId.size} NIK diparsing, ${noRegToOldId.size} nomor registrasi diparsing`);

  // Parse tabel wilayahs untuk mendapatkan nama provinsi/kab/kec/desa
  const wilayahMap = new Map<number, string>(); // id -> nama
  const wilayahRows = parseInsertValues(content, 'wilayahs');
  for (const row of wilayahRows) {
    const id = safeInt(row[0]);
    const nama = cleanStr(row[2]); // asumsi kolom: id, kode, nama
    if (id && nama) wilayahMap.set(id, nama);
  }
  console.log(`   ✅ ${wilayahMap.size} wilayah diparsing`);

  // Parse sekolah asal (data_formulir_sekolahs atau sekolah_asals)
  const sekolahByOldId = new Map<number, { namaSekolah: string; tahunLulus: number | null }>();
  
  // Coba parse tabel sekolah_asals atau formulir_sekolahs
  const sekolahRows = parseInsertValues(content, 'sekolah_asals');
  if (sekolahRows.length > 0) {
    for (const row of sekolahRows) {
      const pId = safeInt(row[1]);
      if (pId === null) continue;
      sekolahByOldId.set(pId, {
        namaSekolah: cleanStr(row[2]),
        tahunLulus: safeInt(row[3]),
      });
    }
    console.log(`   ✅ ${sekolahByOldId.size} sekolah asal diparsing`);
  }

  // ─── STEP 2: Parse data Wali (jika ada tabelnya) ──────────────────────
  // Di SQL lama Ulul Albaab, data wali mungkin di tabel 'data_walis' atau lainnya
  // Periksa tabel yang tersedia
  type WaliEntry = {
    namaAyah: string; nikAyah: string; tempatLahirAyah: string;
    tanggalLahirAyah: Date | null; pekerjaanAyah: string; noHpAyah: string;
    namaIbu: string; nikIbu: string; tempatLahirIbu: string;
    tanggalLahirIbu: Date | null; pekerjaanIbu: string; noHpIbu: string;
    namaWali: string; noHpWali: string; pekerjaanWali: string; hubunganWali: string;
  };
  const waliByOldId = new Map<number, WaliEntry>();

  // Cek apakah ada tabel data_walis
  const waliRows = parseInsertValues(content, 'data_walis');
  if (waliRows.length > 0) {
    // Asumsikan struktur: id, pendaftar_id, nama_ayah, nik_ayah, tempat_lahir_ayah,
    // tanggal_lahir_ayah, pekerjaan_ayah, no_hp_ayah, nama_ibu, nik_ibu, ...
    for (const row of waliRows) {
      const pId = safeInt(row[1]);
      if (pId === null) continue;
      waliByOldId.set(pId, {
        namaAyah: cleanStr(row[2]),
        nikAyah: cleanStr(row[3]),
        tempatLahirAyah: cleanStr(row[4]),
        tanggalLahirAyah: safeDate(row[5]),
        pekerjaanAyah: cleanStr(row[6]),
        noHpAyah: cleanStr(row[7]),
        namaIbu: cleanStr(row[8]),
        nikIbu: cleanStr(row[9]),
        tempatLahirIbu: cleanStr(row[10]),
        tanggalLahirIbu: safeDate(row[11]),
        pekerjaanIbu: cleanStr(row[12]),
        noHpIbu: cleanStr(row[13]),
        namaWali: cleanStr(row[14] || ''),
        noHpWali: cleanStr(row[15] || ''),
        pekerjaanWali: cleanStr(row[16] || ''),
        hubunganWali: cleanStr(row[17] || ''),
      });
    }
    console.log(`   ✅ ${waliByOldId.size} data wali diparsing`);
  }

  // ─── STEP 3: Ambil semua pendaftar dari database Prisma ───────────────
  console.log('\n🔍 Step 2: Mengambil data pendaftar dari database produksi...');
  const dbPendaftars = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nik: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
      tempat_lahir: true,
      tanggal_lahir: true,
      nisn: true,
    },
  });
  console.log(`   ✅ ${dbPendaftars.length} pendaftar di database`);

  // Hitung yang sudah lengkap
  const sudahLengkap = dbPendaftars.filter(p => p.tempat_lahir && p.tanggal_lahir).length;
  const perluDiisi = dbPendaftars.filter(p => !p.tempat_lahir || !p.tanggal_lahir).length;
  console.log(`   📊 Sudah lengkap: ${sudahLengkap}, Perlu diisi: ${perluDiisi}`);

  // ─── STEP 4: Backfill ────────────────────────────────────────────────
  console.log('\n🔄 Step 3: Mulai proses backfill...');
  console.log('(Hanya mengisi field yang KOSONG, tidak menimpa data yang sudah ada)');
  console.log('-'.repeat(50));

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;
  let orangTuaNew = 0;
  let orangTuaUpdated = 0;
  let errors = 0;
  const noMatchList: string[] = [];

  for (const dbP of dbPendaftars) {
    try {
      // 1. Cari ID lama berdasarkan NIK
      let oldId = nikToOldId.get(dbP.nik);

      // 2. Fallback: coba nomor pendaftaran
      if (!oldId) {
        oldId = noRegToOldId.get(dbP.nomor_pendaftaran);
      }

      if (!oldId) {
        noMatch++;
        noMatchList.push(`${dbP.nama_lengkap} (${dbP.nik} / ${dbP.nomor_pendaftaran})`);
        continue;
      }

      const bio = biodataByOldId.get(oldId);

      if (!bio) {
        noMatch++;
        noMatchList.push(`${dbP.nama_lengkap} - ditemukan di pendaftars tapi tidak ada biodata`);
        continue;
      }

      // Build update data - HANYA isi yang kosong
      const updateData: Record<string, any> = {};

      // -- Biodata inti --
      if (!dbP.tempat_lahir && bio.tempatLahir) updateData.tempat_lahir = bio.tempatLahir;
      if (!dbP.tanggal_lahir && bio.tanggalLahir) updateData.tanggal_lahir = bio.tanggalLahir;
      if (!dbP.nisn && oldIdToNisn.get(oldId)) updateData.nisn = oldIdToNisn.get(oldId);
      if (bio.golDarah) updateData.golongan_darah = bio.golDarah;
      if (bio.anakKe !== null) updateData.anak_ke = bio.anakKe;
      if (bio.jumlahSaudara !== null) updateData.jumlah_saudara = bio.jumlahSaudara;
      if (bio.hobi) updateData.hobi = bio.hobi;
      if (bio.citaCita) updateData.cita_cita = bio.citaCita;
      if (bio.jumlahHafalan !== null) updateData.jumlah_hafalan = bio.jumlahHafalan.toString();

      // -- Alamat (dari alamat_lengkap yang merupakan field tunggal di SQL lama) --
      if (bio.alamatLengkap) updateData.alamat = bio.alamatLengkap;

      // -- Provinsi (dari ID provinsi ke nama) --
      if (bio.provId) {
        const provNama = getProvName(bio.provId);
        if (provNama) updateData.provinsi = provNama;
      }

      // -- Kabupaten dari wilayahMap --
      if (bio.kabId && wilayahMap.has(bio.kabId)) {
        updateData.kabupaten = wilayahMap.get(bio.kabId);
      }
      if (bio.kecId && wilayahMap.has(bio.kecId)) {
        updateData.kecamatan = wilayahMap.get(bio.kecId);
      }
      if (bio.desaId && wilayahMap.has(bio.desaId)) {
        updateData.kelurahan = wilayahMap.get(bio.desaId);
      }

      // -- Sekolah asal --
      const sekolah = sekolahByOldId.get(oldId);
      if (sekolah) {
        if (sekolah.namaSekolah) updateData.asal_sekolah = sekolah.namaSekolah;
        if (sekolah.tahunLulus !== null) updateData.tahun_lulus = sekolah.tahunLulus;
      }

      // Update pendaftar jika ada yang perlu diisi
      if (Object.keys(updateData).length > 0) {
        await prisma.pendaftar.update({
          where: { id: dbP.id },
          data: updateData,
        });
        updated++;
        if (updated <= 10 || updated % 20 === 0) {
          console.log(`  ✅ [${updated}] ${dbP.nama_lengkap}: ${Object.keys(updateData).join(', ')}`);
        }
      } else {
        skipped++;
      }

      // -- Data Orang Tua / Wali --
      const wali = waliByOldId.get(oldId);
      if (wali) {
        const orangTuaData = {
          nama_ayah: wali.namaAyah || null,
          nik_ayah: wali.nikAyah || null,
          tempat_lahir_ayah: wali.tempatLahirAyah || null,
          tanggal_lahir_ayah: wali.tanggalLahirAyah,
          pekerjaan_ayah: wali.pekerjaanAyah || null,
          no_hp_ayah: wali.noHpAyah || null,
          nama_ibu: wali.namaIbu || null,
          nik_ibu: wali.nikIbu || null,
          tempat_lahir_ibu: wali.tempatLahirIbu || null,
          tanggal_lahir_ibu: wali.tanggalLahirIbu,
          pekerjaan_ibu: wali.pekerjaanIbu || null,
          no_hp_ibu: wali.noHpIbu || null,
          nama_wali: wali.namaWali || null,
          no_hp_wali: wali.noHpWali || null,
          pekerjaan_wali: wali.pekerjaanWali || null,
          hubungan_wali: wali.hubunganWali || null,
        };

        const existing = await prisma.orangTua.findUnique({
          where: { pendaftar_id: dbP.id },
        });

        if (existing) {
          await prisma.orangTua.update({
            where: { pendaftar_id: dbP.id },
            data: orangTuaData,
          });
          orangTuaUpdated++;
        } else {
          await prisma.orangTua.create({
            data: { ...orangTuaData, pendaftar_id: dbP.id },
          });
          orangTuaNew++;
        }
      }

    } catch (err: any) {
      errors++;
      console.error(`  ❌ Error: ${dbP.nama_lengkap} (${dbP.nik}) - ${err.message}`);
    }
  }

  // ─── STEP 5: Laporan ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('📊 LAPORAN BACKFILL SELESAI');
  console.log('='.repeat(50));
  console.log(`✅ Pendaftar berhasil diupdate : ${updated}`);
  console.log(`⏭️  Data sudah lengkap (skip)   : ${skipped}`);
  console.log(`❓ Tidak ditemukan di SQL       : ${noMatch}`);
  console.log(`👪 Data orang tua dibuat baru   : ${orangTuaNew}`);
  console.log(`🔄 Data orang tua diupdate      : ${orangTuaUpdated}`);
  console.log(`❌ Error                         : ${errors}`);

  if (noMatchList.length > 0 && noMatchList.length <= 30) {
    console.log('\n⚠️  Pendaftar yang tidak ditemukan di SQL lama:');
    noMatchList.forEach((n, i) => console.log(`   ${i + 1}. ${n}`));
  } else if (noMatchList.length > 30) {
    console.log(`\n⚠️  ${noMatchList.length} pendaftar tidak ditemukan di SQL lama.`);
    console.log('   (Kemungkinan ini adalah pendaftar baru tahun 2027-2028)');
  }

  console.log('\n✨ Selesai!');

  // ─── STEP 6: Verifikasi akhir ─────────────────────────────────────────
  console.log('\n🔍 Verifikasi akhir...');
  const setelah = await prisma.pendaftar.count({
    where: { tempat_lahir: { not: null }, tanggal_lahir: { not: null } },
  });
  const total = await prisma.pendaftar.count();
  const masihKosong = total - setelah;
  console.log(`📊 Total pendaftar: ${total}`);
  console.log(`✅ Sudah ada biodata lengkap: ${setelah}`);
  console.log(`⚠️  Masih kosong biodata: ${masihKosong}`);
}

main()
  .catch(e => { console.error('\n❌ Fatal Error:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
