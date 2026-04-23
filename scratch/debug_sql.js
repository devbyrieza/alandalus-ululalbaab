const fs = require('fs');
const SQL_FILE = 'C:\\Users\\itpua\\AppData\\Local\\pnpm\\store\\v10\\projects\\42503381d5f79d616c895d87c9983431\\full_20260328A.sql';

const content = fs.readFileSync(SQL_FILE, 'utf8');
const pMatch = content.match(/INSERT INTO `pendaftars` VALUES (.*?);/gs);
console.log('Insert statements for pendaftars:', pMatch ? pMatch.length : 0);

if (pMatch) {
    pMatch.forEach((stmt, idx) => {
        const values = stmt.match(/VALUES (.*);/s)[1];
        // Count how many ( are at depth 0
        let count = 0;
        let q = false;
        let d = 0;
        for(let i=0; i<values.length; i++) {
            if (values[i] === "'" && values[i-1] !== '\\') q = !q;
            if (!q) {
                if (values[i] === '(') d++;
                if (values[i] === ')') {
                    d--;
                    if (d === 0) count++;
                }
            }
        }
        console.log(`Statement ${idx} has ${count} rows.`);
    });
}
