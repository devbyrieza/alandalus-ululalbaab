const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');
const path = require('path');

async function dryRun() {
  const filePath = path.join(process.cwd(), 'Update DATA UP 2026-2027.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const dataRows = excelData.slice(5).filter(row => row[0]); // Start from index 5 (Row 6)
  
  const dbPendaftar = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nama_lengkap: true,
      jenis_kelamin: true,
      jenjang: true,
      status_pendaftaran: true
    }
  });

  const normalize = (str) => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const mapGender = (str) => {
    const val = normalize(str);
    if (val.startsWith('l')) return 'L';
    if (val.startsWith('p')) return 'P';
    return null;
  };

  let matched = 0;
  let total = 0;
  let skippedNoPayment = 0;
  const unmatched = [];
  const matches = [];

  for (const row of dataRows) {
    const name = row[3];
    const gender = mapGender(row[4]);
    const kelasStr = normalize(row[5]); // e.g. "mts putra"
    const angs1 = row[7] || 0;
    
    if (!name) continue;
    total++;

    if (angs1 === 0) {
      skippedNoPayment++;
      continue;
    }

    // Determine target jenjang
    let targetJenjang = '';
    if (kelasStr.includes('mts')) targetJenjang = 'MTS';
    else if (kelasStr.includes('sma')) targetJenjang = 'SMA';
    else if (kelasStr.includes('il')) targetJenjang = 'IL';

    // Find match
    const found = dbPendaftar.find(p => 
      normalize(p.nama_lengkap) === normalize(name) &&
      p.jenis_kelamin === gender &&
      (targetJenjang === '' || p.jenjang === targetJenjang)
    );

    if (found) {
      matched++;
      matches.push({
        excelName: name,
        dbName: found.nama_lengkap,
        status: found.status_pendaftaran
      });
    } else {
      unmatched.push({ name, gender, kelas: row[5] });
    }
  }

  console.log(`Summary:`);
  console.log(`Total rows in Excel: ${total}`);
  console.log(`Skipped (No payment): ${skippedNoPayment}`);
  console.log(`Matched: ${matched}`);
  console.log(`Unmatched: ${unmatched.length}`);
  
  if (unmatched.length > 0) {
    console.log(`\nSample Unmatched:`);
    console.log(JSON.stringify(unmatched.slice(0, 5), null, 2));
  }
}

dryRun().catch(console.error).finally(() => prisma.$disconnect());
