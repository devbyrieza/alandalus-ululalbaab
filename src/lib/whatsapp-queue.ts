/**
 * WhatsApp Queue Service — 6-Layer Anti-BAN Protection
 */

import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/wablas";

// ============================================================================
// TYPES
// ============================================================================

export type NotifType =
    | "jadwal_belum"
    | "jadwal_tersedia"
    | "jadwal_langsung_tersedia"
    | "konfirmasi_jadwal"
    | "konfirmasi_jadwal_interviewer"
    | "reminder_h1"
    | "reminder_h1_penguji"
    | "reminder_h0"
    | "hasil_tes"
    | "registration_success"
    | "document_verified"
    | "document_rejected"
    | "payment_verified"
    | "payment_rejected"
    | "broadcast"
    | "pembatalan_jadwal";

export interface EnqueueParams {
    pendaftarId: string;
    phone: string;
    jenisNotif: NotifType;
    messageContent: string;
    scheduledAt?: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_MESSAGES_PER_HOUR = 120;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_APP_URL = 'https://ppdb.ululalbaab.net';

// ============================================================================
// LAYER 1: Anti-Duplicate
// ============================================================================

async function isDuplicate(
    pendaftarId: string,
    jenisNotif: NotifType,
    phone: string
): Promise<boolean> {
    const flagMap: Partial<Record<NotifType, string>> = {
        jadwal_belum: "notif_belum_jadwal_terkirim",
        jadwal_tersedia: "notif_jadwal_tersedia_terkirim",
        jadwal_langsung_tersedia: "notif_jadwal_tersedia_terkirim",
        hasil_tes: "notif_hasil_tes_terkirim",
    };

    const flagColumn = flagMap[jenisNotif];
    if (flagColumn) {
        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: {
                notif_belum_jadwal_terkirim: true,
                notif_jadwal_tersedia_terkirim: true,
                notif_hasil_tes_terkirim: true,
            },
        });

        if (pendaftar) {
            const flagValue = pendaftar[flagColumn as keyof typeof pendaftar] as boolean;
            if (flagValue) return true;
        }
    }

    const recentWindow = new Date(Date.now() - 48 * 60 * 60 * 1000); 

    const existingLog = await prisma.whatsappLog.findFirst({
        where: {
            pendaftar_id: pendaftarId,
            phone: phone,
            jenis_notif: jenisNotif,
            status: { in: ["pending", "processing", "sent"] },
            created_at: { gte: recentWindow }
        },
    });

    return !!existingLog;
}

// ============================================================================
// MAIN: Enqueue & Process
// ============================================================================

export async function enqueueWhatsapp(
    params: EnqueueParams
): Promise<{ queued: boolean; reason?: string; logId?: string }> {
    const { pendaftarId, phone, jenisNotif, messageContent, scheduledAt } = params;

    if (await isDuplicate(pendaftarId, jenisNotif, phone)) {
        return { queued: false, reason: "Duplicate" };
    }

    const log = await prisma.whatsappLog.create({
        data: {
            pendaftar_id: pendaftarId,
            phone,
            jenis_notif: jenisNotif,
            status: "pending",
            message_content: messageContent,
            scheduled_at: scheduledAt || new Date(),
        },
    });

    return { queued: true, logId: log.id };
}

export async function processWhatsappQueue(): Promise<{
    processed: boolean;
    logId?: string;
    status?: string;
    reason?: string;
}> {
    const now = new Date();
    const pendingMessage = await prisma.whatsappLog.findFirst({
        where: {
            status: "pending",
            scheduled_at: { lte: now },
            attempt_count: { lt: MAX_RETRY_ATTEMPTS },
        },
        orderBy: { scheduled_at: "asc" },
    });

    if (!pendingMessage) return { processed: false, reason: "Antrian kosong" };

    await prisma.whatsappLog.update({
        where: { id: pendingMessage.id },
        data: {
            status: "processing",
            attempt_count: { increment: 1 },
            updated_at: now,
        },
    });

    try {
        const result = await sendMessage({
            phone: pendingMessage.phone,
            message: pendingMessage.message_content || "",
        });

        if (result.status) {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status: "sent",
                    sent_at: new Date(),
                    response_data: JSON.stringify(result.data),
                    updated_at: new Date(),
                },
            });

            if (pendingMessage.pendaftar_id) {
                await updateNotifFlag(pendingMessage.pendaftar_id, pendingMessage.jenis_notif as NotifType);
            }

            return { processed: true, logId: pendingMessage.id, status: "sent" };
        } else {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status: pendingMessage.attempt_count + 1 >= MAX_RETRY_ATTEMPTS ? "failed" : "pending",
                    failed_at: new Date(),
                    error_message: result.message,
                    updated_at: new Date(),
                },
            });

            return { processed: true, logId: pendingMessage.id, status: "failed", reason: result.message };
        }
    } catch (error: any) {
        await prisma.whatsappLog.update({
            where: { id: pendingMessage.id },
            data: { status: "failed", failed_at: new Date(), error_message: error.message, updated_at: new Date() },
        });
        return { processed: true, logId: pendingMessage.id, status: "error", reason: error.message };
    }
}

