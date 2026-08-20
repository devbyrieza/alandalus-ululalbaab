import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), '3. KANGGE SK Penerimaan santri baru 2027/2028 2.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'SK Penerimaan Santri';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Headers are at row 0
    const rows = data.slice(1); // Actual data starts from row 1

    console.log(`Processing ${rows.length} rows from ${sheetName}...`);

    const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!activeTA) {
        console.error('No active Tahun Ajaran found.');
        process.exit(1);
    }

    const results = {
        updated: 0,
        notFound: [] as string[],
        skippedEnrolled: 0,
        errors: 0
    };

    const gradeToScore = (grade: string): number => {
        const g = (grade || '').toString().toUpperCase().trim();
        if (g === 'A') return 4;
        if (g === 'B') return 3;
        if (g === 'C') return 2;
        if (g === 'D') return 1;
        return 0;
    };

    for (const row of rows) {
        const np = row[4]; // No. Pendaftar
        const name = row[5]; // Nama Lengkap
        const quran = row[9];
        const akademik = row[10];
        const kepribadian = row[11];
        const kesesuaian = row[12];
        const kesiapan = row[13];

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
            // Update or Create NilaiUjian
            const totalScore = (gradeToScore(quran) + gradeToScore(akademik) + gradeToScore(kepribadian) + gradeToScore(kesesuaian) + gradeToScore(kesiapan)) / 5;

            const existingNilai = await prisma.nilaiUjian.findFirst({
                where: { pendaftar_id: pendaftar.id }
            });

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
                await prisma.nilaiUjian.update({
                    where: { id: existingNilai.id },
                    data: dataNilai
                });
            } else {
                await prisma.nilaiUjian.create({
                    data: {
                        ...dataNilai,
                        pendaftar_id: pendaftar.id
                    }
                });
            }

            // Update Status if not already enrolled
            const currentStatus = pendaftar.status_pendaftaran;
            const updatableStatuses = ['draft', 'verified', 'tested', 'scheduled', 'announced', 'payment_verification', 'payment_rejected', 'data_completed', 'docs_uploaded', 'docs_verified'];
            
            if (updatableStatuses.includes(currentStatus)) {
                await prisma.pendaftar.update({
                    where: { id: pendaftar.id },
                    data: { status_pendaftaran: 'accepted' }
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

    console.log('\n--- SK DECREE SYNC COMPLETED ---');
    console.log('Successfully Updated with Grades:', rows.length - results.notFound.length - results.errors);
    console.log('Pendaftar upgraded to "accepted":', results.updated);
    console.log('Pendaftar already "enrolled" (kept):', results.skippedEnrolled);
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
