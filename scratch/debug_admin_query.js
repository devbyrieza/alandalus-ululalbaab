
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ta = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    
    // Copy the exact filter from getAdminWhereClause
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
        select: { status_pendaftaran: true }
    });

    console.log('Total Pendaftar found by Admin Filter:', data.length);
    
    const counts = data.reduce((acc, p) => {
        acc[p.status_pendaftaran] = (acc[p.status_pendaftaran] || 0) + 1;
        return acc;
    }, {});
    
    console.log('Status Distribution:');
    console.log(counts);
}
check().finally(() => prisma.$disconnect());