async function updateNotifFlag(
    pendaftarId: string,
    jenisNotif: NotifType
): Promise<void> {
    const flagMap: Partial<Record<NotifType, string>> = {
        jadwal_belum: "notif_belum_jadwal_terkirim",
        jadwal_tersedia: "notif_jadwal_tersedia_terkirim",
        jadwal_langsung_tersedia: "notif_jadwal_tersedia_terkirim",
        hasil_tes: "notif_hasil_tes_terkirim",
    };

    const flagColumn = flagMap[jenisNotif];
    if (!flagColumn) return;

    try {
        await prisma.pendaftar.update({
            where: { id: pendaftarId },
            data: { [flagColumn]: true },
        });
    } catch (e) {
        console.error(`Failed to update flag ${flagColumn}:`, e);
    }
}

// ============================================================================
// LAYER 6: Natural Message Builders
// ============================================================================

export function buildMessageKonfirmasiJadwal(
    nama: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `*KONFIRMASI JADWAL*

Assalamu'alaikum *${nama}*,

Jadwal ${jenisUjian} Anda telah terkonfirmasi:

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${waktu}
📍 *Tempat:* ${lokasi}

Persiapan:
- Hadir 30 menit sebelum waktu tes
- Berpakaian sopan dan rapi
- Bawa alat tulis

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageKonfirmasiJadwalInterviewer(
    namaInterviewer: string,
    namaSantri: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string,
    magicLink: string
): string {
    const title = namaInterviewer.toLowerCase().includes("ustadzah") ? "Ustadzah" : "Ustadz";
    
    return `*KONFIRMASI JADWAL MENGUJI*

Assalamu'alaikum ${title} *${namaInterviewer}*,

Jadwal ${jenisUjian} Anda telah terkonfirmasi:

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${waktu}
👤 *Nama Santri:* ${namaSantri}
📍 *Tempat:* ${lokasi}

🔗 *Input Hasil:* ${magicLink}

Mohon kehadirannya tepat waktu. Syukron.

---
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageReminderH1Santri(
    nama: string,
    hari: string,
    tanggal: string,
    jam: string,
    lokasi: string,
    jenisUjian: string
): string {
    // Robust deduplication for Time - remove any existing WIB and ensure single WIB at end
    let cleanJam = (jam || "").replace(/\s*WIB\s*/gi, " ").trim();
    cleanJam = cleanJam.replace(/\s+/g, " "); // collapse multiple spaces
    const finalJam = `${cleanJam} WIB`;

    // Robust deduplication for Day - handle various formats
    let cleanTanggal = (tanggal || "").trim();
    // Remove day name if it appears at the start (case insensitive, with or without comma)
    if (hari) {
        const dayPattern = new RegExp(`^${hari}\\s*,?\\s*`, "i");
        cleanTanggal = cleanTanggal.replace(dayPattern, "");
    }
    // Also remove any day name pattern at the start (e.g., "Kamis, ")
    cleanTanggal = cleanTanggal.replace(/^(?:senin|selasa|rabu|kamis|jumat|sabtu|ahad|minggu)\s*,?\s*/i, "");

    const finalHariTanggal = `${hari}, ${cleanTanggal}`;

    return `*PENGINGAT UJIAN SELEKSI*

Assalamu'alaikum *${nama}*,

Ini adalah pengingat bahwa Anda dijadwalkan mengikuti *${jenisUjian}* pada:

📅 *Hari/Tanggal:* ${finalHariTanggal}
⏰ *Waktu:* ${finalJam}
📍 *Lokasi/Link:* ${lokasi}

Mohon persiapkan diri dengan baik dan pastikan koneksi internet stabil jika ujian online. Sampai jumpa!

---
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageReminderH1Penguji(
    namaPenguji: string,
    namaSantri: string,
    hari: string,
    tanggal: string,
    jam: string,
    lokasi: string,
    jenisUjian: string,
    inputNilaiLink?: string
): string {
    const title = (namaPenguji || "").toLowerCase().includes("ustadzah") ? "Ustadzah" : "Ustadz";
    const isWawancara = jenisUjian.toLowerCase().includes("wawancara");
    
    // Robust deduplication for Time - remove any existing WIB and ensure single WIB at end
    let cleanJam = (jam || "").replace(/\s*WIB\s*/gi, " ").trim();
    cleanJam = cleanJam.replace(/\s+/g, " "); // collapse multiple spaces
    const finalJam = `${cleanJam} WIB`;

    // Robust deduplication for Day - handle various formats
    let cleanTanggal = (tanggal || "").trim();
    // Remove day name if it appears at the start (case insensitive, with or without comma)
    if (hari) {
        const dayPattern = new RegExp(`^${hari}\\s*,?\\s*`, "i");
        cleanTanggal = cleanTanggal.replace(dayPattern, "");
    }
    // Also remove any day name pattern at the start (e.g., "Kamis, ")
    cleanTanggal = cleanTanggal.replace(/^(?:senin|selasa|rabu|kamis|jumat|sabtu|ahad|minggu)\s*,?\s*/i, "");

    const finalHariTanggal = `${hari}, ${cleanTanggal}`;

    const templateTitle = isWawancara ? "*REMINDER JADWAL WAWANCARA*" : "*REMINDER JADWAL MENGUJI*";
    const agendaText = isWawancara ? "Wawancara Calon Santri / Ortu" : jenisUjian;

    return `${templateTitle}

Assalamu'alaikum ${title} *${namaPenguji}*,

Mengingatkan jadwal ${isWawancara ? "wawancara" : "menguji"} Anda:

📝 *Agenda:* ${agendaText}
👤 *Nama Santri:* ${namaSantri}
📅 *Hari/Tanggal:* ${finalHariTanggal}
⏰ *Waktu:* ${finalJam}
📍 *Link Meet:* ${lokasi}
🔗 *Input Hasil:* ${inputNilaiLink || "-"}

Mohon kehadirannya tepat waktu. Syukron.

---
*Sistem PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessagePembatalanJadwal(
    namaSantri: string,
    jenisUjian: string,
    tanggal: string,
    jam: string,
    alasan: string = "Ustadz Berhalangan Hadir"
): string {
    return `*PEMBATALAN JADWAL UJIAN*

Assalamu'alaikum *${namaSantri}*,

Kami menginformasikan bahwa jadwal *${jenisUjian}* Anda pada:

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${jam} WIB

Telah *DIBATALKAN* oleh Penguji karena alasan: *${alasan}*.

Mohon segera login ke Dashboard PPDB untuk memilih kembali jadwal pengganti yang tersedia di menu Undangan Seleksi.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

---
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageJadwalBelum(nama: string): string {
    return `Assalamu'alaikum *${nama}*,

Terima kasih telah mendaftar di Pesantren Al-Andalus Ulul Albaab.

Saat ini jadwal tes lanjutan belum tersedia. Mohon bersabar, kami akan menginformasikan kembali begitu jadwal sudah siap.

Jazakumullahu khairan,
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageJadwalTersedia(nama: string): string {
    return `Assalamu'alaikum *${nama}*,

Alhamdulillah, jadwal tes lanjutan sudah tersedia!

Silakan login ke dashboard dan pilih jadwal yang sesuai.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageJadwalLangsungTersedia(nama: string): string {
    return `Assalamu'alaikum *${nama}*,

Terima kasih telah mendaftar di Pesantren Al-Andalus Ulul Albaab.

Saat ini jadwal tes lanjutan sudah tersedia dan bisa langsung Anda pilih.

Silakan login ke dashboard untuk memilih jadwal.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export function buildMessageReminderH0(
    nama: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `*PENGINGAT SEGERA*

Assalamu'alaikum *${nama}*,

Jadwal *${jenisUjian}* Anda akan dimulai dalam waktu dekat:

⏰ *Waktu:* ${waktu}
📍 *Lokasi:* ${lokasi}

Mohon persiapkan diri dan segera menuju lokasi ujian.

Jazakumullahu khairan,
*Panitia PPDB Al-Andalus Ulul Albaab*`;
}

export async function getQueueStats() {
    const [pending, processing, sent, failed] = await Promise.all([
        prisma.whatsappLog.count({ where: { status: "pending" } }),
        prisma.whatsappLog.count({ where: { status: "processing" } }),
        prisma.whatsappLog.count({ where: { status: "sent" } }),
        prisma.whatsappLog.count({ where: { status: "failed" } }),
    ]);

    return { queue: { pending, processing, sent, failed } };
}
