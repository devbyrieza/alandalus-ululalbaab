import XLSX from 'xlsx';
import path from 'path';

const filePath = path.join(process.cwd(), '3. KANGGE SK Penerimaan santri baru 2026-2027 2.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Data for sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Show first 10 rows to understand header and structure
        data.slice(0, 15).forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });
        console.log(`Total rows in ${sheetName}: ${data.length}`);
    });
} catch (err) {
    console.error('Error reading excel:', err);
}
