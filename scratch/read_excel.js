
const XLSX = require('xlsx');

const filePath = 'C:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/Update DATA UP 2026-2027.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read raw 2D array to find headers
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('--- Raw Data Rows (Top 20) ---');
    rawData.slice(0, 20).forEach((row, i) => {
        console.log(`Row ${i}:`, JSON.stringify(row));
    });

} catch (error) {
    console.error('Error reading Excel:', error.message);
}
