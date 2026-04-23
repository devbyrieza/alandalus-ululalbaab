
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkById() {
    const ids = ["MTA2600001", "MTA2600002"];
    
    for (const id of ids) {
        console.log(`\n--- Checking pendaftar ${id} ---`);
        const pendaftar = await prisma.pendaftar.findFirst({
            where: { nomor_pendaftaran: id },
            include: {
                whatsapp_logs: true
            }
        });

        if (!pendaftar) {
            console.log(`Pendaftar ${id} not found.`);
            continue;
        }

        console.log(`Name: ${pendaftar.nama_lengkap}, Status: ${pendaftar.status_pendaftaran}`);
        if (pendaftar.whatsapp_logs.length === 0) {
            console.log("No WhatsApp logs found.");
        } else {
            pendaftar.whatsapp_logs.forEach(log => {
                console.log(`[${log.created_at.toISOString()}] Status: ${log.status}, Type: ${log.jenis_notif}, Error: ${log.error_message || 'none'}`);
            });
        }
    }
}

checkById().catch(console.error);
