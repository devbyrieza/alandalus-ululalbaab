
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const p = await prisma.pendaftar.findMany({
        where: { status_pendaftaran: 'enrolled' },
        take: 20,
        select: { nama_lengkap: true, tahun_ajaran_id: true, deleted_at: true }
    });
    console.log('Sample Enrolled Students:');
    console.log(p);

    const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    console.log('\nActive TA ID:', ta.id);

    const countMatches = await prisma.pendaftar.count({
        where: {
            status_pendaftaran: 'enrolled',
            tahun_ajaran_id: ta.id,
            deleted_at: null
        }
    });
    console.log('\nCount Enrolled in Active TA (Non-Deleted):', countMatches);
}
check().finally(() => prisma.$disconnect());
