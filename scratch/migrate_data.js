const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const SQL_FILE = 'C:\\Users\\itpua\\AppData\\Local\\pnpm\\store\\v10\\projects\\42503381d5f79d616c895d87c9983431\\full_20260328A.sql';
const TA_ID = '11111111-1111-1111-1111-111111111111';

function parseStatements(sql, tableName) {
    const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.*?);`, 'gs');
    let allRows = [];
    let match;
    while ((match = regex.exec(sql)) !== null) {
        const values = match[1].trim();
        allRows.push(...splitRows(values));
    }
    return allRows;
}

function splitRows(values) {
    const rows = [];
    let current = '';
    let q = false;
    let d = 0;
    for (let i = 0; i < values.length; i++) {
        const c = values[i];
        if (c === "'" && values[i - 1] !== '\\') q = !q;
        if (!q) {
            if (c === '(') d++;
            if (c === ')') d--;
        }
        current += c;
        if (d === 0 && (c === ',' || i === values.length - 1) && !q) {
            let s = current.trim();
            if (s.endsWith(',')) s = s.slice(0, -1).trim();
            if (s.startsWith('(') && s.endsWith(')')) {
                rows.push(parseRow(s.slice(1, -1)));
            }
            current = '';
        }
    }
    return rows;
}

function parseRow(row) {
    const fields = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === "'" && row[i - 1] !== '\\') q = !q;
        if (c === ',' && !q) {
            fields.push(clean(cur));
            cur = '';
        } else cur += c;
    }
    fields.push(clean(cur));
    return fields;
}

function clean(f) {
    f = f.trim();
    if (f === 'NULL') return null;
    if (f.startsWith("'") && f.endsWith("'")) return f.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
    return f;
}

async function run() {
    console.log("Loading SQL file...");
    const sql = fs.readFileSync(SQL_FILE, 'utf8');

    console.log("Extracting data...");
    const pData = parseStatements(sql, 'pendaftars');
    const sData = parseStatements(sql, 'status_pendaftarans');
    const bData = parseStatements(sql, 'biodata_pendaftars');
    const hData = parseStatements(sql, 'nomor_hps'); // No HP usually here in old system

    console.log(`Found ${pData.length} pendaftars.`);

    let count = 0;
    for (const p of pData) {
        const oldId = p[0];
        const nik = p[2];
        const nisn = p[3];
        const noReg = p[4];
        const nama = p[7];
        const jkInput = p[8];
        const createdAt = p[9];
        const jenjang = p[12];

        if (!noReg || !nama) continue;

        // Find Phone from nomor_hps [id, pendaftar_id, nomor, ...]
        const hpRow = hData.find(h => h[1] == oldId);
        const phone = hpRow ? hpRow[2] : "-";

        // Find Biodata [id, pendaftar_id, tempat_lahir, ..., tanggal_lahir, ...]
        const bioRow = bData.find(b => b[1] == oldId);
        const tempatLahir = bioRow ? bioRow[2] : null;
        const tglLahir = bioRow ? bioRow[4] : null;
        const alamat = bioRow ? bioRow[10] : null;

        const pStatusList = sData.filter(s => s[1] == oldId);
        let status = 'draft';
        if (pStatusList.some(s => s[4] == '2' && s[5] === 'diterima')) status = 'verified';
        if (pStatusList.some(s => (s[4] == '6' || s[4] == '10' || s[4] == '8') && s[5] === 'diterima')) status = 'accepted';
        if (pStatusList.some(s => s[4] == '10' && s[5] === 'diterima')) status = 'enrolled';

        const jk = jkInput === 'Laki-laki' ? 'L' : 'P';

        try {
            await prisma.pendaftar.upsert({
                where: { nomor_pendaftaran: noReg },
                update: { status_pendaftaran: status },
                create: {
                    nomor_pendaftaran: noReg,
                    nama_lengkap: nama,
                    nik: nik || "-",
                    jenis_kelamin: jk,
                    jenjang: jenjang || "MTS",
                    status_pendaftaran: status,
                    tahun_ajaran_id: TA_ID,
                    created_at: createdAt ? new Date(createdAt) : new Date(),
                    no_hp: phone,
                    nisn: nisn || null,
                    tempat_lahir: tempatLahir,
                    tanggal_lahir: tglLahir ? new Date(tglLahir) : null,
                    alamat: alamat
                }
            });
            count++;
        } catch (e) {
            console.error(`Error ${noReg}:`, e.message);
        }
    }
    console.log(`Migration finished. ${count} records processed.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
