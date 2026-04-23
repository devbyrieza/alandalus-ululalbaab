
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkPayments() {
    console.log("--- Listing 20 most recent payments ---");
    const payments = await prisma.pembayaran.findMany({
        take: 20,
        orderBy: { created_at: 'desc' },
        include: {
            pendaftar: {
                select: {
                    nama_lengkap: true,
                    nomor_pendaftaran: true
                }
            }
        }
    });

    payments.forEach(p => {
        console.log(`[${p.created_at.toISOString()}] ${p.pendaftar?.nomor_pendaftaran} | ${p.pendaftar?.nama_lengkap} | Amount: ${p.jumlah} | Status: ${p.status_pembayaran}`);
    });
}

checkPayments().catch(console.error);
