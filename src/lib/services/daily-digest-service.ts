import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/wablas";
import { BRANDING } from "@/config/branding";

/**
 * DIGEST JADWAL SELEKSI HARIAN — dikirim otomatis setiap pagi 07.00 WIB.
 *
 * Isi: seluruh jadwal seleksi yang jatuh PADA HARI INI saja (WIB).
 * Tujuan: nomor yang ditetapkan admin super (AppSetting: daily_jadwal_recipient).
 * Fallback: jika belum ditetapkan → nomor WhatsApp profil admin super.
 * Jika keduanya kosong → TIDAK mengirim apa pun; UI dashboard admin super
 * menampilkan highlight (banner) yang meminta admin super mengatur nomor penerima.
 *
 * Pesan tersebut ditujukan kepada "pemegang nomor" yang WAJIB meneruskan
 * daftar jadwal ini ke grup WhatsApp penguji & pewawancara.
 */

const RECIPIENT_KEY = "daily_jadwal_recipient";
const LAST_SENT_KEY = "daily_jadwal_last_sent";
const SEND_HOUR_WIB = 6;
const SEND_MINUTE_WIB = 45; // kirim mulai 06.45 WIB, sekali per hari

export interface DigestJadwalItem {
    jam: string;
    jenis: string;
    namaSantri: string;
    jenjang: string;
    namaPenguji: string;
    lokasi: string;
}

export interface DailyDigestResult {
    triggered: boolean;
    sent: boolean;
    recipient: string | null;
    recipientSource: "setting" | "admin_super" | "none";
    jadwalCount: number;
    reason?: string;
}

function getWIBParts(date: Date = new Date()) {
    const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
    const wib = new Date(date.getTime() + WIB_OFFSET_MS);
    return {
        year: wib.getUTCFullYear(),
        month: wib.getUTCMonth(),
        day: wib.getUTCDate(),
        hour: wib.getUTCHours(),
        minute: wib.getUTCMinutes(),
        dateKey: `${wib.getUTCFullYear()}-${String(wib.getUTCMonth() + 1).padStart(2, "0")}-${String(wib.getUTCDate()).padStart(2, "0")}`,
    };
}

/** Ambil nomor penerima: setting admin super → nomor WA profil admin super → null */
export async function resolveDigestRecipient(): Promise<{
    phone: string | null;
    source: "setting" | "admin_super" | "none";
}> {
    try {
        const row = await prisma.appSetting.findUnique({ where: { key: RECIPIENT_KEY } });
        if (row?.value && row.value.trim() && row.value.trim() !== "-") {
            return { phone: row.value.trim(), source: "setting" };
        }
    } catch {
        // tabel app_settings belum ada di DB produksi → lanjut ke fallback
    }

    try {
        const adminSuper = await prisma.profile.findFirst({
            where: {
                OR: [
                    { role: "admin_super" },
                    { secondary_roles: { has: "admin_super" } },
                ],
                phone: { notIn: ["", "-"] },
            },
            select: { phone: true },
            orderBy: { role: "asc" },
        });
        if (adminSuper?.phone && adminSuper.phone !== "-") {
            return { phone: adminSuper.phone, source: "admin_super" };
        }
    } catch {
        // ignore
    }

    return { phone: null, source: "none" };
}

export async function getDigestRecipientSetting(): Promise<string | null> {
    try {
        const row = await prisma.appSetting.findUnique({ where: { key: RECIPIENT_KEY } });
        return row?.value?.trim() || null;
    } catch {
        return null;
    }
}

export async function setDigestRecipientSetting(phone: string | null): Promise<void> {
    if (!phone || !phone.trim() || phone.trim() === "-") {
        await prisma.appSetting.deleteMany({ where: { key: RECIPIENT_KEY } });
        return;
    }
    await prisma.appSetting.upsert({
        where: { key: RECIPIENT_KEY },
        create: { key: RECIPIENT_KEY, value: phone.trim() },
        update: { value: phone.trim(), updated_at: new Date() },
    });
}

function formatJenisUjian(sessionTitle: string): string {
    const t = (sessionTitle || "").toLowerCase();
    if (t.includes("quran") || t.includes("qur'an")) return "Tes Al-Qur'an";
    if (t.includes("ortu") || t.includes("cawalsan") || t.includes("orang tua") || t.includes("orangtua") || t.includes("wali")) return "Wawancara Calon Orangtua/Wali";
    if (t.includes("calsan") || t.includes("santri")) return "Wawancara Calon Santri";
    if (t.includes("arab") || t.includes("lisan")) return "Tes Lisan Bahasa Arab";
    return sessionTitle || "Tes Seleksi";
}

