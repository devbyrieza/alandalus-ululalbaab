
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    
    // Filter specifically for the 3 active levels
    const validJenjang = ['MTS', 'IL', 'SMA'];
    
    const data = await prisma.pendaftar.findMany({
        where: {
            tahun_ajaran_id: ta.id,
            deleted_at: null,
            jenjang: { in: validJenjang }
        },
        select: { status_pendaftaran: true, jenjang: true }
    });

    console.log(`Total Pendaftar di Jenjang Aktif (MTs, IL, SMA): ${data.length}`);
    
    const breakdown = data.reduce((acc, p) => {
        const j = p.jenjang.toUpperCase();
        if (!acc[j]) acc[j] = {};
        acc[j][p.status_pendaftaran] = (acc[j][p.status_pendaftaran] || 0) + 1;
        return acc;
    }, {});
    
    console.log('\nBreakdown Status per Jenjang:');
    console.log(JSON.stringify(breakdown, null, 2));

    const totalStats = data.reduce((acc, p) => {
        acc[p.status_pendaftaran] = (acc[p.status_pendaftaran] || 0) + 1;
        return acc;
    }, {});
    console.log('\nTotal Status Distribution (from 129 people):');
    console.log(totalStats);
}
check().finally(() => prisma.$disconnect());
