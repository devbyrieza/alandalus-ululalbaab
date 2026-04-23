
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkByIdPattern() {
    console.log("--- Checking pendaftars matching MTA26% ---");
    const pendaftars = await prisma.pendaftar.findMany({
        where: { nomor_pendaftaran: { startsWith: 'MTA26' } },
        include: {
            whatsapp_logs: true
        }
    });

    if (pendaftars.length === 0) {
        console.log("No pendaftars found matching MTA26%.");
        return;
    }

    for (const p of pendaftars) {
        console.log(`\nName: ${p.nama_lengkap}, ID: ${p.nomor_pendaftaran}`);
        p.whatsapp_logs.forEach(log => {
            console.log(`[${log.created_at.toISOString()}] Status: ${log.status}, Type: ${log.jenis_notif}`);
        });
    }
}

checkByIdPattern().catch(console.error);
