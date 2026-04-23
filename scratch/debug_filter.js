
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    console.log('Active TA:', ta.nama, ta.id);

    // 1. Raw Count
    const rawCount = await prisma.pendaftar.count({
        where: { tahun_ajaran_id: ta.id }
    });
    console.log('Raw Count (All in TA):', rawCount);

    // 2. Filtered by deleted_at
    const nonDeletedCount = await prisma.pendaftar.count({
        where: { tahun_ajaran_id: ta.id, deleted_at: null }
    });
    console.log('Non-Deleted Count:', nonDeletedCount);

    // 3. Filtered by "Tes" names
    const filteredCount = await prisma.pendaftar.count({
        where: {
            tahun_ajaran_id: ta.id,
            deleted_at: null,
            NOT: [
                {
                    AND: [
                        { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
                        { NOT: { nama_lengkap: { contains: "Rieza Tes", mode: "insensitive" } } }
                    ]
                },
                { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
                { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
            ]
        }
    });
    console.log('Final Filtered Count (Admin Logic):', filteredCount);

    // Check status of those who are filtered out
    const filteredOut = await prisma.pendaftar.findMany({
        where: {
            tahun_ajaran_id: ta.id,
            deleted_at: null,
            OR: [
                {
                    AND: [
                        { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
                        { NOT: { nama_lengkap: { contains: "Rieza Tes", mode: "insensitive" } } }
                    ]
                },
                { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
                { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
            ]
        },
        select: { nama_lengkap: true, status_pendaftaran: true }
    });
    console.log('\nSamples of Filtered Out Students (Non-Deleted):', filteredOut.length);
    console.log(filteredOut.slice(0, 10));
}
check().finally(() => prisma.$disconnect());
