
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const EXCEL_PATH = 'C:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/Update DATA UP 2026-2027.xlsx';
const TAHUN_AJARAN_ID = '11111111-1111-1111-1111-111111111111'; // 2026/2027 confirmed from audit

async function main() {
    console.log('--- Starting Excel Sync into Ulul-Albaab DB ---');

    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Headers are on Row 2 (0-indexed)
    // 0: No, 1: NIS, 2: NISN, 3: Nama Santri, 4: L/P, 5: Kelas, 6: Jumlah Uang Pangkal, 
    // 7: UP (Angs 1), 8: Angs 2, 9: Angs 3, 10: Angs 4, 11: Angs 5, 12: Sisa Pembayaran, 13: Tgl, 14: Ket
    
    const dataRows = rawData.slice(5); // Data starts on Row 5 (0-indexed)
    console.log(`Processing ${dataRows.length} rows from Excel...`);

    let updatedCount = 0;
    let insertedCount = 0;
    let paymentCount = 0;

    for (const row of dataRows) {
        if (!row || row.length < 4 || !row[3]) continue; // Skip empty rows

        const rawNama = row[3].toString().trim();
        const rawKelas = (row[5] || "").toString().trim();
        const rawGender = (row[4] || "").toString().trim();
        
        // MTs Putra, MTs Putri, IL Putra, IL Putri
        const jenjangMap: Record<string, string> = {
            'MTs Putra': 'MTS',
            'MTs Putri': 'MTS',
            'IL Putra': 'IL',
            'IL Putri': 'IL'
        };

        const jenjang = jenjangMap[rawKelas] || rawKelas;
        const gender = rawGender.startsWith('L') ? 'L' : (rawGender.startsWith('P') ? 'P' : rawGender);

        // Try to match existing student
        let pendaftar = await prisma.pendaftar.findFirst({
            where: {
                nama_lengkap: { equals: rawNama, mode: 'insensitive' },
                tahun_ajaran_id: TAHUN_AJARAN_ID,
                deleted_at: null
            }
        });

        if (pendaftar) {
            // Update existing student to 'enrolled'
            await prisma.pendaftar.update({
                where: { id: pendaftar.id },
                data: {
                    status_pendaftaran: 'enrolled',
                    jenjang: jenjang,
                    jenis_kelamin: gender,
                }
            });
            updatedCount++;
        } else {
            // Insert new student
            // Determine prefix for registration number
            let prefix = 'REG';
            if (rawKelas === 'MTs Putra') prefix = 'MTA';
            else if (rawKelas === 'MTs Putri') prefix = 'MTI';
            else if (rawKelas === 'IL Putra') prefix = 'ILA';
            else if (rawKelas === 'IL Putri') prefix = 'ILI';

            // Generate next available registration number
            const lastRecord = await prisma.pendaftar.findFirst({
                where: {
                    nomor_pendaftaran: { startsWith: `${prefix}-2627-` }
                },
                orderBy: { nomor_pendaftaran: 'desc' },
                select: { nomor_pendaftaran: true }
            });

            let nextNum = 1;
            if (lastRecord) {
                const parts = lastRecord.nomor_pendaftaran.split('-');
                const lastNum = parseInt(parts[parts.length - 1]);
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }

            const nomorPendaftaran = `${prefix}-2627-${nextNum.toString().padStart(3, '0')}`;

            pendaftar = await prisma.pendaftar.create({
                data: {
                    tahun_ajaran_id: TAHUN_AJARAN_ID,
                    nomor_pendaftaran: nomorPendaftaran,
                    nama_lengkap: rawNama,
                    status_pendaftaran: 'enrolled',
                    jenjang: jenjang,
                    jenis_kelamin: gender,
                    nik: '0000000000000000' // Default placeholder for required unique-ish field if not exists
                }
            });
            insertedCount++;
        }

        // Process Financials (Pembayaran)
        // Indices: 7: Angs 1, 8: Angs 2, 9: Angs 3, 10: Angs 4, 11: Angs 5
        // Row[6] is Total (Jumlah Uang Pangkal)
        
        const totalUangPankgal = parseFloat(row[6]) || 0;
        const installments = [
            { idx: 7, label: 'Angsuran 1' },
            { idx: 8, label: 'Angsuran 2' },
            { idx: 9, label: 'Angsuran 3' },
            { idx: 10, label: 'Angsuran 4' },
            { idx: 11, label: 'Angsuran 5' }
        ];

        for (let i = 0; i < installments.length; i++) {
            const amount = parseFloat(row[installments[i].idx]) || 0;
            if (amount > 0) {
                // Check if payment already exists
                const existingPayment = await prisma.pembayaran.findFirst({
                    where: {
                        pendaftar_id: pendaftar.id,
                        jenis_pembayaran: 'DAFTAR_ULANG',
                        cicilan_ke: i + 1
                    }
                });

                if (!existingPayment) {
                    await prisma.pembayaran.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            tahun_ajaran_id: TAHUN_AJARAN_ID,
                            metode_pembayaran: 'transfer',
                            jumlah: amount,
                            status_pembayaran: 'verified',
                            jenis_pembayaran: 'DAFTAR_ULANG',
                            cicilan_ke: i + 1,
                            total_tagihan: totalUangPankgal,
                            catatan_verifikasi: `Sync from Excel: ${installments[i].label}`
                        }
                    });
                    paymentCount++;
                }
            }
        }
    }

    console.log(`Sync Complete:`);
    console.log(`- Updated Students: ${updatedCount}`);
    console.log(`- Inserted Students: ${insertedCount}`);
    console.log(`- Payment Records Created: ${paymentCount}`);
}

main()
  .catch((e) => {
    console.error('Sync Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
