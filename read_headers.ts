import * as xlsx from 'xlsx';

const workbook = xlsx.readFile('C:\\Users\\itpua\\Downloads\\Template upload data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];
console.log(JSON.stringify(headers, null, 2));
