const fs = require('fs');
const readline = require('readline');

const SQL_FILE = 'C:\\Users\\itpua\\AppData\\Local\\pnpm\\store\\v10\\projects\\42503381d5f79d616c895d87c9983431\\full_20260328A.sql';

async function extractSchema(tableName) {
    const fileStream = fs.createReadStream(SQL_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isInsideTable = false;
    let schema = [];

    for await (const line of rl) {
        if (line.includes(`CREATE TABLE \`${tableName}\``)) {
            isInsideTable = true;
            continue;
        }
        if (isInsideTable && (line.includes('PRIMARY KEY') || line.includes(');'))) {
            isInsideTable = false;
            break;
        }
        if (isInsideTable) {
            const match = line.match(/^\s*`(\w+)`/);
            if (match) schema.push(match[1]);
        }
    }
    return schema;
}

async function extractData(tableName) {
    const fileStream = fs.createReadStream(SQL_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let dataLine = "";
    for await (const line of rl) {
        if (line.startsWith(`INSERT INTO \`${tableName}\``)) {
            dataLine = line;
            break; 
        }
    }
    return dataLine;
}

async function run() {
    const tables = ['pendaftarans', 'status_pendaftarans', 'pendaftars'];
    for (const t of tables) {
        console.log(`Table: ${t}`);
        console.log("Schema:", await extractSchema(t));
        const data = await extractData(t);
        console.log("Data snippet:", data.substring(0, 500) + "...");
        console.log("-------------------");
    }
}

run();
