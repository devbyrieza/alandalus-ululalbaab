import fs from 'fs';
import readline from 'readline';
import path from 'path';

const sqlPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/backup_ululalbaab.sql';
const outputPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/Laporan_Dokumen_Hilang.md';

async function auditMissingDocuments() {
    const fileStream = fs.createReadStream(sqlPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const studentFiles: Record<string, string[]> = {};
    const payments: Record<string, string[]> = {};
    const studentNames: Record<string, string> = {};

    console.log('--- Auditing missing documents from SQL backup ---');

    // First pass: get student names (simplified)
    // In the SQL, pendaftars insert looks like: VALUES (id, ..., nama_lengkap, ...)
    // This is hard to parse reliably with regex on large lines.
    // I'll focus on the IDs found in berkas_pendaftars.

    for await (const line of rl) {
        if (line.includes('INSERT INTO `berkas_pendaftars`')) {
            // Format: (id, pendaftar_id, berkas_id, status, nama_file, path_file, ...)
            const matches = line.matchAll(/\((\d+),(\d+),(\d+),'[^']+','([^']+)','([^']+)'/g);
            for (const match of matches) {
                const pId = match[2];
                const fileName = match[5];
                if (!studentFiles[pId]) studentFiles[pId] = [];
                studentFiles[pId].push(fileName);
            }
        }
        if (line.includes('INSERT INTO `pembayarans`')) {
            // Format: (id, kwitansi, pendaftar_id, ..., nama_file, path_file, ...)
            const matches = line.matchAll(/\((\d+),'[^']+',(\d+),(\d+),'[^']+','[^']+','([^']+)','([^']+)'/g);
            for (const match of matches) {
                const pId = match[2];
                const fileName = match[5];
                if (!payments[pId]) payments[pId] = [];
                payments[pId].push(fileName);
            }
        }
    }

    let report = '# Laporan Audit Dokumen Hilang (Situs Lama Down)\n\n';
    report += '> [!CAUTION]\n';
    report += '> Website lama (idCloudHost) sudah mati dan repositori Git tidak menyertakan file fisik.\n';
    report += '> Berikut adalah daftar dokumen yang tercatat di database lama namun **Filenya Hilang**.\n\n';
    
    report += '## Ringkasan\n';
    report += `- Total Siswa dengan Berkas Hilang: ${Object.keys(studentFiles).length}\n`;
    report += `- Total Siswa dengan Bukti Bayar Hilang: ${Object.keys(payments).length}\n\n`;

    report += '## Detail per Siswa (Internal ID)\n';
    report += '| ID Siswa | Jenis Dokumen Terdeteksi Hilang |\n';
    report += '|---|---|\n';

    const allStudentIds = Array.from(new Set([...Object.keys(studentFiles), ...Object.keys(payments)]));
    
    for (const id of allStudentIds.slice(0, 500)) { // Limit to 500 for the report file
        const docs = studentFiles[id] || [];
        const pays = payments[id] || [];
        const allDocs = [...docs, ...pays].map(d => `\`${d}\``).join(', ');
        report += `| ${id} | ${allDocs} |\n`;
    }

    fs.writeFileSync(outputPath, report);
    console.log('Report generated at:', outputPath);
}

auditMissingDocuments().catch(console.error);
