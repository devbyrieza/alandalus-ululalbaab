import fs from 'fs';
import XLSX from 'xlsx';

const activeTAId = '11111111-1111-1111-1111-111111111111';

// I'll leave the Prisma part out for now to just compare file vs file
const excelPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/Data_Santri_Putri_UlulAlbaab_2026-2027.xlsx';
const mdPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/DATA_SANTRI_ULUL_ALBAAB_2026-2027-1.md';

const workbook = XLSX.readFile(excelPath);
const sheetMTs = workbook.Sheets['MTs Putri'];
const dataMTs = XLSX.utils.sheet_to_json(sheetMTs, { header: 1 }) as any[][];
const namesInExcel = dataMTs.slice(4).filter(row => row[2]).map(row => row[2].toString().trim().toLowerCase());

const mdContent = fs.readFileSync(mdPath, 'utf8');
const namesInMd = mdContent.split('\n')
    .filter(line => line.includes('|') && !line.includes('---') && !line.includes('No |'))
    .map(line => line.split('|')[2]?.trim().toLowerCase())
    .filter(name => name);

console.log('--- MTs Putri Comparison ---');
console.log('Total names in New Putri Excel:', namesInExcel.length);
console.log('Total names in current MD file:', namesInMd.length);

const onlyInExcel = namesInExcel.filter(name => !namesInMd.includes(name));
const onlyInMd = namesInMd.filter(name => !namesInExcel.includes(name));

console.log('Names ONLY in New Putri Excel:', onlyInExcel);
console.log('Names ONLY in current MD file (Wait, this includes Putra too, need to filter):');
// Filter MD names for Putri (assuming P in 3rd column)
const putriInMd = mdContent.split('\n')
    .filter(line => line.includes('|') && !line.includes('---') && !line.includes('No |'))
    .filter(line => line.split('|')[3]?.trim().toUpperCase() === 'P')
    .map(line => line.split('|')[2]?.trim().toLowerCase());

const mdNotExcel = putriInMd.filter(name => !namesInExcel.includes(name));
console.log('Putri names in MD but NOT in New Excel:', mdNotExcel);
console.log('Putri names in New Excel but NOT in MD:', onlyInExcel);
