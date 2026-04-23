
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TA_ID = '11111111-1111-1111-1111-111111111111';

async function main() {
    // Replicate where clause from API
    // (Simplified, assuming no names triggered filters)
    const where = {
        tahun_ajaran_id: TA_ID,
        deleted_at: null,
    };

    const data = await prisma.pendaftar.findMany({
        where,
        select: { status_pendaftaran: true }
    });

    console.log('Total Records found:', data.length);
    
    const counts: Record<string, number> = {};
    data.forEach(d => {
        counts[d.status_pendaftaran] = (counts[d.status_pendaftaran] || 0) + 1;
    });

    console.log('Status Counts:', JSON.stringify(counts, null, 2));

    const totalLunas = (counts.paid || 0) + (counts.verified || 0) + (counts.enrolled || 0) + (counts.accepted || 0);
    console.log('Calculated Lunas (Partial):', totalLunas);
}

main().catch(console.error).finally(() => prisma.$disconnect());
