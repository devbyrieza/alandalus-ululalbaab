import XLSX from 'xlsx';
import path from 'path';

const filePath = path.join(process.cwd(), 'Data_Santri_Putri_UlulAlbaab_2026-2027.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Data for sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Show first 15 rows
        data.slice(0, 15).forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });
        console.log(`Total rows in ${sheetName}: ${data.length}`);
    });
} catch (err) {
    console.error('Error reading excel:', err);
}
