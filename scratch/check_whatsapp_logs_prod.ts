
import { PrismaClient } from "@prisma/client";

// Manually set the production DATABASE_URL for diagnostics
const DATABASE_URL = "postgresql://admin_ulul:password123@72.61.141.50:5436/db_ululalbaab_prod";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

async function checkById() {
    const ids = ["MTA2600001", "MTA2600002"];
    
    for (const id of ids) {
        console.log(`\n--- Checking pendaftar ${id} in PRODUCTION ---`);
        const pendaftar = await prisma.pendaftar.findFirst({
            where: { nomor_pendaftaran: id },
            include: {
                whatsapp_logs: {
                    orderBy: { created_at: 'desc' },
                    take: 5
                }
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
