
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- Distribusi Status Pendaftaran ---');
    const stats = await prisma.pendaftar.groupBy({
        by: ['status_pendaftaran'],
        _count: { id: true }
    });
    console.log(stats);

    console.log('\n--- Daftar Tahun Ajaran ---');
    const tas = await prisma.tahunAjaran.findMany();
    console.log(tas.map(t => ({ id: t.id, nama: t.nama, is_active: t.is_active })));

    console.log('\n--- Pendaftar per Tahun Ajaran ---');
    const taStats = await prisma.pendaftar.groupBy({
        by: ['tahun_ajaran_id'],
        _count: { id: true }
    });
    for (const s of taStats) {
        const ta = tas.find(t => t.id === s.tahun_ajaran_id);
        console.log(`${ta ? ta.nama : 'Unknown'} (${s.tahun_ajaran_id}): ${s._count.id} pendaftar`);
    }

    // Check specific counts for the active year
    const activeTA = tas.find(t => t.is_active);
    if (activeTA) {
        console.log(`\n--- Statistik untuk TA Aktif: ${activeTA.nama} ---`);
        const pendaftarActive = await prisma.pendaftar.findMany({
            where: { tahun_ajaran_id: activeTA.id }
        });
        console.log(`Total: ${pendaftarActive.length}`);
        const statusCounts = pendaftarActive.reduce((acc, p) => {
            acc[p.status_pendaftaran] = (acc[p.status_pendaftaran] || 0) + 1;
            return acc;
        }, {});
        console.log(statusCounts);
    }
}
check().finally(() => prisma.$disconnect());
