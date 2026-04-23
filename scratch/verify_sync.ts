
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification After Sync ---');

    const smaCount = await prisma.pendaftar.count({
        where: { jenjang: 'SMA', deleted_at: null }
    });
    console.log(`Active SMA records: ${smaCount} (Expected: 0)`);

    const enrolledCount = await prisma.pendaftar.count({
        where: { status_pendaftaran: 'enrolled', deleted_at: null }
    });
    console.log(`Active Enrolled records: ${enrolledCount}`);

    const prefixes = ['MTA', 'MTI', 'ILA', 'ILI'];
    for (const prefix of prefixes) {
        const count = await prisma.pendaftar.count({
            where: { nomor_pendaftaran: { startsWith: prefix } }
        });
        console.log(`Count for prefix ${prefix}: ${count}`);
    }

    const paymentCount = await prisma.pembayaran.count({
        where: { jenis_pembayaran: 'DAFTAR_ULANG' }
    });
    console.log(`Financial (DAFTAR_ULANG) records: ${paymentCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
