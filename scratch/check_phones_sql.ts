import fs from 'fs';
import readline from 'readline';

const sqlPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/backup_ululalbaab.sql';

async function countPhones() {
    const fileStream = fs.createReadStream(sqlPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let totalPendaftar = 0;
    let validPhones = 0;
    let samples: string[] = [];

    for await (const line of rl) {
        if (line.includes('INSERT INTO `pendaftars`')) {
            // Very basic split for values (might be inaccurate but good for estimation)
            const matches = line.matchAll(/\(([^)]+)\)/g);
            for (const match of matches) {
                totalPendaftar++;
                const cols = match[1].split(',');
                // Assuming column 4 (index 3) is no_hp based on CREATE TABLE
                const phone = (cols[3] || '').trim().replace(/'/g, '');
                if (phone && phone !== 'NULL' && phone !== '' && phone.length > 5) {
                    validPhones++;
                    if (samples.length < 5) samples.push(phone);
                }
            }
        }
    }
    console.log({ totalPendaftar, validPhones, coverage: (validPhones/totalPendaftar*100).toFixed(2) + '%' });
    console.log('Sample phones:', samples);
}

countPhones().catch(console.error);
