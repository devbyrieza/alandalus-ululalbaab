const fs = require('fs');
const readline = require('readline');

const SQL_FILE = 'C:\\Users\\itpua\\AppData\\Local\\pnpm\\store\\v10\\projects\\42503381d5f79d616c895d87c9983431\\full_20260328A.sql';

async function parseTable(tableName) {
    const fileStream = fs.createReadStream(SQL_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isInsideTable = false;
    let schema = [];
    let rows = [];

    for await (const line of rl) {
        if (line.includes(`CREATE TABLE \`${tableName}\``)) {
            isInsideTable = true;
            continue;
        }
        if (isInsideTable && line.includes('PRIMARY KEY')) {
            isInsideTable = false;
            continue;
        }
        if (isInsideTable) {
            const match = line.match(/^\s*`(\w+)`/);
            if (match) schema.push(match[1]);
        }

        if (line.startsWith(`INSERT INTO \`${tableName}\``)) {
            // Extract values
            const valuesMatch = line.match(/VALUES\s*(.*);/);
            if (valuesMatch) {
                // Simple parser for (val1, val2), (val3, val4)
                const valString = valuesMatch[1];
                // Regex to split groups while respecting nested parentheses and quotes is hard
                // We'll use a simpler split if it's manageable
                console.log(`Found ${tableName} insert statement`);
            }
        }
    }
    return { schema };
}

async function run() {
    console.log("Analyzing schemas...");
    const pendaftarSchema = await parseTable('pendaftars');
    const biodataSchema = await parseTable('biodata_pendaftars');
    const pembayaranSchema = await parseTable('pembayarans');
    const akunSchema = await parseTable('akun_pendaftars');

    console.log("Pendaftar:", pendaftarSchema.schema);
    console.log("Biodata:", biodataSchema.schema);
    console.log("Pembayaran:", pembayaranSchema.schema);
    console.log("Akun:", akunSchema.schema);
}

run();
