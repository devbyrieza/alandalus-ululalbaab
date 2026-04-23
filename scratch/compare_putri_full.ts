import fs from 'fs';
import XLSX from 'xlsx';

const excelPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/Data_Santri_Putri_UlulAlbaab_2026-2027.xlsx';
const mdPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/DATA_SANTRI_ULUL_ALBAAB_2026-2027-1.md';

const workbook = XLSX.readFile(excelPath);

const getNamesFromSheet = (sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    return data.slice(4).filter(row => row[2]).map(row => row[2].toString().trim().toLowerCase());
};

const excelMTs = getNamesFromSheet('MTs Putri');
const excelIL = getNamesFromSheet('IL Putri');
const allExcelPutri = [...excelMTs, ...excelIL];

const mdContent = fs.readFileSync(mdPath, 'utf8');
const allMdPutri = mdContent.split('\n')
    .filter(line => line.includes('|') && !line.includes('---') && !line.includes('No |'))
    .filter(line => line.split('|')[3]?.trim().toUpperCase() === 'P')
    .map(line => line.split('|')[2]?.trim().toLowerCase());

console.log('--- Total Putri Comparison ---');
console.log('New Excel Total (MTs + IL):', allExcelPutri.length);
console.log('Old MD Total Putri:', allMdPutri.length);

const onlyInExcel = allExcelPutri.filter(name => !allMdPutri.includes(name));
const onlyInMd = allMdPutri.filter(name => !allExcelPutri.includes(name));

console.log('\nPutri names in New Excel but NOT in MD:', onlyInExcel);
console.log('Putri names in MD but NOT in New Excel:', onlyInMd);

// Check intersection
const common = allExcelPutri.filter(name => allMdPutri.includes(name));
console.log('\nCommon Putri students:', common.length);
