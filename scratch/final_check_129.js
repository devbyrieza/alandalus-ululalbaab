
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    
    const where = {
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
    };

    const data = await prisma.pendaftar.findMany({
        where,
        select: { status_pendaftaran: true, jenjang: true, nama_lengkap: true }
    });

    console.log(`Total yang lolos filter Admin: ${data.length}`);
    
    const breakdown = data.reduce((acc, p) => {
        const j = (p.jenjang || 'UNKNOWN').toUpperCase();
        acc[j] = (acc[j] || 0) + 1;
        return acc;
    }, {});
    console.log('\nJumlah per Jenjang (Lolos Filter):');
    console.log(breakdown);

    const statusDist = data.reduce((acc, p) => {
        acc[p.status_pendaftaran] = (acc[p.status_pendaftaran] || 0) + 1;
        return acc;
    }, {});
    console.log('\nDistribusi Status (Lolos Filter):');
    console.log(statusDist);
}
check().finally(() => prisma.$disconnect());
