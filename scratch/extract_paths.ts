import fs from 'fs';
import readline from 'readline';

const sqlPath = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/backup_ululalbaab.sql';

async function findSamplePaths() {
    const fileStream = fs.createReadStream(sqlPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundBerkas = 0;
    let foundPembayaran = 0;

    console.log('--- Searching for sample paths in SQL backup ---');

    for await (const line of rl) {
        if (line.includes('INSERT INTO `berkas_pendaftars`')) {
            if (foundBerkas < 5) {
                console.log('\nSample Berkas Path line excerpt:');
                console.log(line.substring(0, 1000) + '...');
                foundBerkas++;
            }
        }
        if (line.includes('INSERT INTO `pembayarans`')) {
            if (foundPembayaran < 5) {
                console.log('\nSample Pembayaran Path line excerpt:');
                console.log(line.substring(0, 1000) + '...');
                foundPembayaran++;
            }
        }
        if (foundBerkas >= 5 && foundPembayaran >= 5) break;
    }
}

findSamplePaths().catch(console.error);
