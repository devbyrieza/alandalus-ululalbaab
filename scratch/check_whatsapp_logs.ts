
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkLogs() {
    const names = ["Iklimah", "Nahla"];
    
    for (const name of names) {
        console.log(`\n--- Checking logs for ${name} ---`);
        const pendaftars = await prisma.pendaftar.findMany({
            where: { nama_lengkap: { contains: name } },
            include: {
                whatsapp_logs: {
                    orderBy: { created_at: 'desc' },
                    take: 5
                }
            }
        });

        if (pendaftars.length === 0) {
            console.log(`Pendaftar ${name} not found.`);
            continue;
        }

        for (const pendaftar of pendaftars) {
            console.log(`Name: ${pendaftar.nama_lengkap}, ID: ${pendaftar.id}, Phone: ${pendaftar.no_hp}`);
            if (pendaftar.whatsapp_logs.length === 0) {
                console.log("No WhatsApp logs found.");
            } else {
                pendaftar.whatsapp_logs.forEach(log => {
                    console.log(`[${log.created_at.toISOString()}] Status: ${log.status}, Type: ${log.jenis_notif}, Error: ${log.error_message || 'none'}`);
                });
            }
        }
    }
}

checkLogs().catch(console.error);
