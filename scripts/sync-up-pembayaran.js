const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');
const path = require('path');

async function sync() {
  const filePath = path.join(process.cwd(), 'Update DATA UP 2026/2027.xlsx');
  console.log(`Reading file: ${filePath}`);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Data starts from index 5 (Row 6)
  const dataRows = excelData.slice(5).filter(row => row[0]); 
  
  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { is_active: true }
  });
  
  if (!activeTA) {
    console.error('Error: No active Tahun Ajaran found.');
    process.exit(1);
  }
  
  console.log(`Using Active Academic Year: ${activeTA.nama} (${activeTA.id})`);

  const dbPendaftar = await prisma.pendaftar.findMany({
    where: { tahun_ajaran_id: activeTA.id },
    select: {
      id: true,
      nama_lengkap: true,
      jenis_kelamin: true,
      jenjang: true,
      status_pendaftaran: true
    }
  });

  const normalize = (str) => (str || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
  const mapGender = (str) => {
    const val = normalize(str);
    if (val.startsWith('l')) return 'L';
    if (val.startsWith('p')) return 'P';
    return null;
  };

  const results = {
    totalExcelRows: dataRows.length,
    skippedNoPayment: 0,
    updated: [],
    alreadyEnrolled: [],
    unmatched: []
  };

  console.log('Processing updates...');

  for (const row of dataRows) {
    const name = row[3];
    const gender = mapGender(row[4]);
    const kelasStr = normalize(row[5]);
    const angs1 = row[7] || 0;
    
    if (!name) continue;

    if (angs1 === 0) {
      results.skippedNoPayment++;
      continue;
    }

    let targetJenjang = '';
    if (kelasStr.includes('mts')) targetJenjang = 'MTS';
    else if (kelasStr.includes('sma')) targetJenjang = 'SMA';
    else if (kelasStr.includes('il')) targetJenjang = 'IL';

    const matches = dbPendaftar.filter(p => 
      normalize(p.nama_lengkap) === normalize(name) &&
      p.jenis_kelamin === gender &&
      (targetJenjang === '' || p.jenjang === targetJenjang)
    );

    if (matches.length === 1) {
      const target = matches[0];
      if (target.status_pendaftaran === 'enrolled') {
        results.alreadyEnrolled.push(name);
      } else {
        // ACTUAL UPDATE
        await prisma.pendaftar.update({
          where: { id: target.id },
          data: { status_pendaftaran: 'enrolled' }
        });
        results.updated.push({ name, from: target.status_pendaftaran });
      }
    } else {
      results.unmatched.push({ name, gender, kelas: row[5], found: matches.length });
    }
  }

  console.log('\n--- SYNC COMPLETED ---');
  console.log(`Total rows in Excel processed: ${results.totalExcelRows}`);
  console.log(`Skipped (Zero payment): ${results.skippedNoPayment}`);
  console.log(`Successfully Updated to Enrolled: ${results.updated.length}`);
  console.log(`Already Enrolled in DB: ${results.alreadyEnrolled.length}`);
  console.log(`Unmatched (Need manual checking): ${results.unmatched.length}`);

  if (results.unmatched.length > 0) {
    console.log('\nUnmatched Students:');
    results.unmatched.forEach(u => console.log(`- ${u.name} (${u.gender} - ${u.kelas})`));
  }
}

sync().catch(console.error).finally(() => prisma.$disconnect());
