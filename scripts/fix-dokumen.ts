import * as fs from 'fs';
import * as path from 'path';

const SQL_FILE = path.join(process.cwd(), 'full_20260328.sql');

function cleanStr(str: string) {
  if (!str) return '';
  str = str.trim();
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1);
  }
  return str.replace(/\\'/g, "'").trim();
}

function findClosingParen(str: string, start: number): number {
  let depth = 0; let inString = false; let stringChar = '';
  for (let i = start; i < str.length; i++) {
    const char = str[i];
    if (char === "'" || char === '"') {
      if (!inString) { inString = true; stringChar = char; }
      else if (stringChar === char && str[i-1] !== '\\') { inString = false; }
    }
    if (!inString) {
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

function splitValues(str: string): string[] {
  const result: string[] = [];
  let current = ''; let inString = false; let stringChar = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" || char === '"') {
      if (!inString) { inString = true; stringChar = char; }
      else if (stringChar === char && str[i-1] !== '\\') { inString = false; }
      current += char;
    } else if (char === ',' && !inString) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseInsertValues(content: string, tableName: string): string[][] {
  const searchStr = `INSERT INTO \`${tableName}\` VALUES`;
  const allRows: string[][] = [];
  let startIndex = 0;
  
  while (true) {
    startIndex = content.indexOf(searchStr, startIndex);
    if (startIndex === -1) break;
    
    startIndex += searchStr.length;
    while (startIndex < content.length && /\s/.test(content[startIndex])) {
      startIndex++;
    }
    if (content[startIndex] !== '(') {
      startIndex++; continue;
    }
    
    const endIndex = content.indexOf(';', startIndex);
    if (endIndex === -1) break;
    
    const valuesStr = content.substring(startIndex, endIndex).trim();
    let currentPos = 0;
    while (currentPos < valuesStr.length) {
      if (valuesStr[currentPos] === '(') {
        let endPos = findClosingParen(valuesStr, currentPos);
        if (endPos === -1) break; 
        const rowStr = valuesStr.substring(currentPos + 1, endPos);
        allRows.push(splitValues(rowStr));
        currentPos = endPos + 1;
      } else { currentPos++; }
    }
    startIndex = endIndex + 1;
  }
  return allRows;
}

function generateFixScript() {
  console.log('Reading sql dump...');
  const content = fs.readFileSync(SQL_FILE, 'utf8');
  console.log('Parsing pendaftars...');
  const rows = parseInsertValues(content, 'pendaftars');
  
  const oldIdToName = new Map<number, string>();
  for (const row of rows) {
    const oldId = parseInt(row[0]);
    const name = cleanStr(row[7]);
    oldIdToName.set(oldId, name);
  }

  console.log(`Found ${oldIdToName.size} users.`);

  // Generate a sql script
  const sqlCommands: string[] = [];
  
  sqlCommands.push(`-- Generated fix script for Dokumen table`);
  
  // We need to create a mapping table to make the update easy
  sqlCommands.push(`
CREATE TEMP TABLE tmp_oldid_nama (
    old_id INTEGER,
    nama_lengkap VARCHAR
);
`);

  const inserts: string[] = [];
  for (const [oldId, name] of oldIdToName.entries()) {
    const safeName = name.replace(/'/g, "''");
    inserts.push(`(${oldId}, '${safeName}')`);
  }
  
  // Chunk inserts
  for (let i = 0; i < inserts.length; i += 100) {
    const chunk = inserts.slice(i, i + 100);
    sqlCommands.push(`INSERT INTO tmp_oldid_nama (old_id, nama_lengkap) VALUES ${chunk.join(', ')};`);
  }
  
  sqlCommands.push(`
-- Now we update the dokumen table
-- We extract the oldId from the file_path like ..._206.jpg
UPDATE dokumen d
SET pendaftar_id = p.id
FROM tmp_oldid_nama t
JOIN pendaftar p ON p.nama_lengkap = t.nama_lengkap
WHERE d.file_path ~ ('_' || t.old_id::text || '\.[a-zA-Z0-9]+$')
AND d.pendaftar_id != p.id;
`);

  fs.writeFileSync('fix_dokumen_final.sql', sqlCommands.join('\n'));
  console.log('fix_dokumen_final.sql generated!');
}

generateFixScript();
