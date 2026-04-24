
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Use default .env first

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const SQL_FILE = 'full_20260328.sql';

function cleanStr(val: string): string {
  if (!val || val.toUpperCase() === 'NULL' || val.trim() === "''") return '';
  let s = val.trim();
  if (s.startsWith("'") && s.endsWith("'")) s = s.substring(1, s.length - 1);
  return s.replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\\/g, '\\');
}

function safeDate(val: string): Date | null {
  const cleaned = cleanStr(val);
  if (!cleaned || cleaned === '0000-00-00') return null;
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function safeInt(val: string): number | null {
  const cleaned = cleanStr(val);
  if (!cleaned) return null;
  const n = parseInt(cleaned);
  return isNaN(n) ? null : n;
}

function parseInsertValues(content: string, tableName: string): string[][] {
  const allRows: string[][] = [];
  const searchStr = `INSERT INTO \`${tableName}\` VALUES `;
  let offset = 0;

  while (true) {
    const idx = content.indexOf(searchStr, offset);
    if (idx === -1) break;

    offset = idx + searchStr.length;
    const endIdx = content.indexOf(';\n', offset);
    if (endIdx === -1) break;

    const valuesPart = content.substring(offset, endIdx).trim();
    offset = endIdx + 2;

    let pos = 0;
    while (pos < valuesPart.length) {
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
      inStr = true; strChar = c; cur += c;
    } else if (c === ',') {
      parts.push(cur.trim()); cur = '';
    } else {
      cur += c;
    }
  }
  parts.push(cur.trim());
  return parts;
}

async function main() {
  console.log('🚀 RESCUE STUDENT DATA - ULUL ALBAAB');
  console.log('='.repeat(50));

  if (!fs.existsSync(SQL_FILE)) {
    throw new Error(`❌ File ${SQL_FILE} tidak ditemukan!`);
  }

  const content = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`✅ File dibaca: ${(content.length / 1024 / 1024).toFixed(1)} MB`);

  // 1. Map Data from SQL
  console.log('\n📊 Step 1: Parsing data dari SQL...');
  
  const phoneByPendaftarId = new Map<number, string>();
  parseInsertValues(content, 'nomor_hps').forEach(row => {
    const pId = safeInt(row[10]); // Last column in my search was pendaftar_id
    if (pId) phoneByPendaftarId.set(pId, cleanStr(row[1]));
  });

  const emailById = new Map<number, string>();
  parseInsertValues(content, 'emails').forEach(row => {
    const id = safeInt(row[0]);
    if (id) emailById.set(id, cleanStr(row[1]));
  });

  const pendaftarInfoByOldId = new Map<number, any>();
  parseInsertValues(content, 'pendaftars').forEach(row => {
    const oldId = safeInt(row[0]);
    if (oldId) {
      pendaftarInfoByOldId.set(oldId, {
        nik: cleanStr(row[2]),
        noReg: cleanStr(row[4]),
        emailId: safeInt(row[11]),
        nama: cleanStr(row[7])
      });
    }
  });

  const jobsMap = new Map<number, string>();
  parseInsertValues(content, 'pekerjaans').forEach(row => {
    const id = safeInt(row[0]);
    if (id) jobsMap.set(id, cleanStr(row[1]));
  });

  const waliByOldId = new Map<number, any>();
  parseInsertValues(content, 'wali_pendaftars').forEach(row => {
    const pId = safeInt(row[1]);
    if (pId) {
      if (!waliByOldId.has(pId)) waliByOldId.set(pId, {});
      const tipe = cleanStr(row[2]).toLowerCase();
      waliByOldId.get(pId)[tipe] = row;
    }
  });

  const biodataByOldId = new Map<number, any>();
  parseInsertValues(content, 'biodata_pendaftars').forEach(row => {
    const pId = safeInt(row[1]);
    if (pId) {
      biodataByOldId.set(pId, {
        pob: cleanStr(row[2]),
        dob: safeDate(row[4]),
        blood: cleanStr(row[5]),
        siblingCount: safeInt(row[6]),
        childNo: safeInt(row[7]),
        hobby: cleanStr(row[8]),
        ambition: cleanStr(row[9]),
        address: cleanStr(row[10]),
        provId: safeInt(row[12]),
        kabId: safeInt(row[13]),
        kecId: safeInt(row[14]),
        desaId: safeInt(row[15]),
      });
    }
  });

  const schoolByOldId = new Map<number, any>();
  parseInsertValues(content, 'sekolah_asals').forEach(row => {
    const pId = safeInt(row[1]);
    if (pId) {
      schoolByOldId.set(pId, {
        name: cleanStr(row[2]),
        year: safeInt(row[3]),
      });
    }
  });

  const wilayahMap = new Map<number, string>();
  parseInsertValues(content, 'wilayahs').forEach(row => {
    const id = safeInt(row[0]);
    const nama = cleanStr(row[1]);
    if (id && nama) wilayahMap.set(id, nama);
  });

  // 2. Cross-reference NIK/Name to Old ID
  const nikToOldId = new Map<string, number>();
  const nameToOldId = new Map<string, number>();
  for (const [oldId, info] of pendaftarInfoByOldId.entries()) {
    if (info.nik && info.nik !== '0000000000000000') nikToOldId.set(info.nik, oldId);
    nameToOldId.set(info.nama.toUpperCase(), oldId);
  }

  // 3. Process current DB
  console.log('\n🔄 Step 2: Melengkapi data di database...');
  const dbStudents = await prisma.pendaftar.findMany({ include: { orang_tua: true } });
  console.log(`✅ Total pendaftar di DB: ${dbStudents.length}`);

  let updatedCount = 0;
  for (const s of dbStudents) {
    let oldId = nikToOldId.get(s.nik);
    if (!oldId) oldId = nameToOldId.get(s.nama_lengkap.toUpperCase());

    if (!oldId) continue;

    const info = pendaftarInfoByOldId.get(oldId);
    const bio = biodataByOldId.get(oldId);
    const school = schoolByOldId.get(oldId);
    const phone = phoneByPendaftarId.get(oldId);
    const email = info.emailId ? emailById.get(info.emailId) : null;

    const updateData: any = {};

    // 1. Phone & Email (Rescue!)
    if ((!s.no_hp || s.no_hp === '-') && phone) updateData.no_hp = phone;
    if (!s.email && email) updateData.email = email;

    // 2. Biodata
    if (bio) {
      if (!s.tempat_lahir && bio.pob) updateData.tempat_lahir = bio.pob;
      if (!s.tanggal_lahir && bio.dob) updateData.tanggal_lahir = bio.dob;
      if (!s.golongan_darah && bio.blood) updateData.golongan_darah = bio.blood;
      if (!s.anak_ke && bio.childNo) updateData.anak_ke = bio.childNo;
      if (!s.jumlah_saudara && bio.siblingCount) updateData.jumlah_saudara = bio.siblingCount;
      if (!s.hobi && bio.hobby) updateData.hobi = bio.hobby;
      if (!s.cita_cita && bio.ambition) updateData.cita_cita = bio.ambition;
      if ((!s.alamat || s.alamat === '-') && bio.address) updateData.alamat = bio.address;
      
      if ((!s.provinsi || s.provinsi === 'provinsi') && bio.provId) updateData.provinsi = wilayahMap.get(bio.provId);
      if ((!s.kabupaten || s.kabupaten === 'kabupaten_kota') && bio.kabId) updateData.kabupaten = wilayahMap.get(bio.kabId);
      if ((!s.kecamatan || s.kecamatan === 'kecamatan') && bio.kecId) updateData.kecamatan = wilayahMap.get(bio.kecId);
      if ((!s.kelurahan || s.kelurahan === 'desa_kelurahan') && bio.desaId) updateData.kelurahan = wilayahMap.get(bio.desaId);
    }

    // 4. Parents
    const family = waliByOldId.get(oldId) || {};
    const a = family.ayah;
    const i = family.ibu;
    const w = family.wali;

    if (a || i || w) {
      const orangTuaData: any = {
        nama_ayah: a ? cleanStr(a[5]) : (s.orang_tua?.nama_ayah || '-'),
        no_hp_ayah: a ? (phoneByPendaftarId.get(safeInt(a[22]) || 0) || '-') : (s.orang_tua?.no_hp_ayah || '-'),
        pekerjaan_ayah: a ? (jobsMap.get(safeInt(a[20]) || 0) || '-') : (s.orang_tua?.pekerjaan_ayah || '-'),
        pendidikan_ayah: a ? cleanStr(a[9]) : (s.orang_tua?.pendidikan_ayah || '-'),
        
        nama_ibu: i ? cleanStr(i[5]) : (s.orang_tua?.nama_ibu || '-'),
        no_hp_ibu: i ? (phoneByPendaftarId.get(safeInt(i[22]) || 0) || '-') : (s.orang_tua?.no_hp_ibu || '-'),
        pekerjaan_ibu: i ? (jobsMap.get(safeInt(i[20]) || 0) || '-') : (s.orang_tua?.pekerjaan_ibu || '-'),
        pendidikan_ibu: i ? cleanStr(i[9]) : (s.orang_tua?.pendidikan_ibu || '-'),

        nama_wali: w ? cleanStr(w[5]) : (s.orang_tua?.nama_wali || '-'),
        no_hp_wali: w ? (phoneByPendaftarId.get(safeInt(w[22]) || 0) || '-') : (s.orang_tua?.no_hp_wali || '-'),
        pekerjaan_wali: w ? (jobsMap.get(safeInt(w[20]) || 0) || '-') : (s.orang_tua?.pekerjaan_wali || '-'),
        hubungan_wali: w ? cleanStr(w[2]) : (s.orang_tua?.hubungan_wali || '-'),
      };

      if (!s.orang_tua) {
        await prisma.orangTua.create({
          data: { ...orangTuaData, pendaftar_id: s.id }
        });
      } else {
        await prisma.orangTua.update({
          where: { pendaftar_id: s.id },
          data: orangTuaData
        });
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.pendaftar.update({
        where: { id: s.id },
        data: updateData
      });
      updatedCount++;
      if (s.nama_lengkap.includes('PUTRA PERDANA')) {
        console.log(`🎯 Updated PUTRA PERDANA:`, updateData);
      }
    }
  }

  console.log(`\n✨ Selesai! Berhasil melengkapi ${updatedCount} pendaftar.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
