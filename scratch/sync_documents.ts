import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Target directories on the new server
const BASE_STORAGE = "/var/lib/docker/volumes/v48gg0g8go4ww8cwskkww00g_storage-ululalbaab-data/_data";

const DOC_TYPES = [
    "akta_kelahiran",
    "foto_portrait",
    "kartu_keluarga",
    "nisn_surat_keterangan_nisn",
    "pakta_integritas",
    "rapor",
    "surat_kesehatan",
    "surat_keterangan_siswa_aktif",
    "surat_pernyataan",
];

async function syncAll() {
    console.log("🚀 Starting Final Synchronization...");

    const pendaftars = await prisma.pendaftar.findMany({
        where: { deleted_at: null },
        select: { id: true, nomor_pendaftaran: true, tahun_ajaran_id: true }
    });

    let paymentMatches = 0;
    let documentMatches = 0;

    // Advanced matcher to find student by any ID found in filename
    const findPendaftar = (filename: string) => {
        const parts = filename.split("_");
        // Extract all numeric parts that could be IDs
        const possibleIds = parts.map(p => p.split(".")[0]).filter(p => /^\d+$/.test(p));
        
        for (const id of possibleIds) {
            const paddedId = id.padStart(4, "0");
            const found = pendaftars.find(p => p.nomor_pendaftaran.endsWith(paddedId));
            if (found) return found;
        }
        return null;
    };

    // 1. Sync Payments
    const payFolder = path.join(BASE_STORAGE, "pembayaran");
    if (fs.existsSync(payFolder)) {
        const files = fs.readdirSync(payFolder);
        for (const file of files) {
            const target = findPendaftar(file);
            if (target) {
                const dbPath = `pembayaran/${file}`;
                const existingPay = await prisma.pembayaran.findFirst({ where: { pendaftar_id: target.id } });

                if (existingPay) {
                    await prisma.pembayaran.update({
                        where: { id: existingPay.id },
                        data: { bukti_transfer_path: dbPath, status_pembayaran: "verified" }
                    });
                } else {
                    await prisma.pembayaran.create({
                        data: {
                            pendaftar: { connect: { id: target.id } },
                            tahun_ajaran: { connect: { id: target.tahun_ajaran_id } },
                            bukti_transfer_path: dbPath,
                            status_pembayaran: "verified",
                            jumlah: 0,
                            metode_pembayaran: "MANUAL"
                        }
                    });
                }
                paymentMatches++;
            }
        }
    }

    // 2. Sync Documents
    for (const type of DOC_TYPES) {
        const subfolder = path.join(BASE_STORAGE, "dokumen", type);
        if (fs.existsSync(subfolder)) {
            const files = fs.readdirSync(subfolder);
            for (const file of files) {
                const target = findPendaftar(file);
                if (target) {
                    const dbPath = `dokumen/${type}/${file}`;
                    const existingDoc = await prisma.dokumen.findFirst({
                        where: { pendaftar_id: target.id, jenis_dokumen: type }
                    });

                    if (existingDoc) {
                        await prisma.dokumen.update({
                            where: { id: existingDoc.id },
                            data: { file_path: dbPath, file_name: file }
                        });
                    } else {
                        await prisma.dokumen.create({
                            data: {
                                pendaftar: { connect: { id: target.id } },
                                jenis_dokumen: type,
                                file_path: dbPath,
                                file_name: file,
                                is_verified: true
                            }
                        });
                    }
                    documentMatches++;
                }
            }
        }
    }

    console.log(`✅ SYNC COMPLETE!`);
    console.log(`Payments: ${paymentMatches}`);
    console.log(`Documents: ${documentMatches}`);
}

syncAll().catch(console.error).finally(() => prisma.$disconnect());
