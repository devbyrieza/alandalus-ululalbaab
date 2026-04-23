
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const allCount = await prisma.pendaftar.count({ where: { deleted_at: null } });
    console.log('Total Pendaftar (Non-Deleted):', allCount);

    const taId = '11111111-1111-1111-1111-111111111111';
    const matchTA = await prisma.pendaftar.count({ where: { tahun_ajaran_id: taId, deleted_at: null } });
    console.log('Match TA (2026/2027):', matchTA);

    const noTA = await prisma.pendaftar.count({ where: { tahun_ajaran_id: null, deleted_at: null } });
    console.log('No Tahun Ajaran ID:', noTA);

    const others = await prisma.pendaftar.findMany({
        where: { 
            NOT: { tahun_ajaran_id: taId },
            tahun_ajaran_id: { not: null },
            deleted_at: null 
        },
        select: { tahun_ajaran_id: true }
    });
    console.log('Other TA IDs Count:', others.length);
    if (others.length > 0) {
        console.log('Sample Other TA ID:', others[0].tahun_ajaran_id);
    }
}
check().finally(() => prisma.$disconnect());
