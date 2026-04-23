const XLSX = require('xlsx');
const path = require('path');

function readExcel() {
  const filePath = path.join(process.cwd(), 'Update DATA UP 2026-2027.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
  console.log('Total rows:', data.length);
}

readExcel();