export function buildMessageDailyJadwalDigest(params: {
    dateLabel: string;
    items: DigestJadwalItem[];
}): string {
    const lines = params.items
        .map(
            (it, i) =>
                `${i + 1}. ⏰ *${it.jam}* — *${it.jenis}*\n` +
                `   👤 ${it.namaSantri} (${it.jenjang})\n` +
                `   🧑‍🏫 Penguji: ${it.namaPenguji}\n` +
                `   📍 ${it.lokasi}`
        )
        .join("\n\n");

    return `*📋 JADWAL SELEKSI HARI INI — ${params.dateLabel}*

Assalamu'alaikum warahmatullahi wabarakatuh,

Berikut daftar lengkap jadwal seleksi *hari ini* (${params.items.length} jadwal):

${lines}

⚠️ *MOHON DITERUSKAN* daftar ini ke *grup WhatsApp penguji & pewawancara* agar seluruh penguji mengetahui jadwal menguji hari ini.

Terima kasih. Jazakumullahu khairan.

---
_Sistem SPMB ${BRANDING.schoolName}_`;
}

async function markDailySent(dateKey: string) {
    try {
        await prisma.appSetting.upsert({
            where: { key: LAST_SENT_KEY },
            create: { key: LAST_SENT_KEY, value: dateKey },
            update: { value: dateKey, updated_at: new Date() },
        });
    } catch {
        // tabel belum ada — andalkan guard in-memory
        (globalThis as any).__DAILY_DIGEST_LAST_SENT__ = dateKey;
    }
}

async function getDailySentMarker(): Promise<string | null> {
    try {
        const row = await prisma.appSetting.findUnique({ where: { key: LAST_SENT_KEY } });
        return row?.value ?? null;
    } catch {
        return ((globalThis as any).__DAILY_DIGEST_LAST_SENT__ as string | undefined) ?? null;
    }
}

/**
 * Dipanggil worker internal (tiap 60 detik). Mengirim sekali per hari,
 * mulai pukul 07.00 WIB.
 */
export async function maybeSendDailyScheduleDigest(now: Date = new Date()): Promise<DailyDigestResult> {
    const wib = getWIBParts(now);
    const notYetTime = wib.hour < SEND_HOUR_WIB || (wib.hour === SEND_HOUR_WIB && wib.minute < SEND_MINUTE_WIB);
    const alreadySent = (await getDailySentMarker()) === wib.dateKey;

    if (notYetTime || alreadySent) {
        return { triggered: false, sent: false, recipient: null, recipientSource: "none", jadwalCount: 0, reason: notYetTime ? "belum_07:00" : "sudah_terkirim_hari_ini" };
    }

    // Rentang hari ini 00:00–23:59 WIB (UTC)
    const dayStart = new Date(Date.UTC(wib.year, wib.month, wib.day, 0, 0, 0) - 7 * 60 * 60 * 1000);
    const dayEnd = new Date(Date.UTC(wib.year, wib.month, wib.day, 23, 59, 59, 999) - 7 * 60 * 60 * 1000);

    const jadwalToday = await prisma.jadwalUjian.findMany({
        where: {
            exam_session: {
                start_time: { gte: dayStart, lte: dayEnd },
            },
            pendaftar: { deleted_at: null },
        },
        include: {
            exam_session: true,
            pendaftar: { select: { nama_lengkap: true, jenjang: true } },
            penguji_quran: { select: { full_name: true } },
            penguji_santri: { select: { full_name: true } },
            penguji_ortu: { select: { full_name: true } },
            penguji_arab: { select: { full_name: true } },
        },
        orderBy: { exam_session: { start_time: "asc" } },
    });

    if (jadwalToday.length === 0) {
        await markDailySent(wib.dateKey);
        return { triggered: true, sent: false, recipient: null, recipientSource: "none", jadwalCount: 0, reason: "tidak_ada_jadwal_hari_ini" };
    }

    const { phone, source } = await resolveDigestRecipient();
    if (!phone) {
        // Jangan tandai terkirim — akan dicoba lagi tick berikutnya &
        // UI admin super menampilkan highlight untuk mengatur nomor penerima.
        return { triggered: true, sent: false, recipient: null, recipientSource: "none", jadwalCount: jadwalToday.length, reason: "penerima_belum_diatas" };
    }

    const items: DigestJadwalItem[] = jadwalToday.map((j: any) => {
        const start = j.exam_session ? new Date(j.exam_session.start_time) : new Date(j.waktu_mulai_santri);
        const jam = start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).replace(":", ".") + " WIB";
        const penguji =
            j.penguji_quran?.full_name ||
            j.penguji_santri?.full_name ||
            j.penguji_ortu?.full_name ||
            j.penguji_arab?.full_name ||
            "-";
        return {
            jam,
            jenis: formatJenisUjian(j.exam_session?.title || ""),
            namaSantri: j.pendaftar?.nama_lengkap || "-",
            jenjang: (j.pendaftar?.jenjang || "-").toUpperCase(),
            namaPenguji: penguji,
            lokasi: j.exam_session?.location || j.lokasi || "-",
        };
    });

    const dateLabel = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).replace("Minggu", "Ahad");
    const message = buildMessageDailyJadwalDigest({ dateLabel, items });

    const res = await sendMessage({ phone, message });
    if (!res.status) {
        console.error("❌ Daily digest: gagal kirim via Wablas:", res.message);
        return { triggered: true, sent: false, recipient: phone, recipientSource: source, jadwalCount: jadwalToday.length, reason: "gagal_kirim_wablas" };
    }

    await markDailySent(wib.dateKey);
    return { triggered: true, sent: true, recipient: phone, recipientSource: source, jadwalCount: jadwalToday.length };
}
