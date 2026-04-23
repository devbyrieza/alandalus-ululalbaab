import fs from 'fs';

const content = fs.readFileSync('c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/DATA_SANTRI_ULUL_ALBAAB_2026-2027-1.md', 'utf8');

const lines = content.split('\n');

type ClassTotals = Record<string, number>;

const totals: ClassTotals = {
    'MTs Putra': 0,
    'MTs Putri': 0,
    'IL Putri': 0,
    'IL Putra': 0,
    'SMA': 0,
    'UNKNOWN': 0
};

const categories = {
    akamsi: 0,
    'Anak Staff': 0,
    'Lunas': 0
};

let totalUP = 0;
let totalTerkumpul = 0;
let totalSisa = 0;

const parseCurrency = (str: string | undefined): number => {
    if (!str || str.trim() === '-' || str.trim() === '.') return 0;
    // Remove formatting and extract numbers only
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
};

let currentSection = '';

lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('## TABEL DATA LENGKAP')) {
        currentSection = 'MAIN_TABLE';
        return;
    }
    if (trimmedLine.includes('## DATA TAMBAHAN')) {
        currentSection = 'ADDITIONAL_TABLE';
        return;
    }
    if (trimmedLine.startsWith('---') || trimmedLine.includes('REKAP / SUMMARY')) {
        currentSection = '';
        return;
    }

    if (!trimmedLine.startsWith('|') || trimmedLine.includes('---') || trimmedLine.includes('No |')) return;

    if (currentSection === 'MAIN_TABLE' || currentSection === 'ADDITIONAL_TABLE') {
        const parts = trimmedLine.split('|').map(p => p.trim());
        // Filter out empty parts from start/end
        const columns = parts.filter((_, i) => i > 0 && i < parts.length - 1);
        
        if (columns.length < 5) return;

        const name = columns[1];
        const gender = columns[2];
        const kelas = columns[3] || 'UNKNOWN';
        
        // Financial mapping
        let up = 0, angs1 = 0, angs2 = 0, angs3 = 0, angs4 = 0, sisa = 0;
        let ket = '';

        if (currentSection === 'MAIN_TABLE') {
            // Main table: Jumlah UP (4), Angs 1 (5), Angs 2 (6), Angs 3 (7), Angs 4 (8), Sisa (9), Tgl (10), Keterangan (11)
            up = parseCurrency(columns[4]);
            angs1 = parseCurrency(columns[5]);
            angs2 = parseCurrency(columns[6]);
            angs3 = parseCurrency(columns[7]);
            angs4 = parseCurrency(columns[8]);
            sisa = parseCurrency(columns[9]);
            ket = columns[11] || '';
        } else if (currentSection === 'ADDITIONAL_TABLE') {
            // Additional table: Jumlah UP (4), Angs 1 (5), Angs 2 (6), Sisa (7), Tgl (8)
            up = parseCurrency(columns[4]);
            angs1 = parseCurrency(columns[5]);
            angs2 = parseCurrency(columns[6]);
            sisa = parseCurrency(columns[7]);
            // No Keterangan column in Additional Table
            ket = '';
        }

        if (kelas in totals) {
            totals[kelas]++;
        } else {
            console.log(`Unknown class: "${kelas}" for student: ${name}`);
            totals['UNKNOWN']++;
        }

        const ketLower = ket.toLowerCase();
        if (ketLower.includes('akamsi')) categories.akamsi++;
        if (ketLower.includes('anak staff')) categories['Anak Staff']++;
        if (ketLower.includes('lunas')) categories['Lunas']++;

        totalUP += up;
        totalTerkumpul += (angs1 + angs2 + angs3 + angs4);
        totalSisa += sisa;
    }
});

console.log('--- RECALCULATED TOTALS (VERIFIED) ---');
console.log('Totals by Class:', totals);
console.log('Categories:', categories);
console.log('Financials:', {
    totalUP: totalUP.toLocaleString('id-ID'),
    totalTerkumpul: totalTerkumpul.toLocaleString('id-ID'),
    totalSisa: totalSisa.toLocaleString('id-ID'),
    sumCheck: (totalTerkumpul + totalSisa).toLocaleString('id-ID')
});

if (totalTerkumpul + totalSisa !== totalUP) {
    console.warn('WARNING: Total Terkumpul + Sisa does not match Total UP!');
    console.log('Difference:', (totalUP - (totalTerkumpul + totalSisa)).toLocaleString('id-ID'));
} else {
    console.log('SUCCESS: All financial figures are consistent.');
}
