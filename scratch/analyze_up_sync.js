const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');
const path = require('path');

async function analyze() {
  // 1. Read Excel
  const filePath = path.join(process.cwd(), 'Update DATA UP 2026-2027.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Data starts at row 4 (index 3) based on previous preview
  const dataRows = excelData.slice(3).filter(row => row[0] && typeof row[0] === 'number');
  
  console.log(`Excel: Found ${dataRows.length} data rows.`);

  // 2. Read DB
  const dbPendaftar = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nama_lengkap: true,
      nisn: true,
      jenjang: true,
      jenis_kelamin: true,
      status_pendaftaran: true
    }
  });

  console.log(`DB: Found ${dbPendaftar.length} pendaftar.`);

  // 3. Try to match
  let matched = 0;
  let alreadyEnrolled = 0;
  let toBeUpdated = 0;

  for (const row of dataRows) {
    const name = row[3]; // __EMPTY_2 was Column D? Wait, let's check index.
    // Based on sheet_to_json results:
    // "Data Pembayaran...": No (Col A, index 0)
    // "__EMPTY": NIS (Col B, index 1)
    // "__EMPTY_1": NISN (Col C, index 2)
    // "__EMPTY_2": Nama Santri (Col D, index 3)
    // "__EMPTY_3": L/P (Col E, index 4)
    // "__EMPTY_4": Kelas (Col F, index 5)
    
    // Note: index might shift depending on how xlsx handles empty columns.
    // Let's re-verify indices by looking at one row data.
  }
}

analyze().catch(console.error).finally(() => prisma.$disconnect());
