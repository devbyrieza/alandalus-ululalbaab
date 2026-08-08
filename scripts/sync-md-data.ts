import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const mdPath = path.join(process.cwd(), 'DATA_SANTRI_ULUL_ALBAAB_2027-2028-1.md');
    if (!fs.existsSync(mdPath)) {
        console.error('Markdown file not found:', mdPath);
        process.exit(1);
    }

    const content = fs.readFileSync(mdPath, 'utf8');
    const lines = content.split('\n');

    const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!activeTA) {
        console.error('No active Tahun Ajaran found.');
        process.exit(1);
    }

    console.log(`Synchronizing for Tahun Ajaran: ${activeTA.nama} (${activeTA.id})`);

    const parseCurrency = (str: string) => {
        if (!str || str.trim() === '-' || str.trim() === '.') return 0;
        const cleaned = str.replace(/[^\d]/g, '');
        return parseInt(cleaned) || 0;
    };

    const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

    let currentSection = '';
    const studentsToSync: any[] = [];

    lines.forEach(line => {
        if (line.includes('## TABEL DATA LENGKAP')) {
            currentSection = 'MAIN_TABLE';
            return;
        }
        if (line.includes('## DATA TAMBAHAN')) {
            currentSection = 'ADDITIONAL_TABLE';
            return;
        }
        if (line.startsWith('---') || line.includes('REKAP / SUMMARY')) {
            currentSection = '';
            return;
        }

        if (!line.startsWith('|') || line.includes('---') || line.includes('No |')) return;

        if (currentSection === 'MAIN_TABLE' || currentSection === 'ADDITIONAL_TABLE') {
            const parts = line.split('|').map(p => p.trim());
            const columns = parts.filter((_, i) => i > 0 && i < parts.length - 1);
            
            if (columns.length < 5) return;

            const name = columns[1];
            const gender = columns[2].toUpperCase(); // L / P
            const kelas = columns[3];
            const angs1 = currentSection === 'MAIN_TABLE' ? parseCurrency(columns[5]) : parseCurrency(columns[5]);
            
            studentsToSync.push({
                name,
                gender,
                kelas,
                hasPayment: angs1 > 0
            });
        }
    });

    console.log(`Parsed ${studentsToSync.length} students from Markdown.`);

    const results = {
        updated: 0,
        notFound: [] as string[],
        alreadyEnrolled: 0,
        errors: 0
    };

    for (const student of studentsToSync) {
        const dbStudent = await prisma.pendaftar.findFirst({
            where: {
                tahun_ajaran_id: activeTA.id,
                nama_lengkap: {
                    equals: student.name,
                    mode: 'insensitive'
                },
                jenis_kelamin: student.gender !== '-' ? student.gender : undefined
            }
        });

        if (dbStudent) {
            if (dbStudent.status_pendaftaran === 'enrolled') {
                results.alreadyEnrolled++;
            } else if (student.hasPayment) {
                try {
                    await prisma.pendaftar.update({
                        where: { id: dbStudent.id },
                        data: { 
                            status_pendaftaran: 'enrolled',
                            // Optional: synchronize jenjang if needed
                            // jenjang: student.kelas.includes('MTs') ? 'MTS' : student.kelas.includes('IL') ? 'IL' : undefined
                        }
                    });
                    results.updated++;
                } catch (e) {
                    console.error(`Error updating ${student.name}:`, e);
                    results.errors++;
                }
            }
        } else {
            results.notFound.push(`${student.name} (${student.gender})`);
        }
    }

    console.log('\n--- SYNC RESULTS ---');
    console.log('Successfully Updated to Enrolled:', results.updated);
    console.log('Already Enrolled in DB:', results.alreadyEnrolled);
    console.log('Students Not Found in DB:', results.notFound.length);
    console.log('Errors:', results.errors);

    if (results.notFound.length > 0) {
        console.log('\nNot Found List:');
        results.notFound.forEach(n => console.log(`- ${n}`));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
