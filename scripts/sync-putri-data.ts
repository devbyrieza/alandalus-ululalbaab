import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'Data_Santri_Putri_UlulAlbaab_2027-2028.xlsx');
    const workbook = XLSX.readFile(filePath);
    
    const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!activeTA) {
        console.error('No active Tahun Ajaran found.');
        process.exit(1);
    }

    const sheets = ['MTs Putri', 'IL Putri'];
    
    const results = {
        updated: 0,
        notFound: [] as string[],
        skippedEnrolled: 0,
        errors: 0
    };

    const parseCurrency = (val: any) => {
        if (!val) return 0;
        const cleaned = val.toString().replace(/[^\d]/g, '');
        return parseInt(cleaned, 10) || 0;
    };

    const gradeToScore = (grade: string): number => {
        const g = (grade || '').toString().toUpperCase().trim();
        if (g === 'A') return 4;
        if (g === 'B') return 3;
        if (g === 'C') return 2;
        if (g === 'D') return 1;
        return 0;
    };

    for (const sheetName of sheets) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;
        
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const rows = data.slice(4); // Data starts at row 4 (index 4)

        console.log(`Processing ${rows.length} rows from ${sheetName}...`);

        for (const row of rows) {
            const np = row[1]; // No. Pendaftaran
            const name = row[2]; // Nama Santri
            const quran = row[4];
            const akademik = row[5];
            const kepribadian = row[6];
            const kesesuaian = row[7];
            const kesiapan = row[8];
            const statusTes = row[9];
            const angs1 = parseCurrency(row[11]);
            const statusUP = row[16];

            if (!np) continue;

            const pendaftar = await prisma.pendaftar.findFirst({
                where: {
                    nomor_pendaftaran: np,
                    tahun_ajaran_id: activeTA.id
                }
            });

            if (!pendaftar) {
                results.notFound.push(`${np} - ${name}`);
                continue;
            }

            try {
                // 1. Refine Name
                await prisma.pendaftar.update({
                    where: { id: pendaftar.id },
                    data: { nama_lengkap: name }
                });

                // 2. Update NilaiUjian
                const scores = [quran, akademik, kepribadian, kesesuaian, kesiapan].filter(g => g && g !== '-');
                if (scores.length > 0) {
                    const totalScore = scores.reduce((sum, g) => sum + gradeToScore(g), 0) / scores.length;
                    
                    const existingNilai = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id: pendaftar.id } });
                    const dataNilai = {
                        detail_quran: { grade: quran },
                        detail_akademik: { grade: akademik },
                        detail_kepribadian: { grade: kepribadian },
                        detail_wawancara: { grade: kesesuaian },
                        detail_kesiapan: { grade: kesiapan },
                        status_kelulusan: 'DITERIMA',
                        total_score: totalScore
                    };

                    if (existingNilai) {
                        await prisma.nilaiUjian.update({ where: { id: existingNilai.id }, data: dataNilai });
                    } else {
                        await prisma.nilaiUjian.create({ data: { ...dataNilai, pendaftar_id: pendaftar.id } });
                    }
                }

                // 3. Update Status
                const currentStatus = pendaftar.status_pendaftaran;
                let targetStatus = currentStatus;

                if (statusUP && (statusUP.toString().includes('Lunas') || angs1 > 0)) {
                    targetStatus = 'enrolled';
                } else if (statusTes && statusTes.toString().includes('Sudah')) {
                    if (!['enrolled'].includes(currentStatus)) {
                        targetStatus = 'accepted';
                    }
                }

                if (targetStatus !== currentStatus) {
                    await prisma.pendaftar.update({
                        where: { id: pendaftar.id },
                        data: { status_pendaftaran: targetStatus }
                    });
                    results.updated++;
                } else if (currentStatus === 'enrolled') {
                    results.skippedEnrolled++;
                }

            } catch (e) {
                console.error(`Error processing ${np}:`, e);
                results.errors++;
            }
        }
    }

    console.log('\n--- PUTRI DATA SYNC COMPLETED ---');
    console.log('Pendaftar status updated/upgraded:', results.updated);
    console.log('Pendaftar already "enrolled":', results.skippedEnrolled);
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
