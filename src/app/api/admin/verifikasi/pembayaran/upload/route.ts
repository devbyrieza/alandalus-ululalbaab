import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { saveFileLocal } from "@/lib/storage/local";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check - Explicitly cast to any or check properties to avoid lint errors
        const session = await getServerSession() as any;
        if (!session) {
            return NextResponse.json({ success: false, error: "Sesi telah berakhir, silakan login kembali" }, { status: 401 });
        }

        const allowedRoles = [
            "admin",
            "admin_super",
            "admin_berkas",
            "admin_keuangan",
            "penguji",
            "penguji_calsan",
            "pewawancara_cawalsan",
            "pewawancara_calsan",
            "head_of_it",
            "tim_it"
        ];
        
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ success: false, error: "Anda tidak memiliki akses untuk melakukan upload" }, { status: 403 });
        }

        // 2. Parse Form Data
        let formData;
        try {
            formData = await request.formData();
        } catch (e) {
            console.error("Error parsing form data:", e);
            return NextResponse.json({ success: false, error: "Format data tidak valid" }, { status: 400 });
        }

        const file = formData.get("file") as File;
        const pembayaranId = formData.get("pembayaran_id") as string;

        if (!file) {
            return NextResponse.json({ success: false, error: "File bukti pembayaran belum dipilih" }, { status: 400 });
        }

        if (!pembayaranId) {
            return NextResponse.json({ success: false, error: "ID Pembayaran tidak ditemukan" }, { status: 400 });
        }

        // 4. Find Pembayaran record
        let pembayaran;
        try {
            pembayaran = await prisma.pembayaran.findUnique({
                where: { id: pembayaranId },
                include: { 
                    pendaftar: { 
                        select: { 
                            nomor_pendaftaran: true, 
                            id: true,
                            nama_lengkap: true,
                            no_hp: true
                        } 
                    }
                },
            });
        } catch (dbError: any) {
            console.error("Database error while finding pembayaran:", dbError);
            return NextResponse.json({ success: false, error: "Gagal mengakses database untuk data pembayaran" }, { status: 500 });
        }

        if (!pembayaran) {
            return NextResponse.json({ success: false, error: "Data pembayaran tidak ditemukan" }, { status: 404 });
        }

        if (!pembayaran.pendaftar) {
            console.error(`Pendaftar linked to pembayaran ${pembayaranId} is missing or has incomplete data`);
            return NextResponse.json({ success: false, error: "Data pendaftar terkait tidak ditemukan" }, { status: 400 });
        }

        // 5. Save file
        let filePath = "";
        try {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').replace('T', '_');
            const originalName = file.name || "bukti_transfer";
            const fileExtension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
            const fileName = `admin-upload-${pembayaran.pendaftar.nomor_pendaftaran}-${timestamp}.${fileExtension}`;

            console.log(`[Upload-API] Attempting to save file for ${pembayaran.pendaftar.nomor_pendaftaran}`);
            filePath = await saveFileLocal(file, 'bukti-pembayaran', pembayaran.pendaftar.id, fileName);
            console.log(`[Upload-API] File saved successfully at: ${filePath}`);
        } catch (storageError: any) {
            console.error("Storage error during upload:", storageError);
            return NextResponse.json({ 
                success: false, 
                error: `Gagal menyimpan file: ${storageError.message || "Izin tulis ditolak atau folder tidak tersedia"}` 
            }, { status: 500 });
        }

        // 6. Update Database
        try {
            await prisma.$transaction([
                prisma.pembayaran.update({
                    where: { id: pembayaranId },
                    data: {
                        bukti_transfer_path: filePath,
                        bukti_transfer_filename: file.name,
                        status_pembayaran: "verified",
                        verified_by: session.id,
                        verified_at: new Date(),
                        catatan_verifikasi: "Diunggah dan diverifikasi otomatis oleh Admin",
                        updated_at: new Date(),
                    },
                }),

                prisma.pendaftar.update({
                    where: { id: pembayaran.pendaftar_id },
                    data: {
                        status_pendaftaran: "verified",
                        updated_at: new Date()
                    }
                })
            ]);
            console.log(`[Upload-API] Successfully updated database for payment ${pembayaranId}`);
        } catch (updateError: any) {
            console.error("Database update error:", updateError);
            return NextResponse.json({ 
                success: false, 
                error: `Gagal memperbarui status di database: ${updateError.message}` 
            }, { status: 500 });
        }

        // 7. Log Action
        try {
            logAdminAction({
                action: 'UPLOAD_PAYMENT_PROOF',
                adminId: session?.id || 'system',
                adminName: session?.full_name || 'Admin',
                targetId: pembayaran.pendaftar.id,
                targetName: pembayaran.pendaftar.nama_lengkap,
                details: { 
                    pembayaran_id: pembayaranId,
                    file_path: filePath
                }
            });
        } catch (logError) {
            console.error("[Upload-API] Warning: Failed to log admin action:", logError);
            // Non-critical, continue
        }

        // 8. Send WhatsApp notification
        try {
            const { pendaftar } = pembayaran;
            if (pendaftar?.no_hp) {
                const { notifyPaymentVerified } = await import("@/lib/wablas");
                await notifyPaymentVerified({
                    phone: pendaftar.no_hp,
                    nama: pendaftar.nama_lengkap,
                    jumlah: `Rp ${parseInt(pembayaran.jumlah.toString()).toLocaleString('id-ID')}`,
                    metode: pembayaran.metode_pembayaran,
                    tanggal: new Date(pembayaran.created_at).toLocaleDateString('id-ID'),
                    status: "verified",
                    catatan: "Diunggah dan diverifikasi otomatis oleh Admin",
                });
                console.log(`[Upload-API] WhatsApp notification sent to ${pendaftar.no_hp}`);
            }
        } catch (waError) {
            console.error("[Upload-API] Warning: Failed to send WhatsApp notification:", waError);
            // Non-critical, continue
        }

        return NextResponse.json({ 
            success: true, 
            message: "[SUCCESS-V2] Bukti pembayaran berhasil diunggah dan diverifikasi",
            path: filePath
        });

    } catch (error: any) {
        console.error("[Upload-API] ❌ Critical error in admin upload:", error);
        
        // Ensure we always return JSON even on critical failure
        return NextResponse.json({ 
            success: false, 
            error: `[FIX-STORAGE-V2] Kesalahan sistem: ${error.message || 'Unknown error'}` 
        }, { status: 500 });
    }
}
