import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function findPendaftar() {
    const phoneToSearch = '85111524441';
    console.log(`🔍 Searching for phone/NIK containing ${phoneToSearch}...`);
    
    // Find all pendaftar where phone contains or NIK contains
    const pendaftars = await prisma.pendaftar.findMany({
        where: {
            OR: [
                { no_hp: { contains: phoneToSearch } },
                { nik: { contains: phoneToSearch } }
            ]
        },
        orderBy: { created_at: 'desc' }
    });

    console.log(`📊 Found ${pendaftars.length} records in pendaftar table:`);
    pendaftars.forEach(p => {
        console.log(`- ID: ${p.id}`);
        console.log(`  Nomor: ${p.nomor_pendaftaran}`);
        console.log(`  Nama: ${p.nama_lengkap}`);
        console.log(`  NIK: ${p.nik}`);
        console.log(`  Phone: ${p.no_hp}`);
        console.log(`  Type: ${p.tipe_pendaftaran}`);
        console.log(`  Status: ${p.status_pendaftaran}`);
        console.log(`  Deleted At: ${p.deleted_at}`);
        console.log("-------------------");
    });
}

findPendaftar()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
