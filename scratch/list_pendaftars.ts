
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAll() {
    console.log("--- Listing all pendaftars ---");
    const pendaftars = await prisma.pendaftar.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
            nama_lengkap: true,
            nomor_pendaftaran: true,
            created_at: true,
            status_pendaftaran: true,
            deleted_at: true
        }
    });

    pendaftars.forEach(p => {
        console.log(`${p.nomor_pendaftaran} | ${p.nama_lengkap} | ${p.status_pendaftaran} | Deleted: ${p.deleted_at}`);
    });
}

checkAll().catch(console.error);
