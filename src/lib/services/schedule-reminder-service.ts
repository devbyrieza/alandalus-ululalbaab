import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageReminderQuranPendaftar,
    buildMessageReminderSantriPendaftar,
    buildMessageReminderOrtuPendaftar,
    buildMessageReminderQuranPenguji,
    buildMessageReminderSantriPenguji,
    buildMessageReminderOrtuPenguji
} from "@/lib/whatsapp-queue";
import { generateExaminerInputLink } from "@/lib/utils/magic-link";

export interface ScheduleReminderResult {
    h1: {
        checked: number;
        enqueuedPendaftar: number;
        enqueuedPenguji: number;
    };
    h0: {
        checked: number;
        enqueuedPendaftar: number;
        enqueuedPenguji: number;
    };
    timestamp: string;
}

/**
 * Helper to get current time in WIB (UTC+7)
 */
export function getWIBTime(): { nowUTC: Date; nowWIB: Date; hourWIB: number; minuteWIB: number } {
    const nowUTC = new Date();
    const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
    const nowWIB = new Date(nowUTC.getTime() + WIB_OFFSET_MS);
    return {
        nowUTC,
        nowWIB,
        hourWIB: nowWIB.getUTCHours(),
        minuteWIB: nowWIB.getUTCMinutes()
    };
}

/**
 * Format date in Indonesian locale (e.g. "Senin, 26 Oktober 2026")
 */
function formatHariTanggal(date: Date): string {
    const hari = date.toLocaleDateString("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" }).replace("Minggu", "Ahad");
    const tanggalStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
    return `${hari}, ${tanggalStr}`;
}

/**
 * Format time in WIB (e.g. "09.00 WIB")
 */
function formatJamWIB(date: Date): string {
    const rawJam = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
    return `${rawJam.replace(":", ".")} WIB`;
}

/**
 * LAYER 1: PENGINGAT H-1 (Malam Hari H-1, Pukul 19.00 - 21.30 WIB)
 * Mengingatkan seluruh jadwal ujian yang jatuh pada hari ESOK.
 */
export async function checkAndSendH1Reminders(appUrl: string, force: boolean = false): Promise<{ checked: number; enqueuedPendaftar: number; enqueuedPenguji: number }> {
    const { nowUTC, nowWIB, hourWIB, minuteWIB } = getWIBTime();
    const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

    // Window malam: 18.30 - 21.30 WIB (kecuali force)
    const isEveningWindow = (hourWIB >= 18 && minuteWIB >= 30) || (hourWIB >= 19 && hourWIB <= 21);
    if (!isEveningWindow && !force) {
        return { checked: 0, enqueuedPendaftar: 0, enqueuedPenguji: 0 };
    }

    // Rentang waktu ESOK dalam WIB: 00:00:00 s/d 23:59:59 WIB
    const tomorrowStart = new Date(Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), nowWIB.getUTCDate() + 1, 0, 0, 0) - WIB_OFFSET_MS);
    const tomorrowEnd = new Date(Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), nowWIB.getUTCDate() + 1, 23, 59, 59, 999) - WIB_OFFSET_MS);

    const jadwalBesok = await prisma.jadwalUjian.findMany({
        where: {
            exam_session: {
                start_time: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd
                }
            },
            pendaftar: {
                deleted_at: null
            },
            OR: [
                { notif_h1_pendaftar_terkirim: false },
                { notif_h1_penguji_terkirim: false }
            ]
        },
        include: {
            exam_session: true,
            pendaftar: {
                include: {
                    orang_tua: true
                }
            },
            penguji_santri: true,
            penguji_quran: true,
            penguji_ortu: true
        }
    });

    let enqueuedPendaftar = 0;
    let enqueuedPenguji = 0;

    for (const jadwal of jadwalBesok) {
        const examDate = new Date(jadwal.tanggal_ujian);
        const finalHariTanggal = formatHariTanggal(examDate);

        const startTime = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
        const finalJam = formatJamWIB(startTime);

        const namaWali =
            jadwal.pendaftar.orang_tua?.nama_ayah ||
            jadwal.pendaftar.orang_tua?.nama_ibu ||
            jadwal.pendaftar.orang_tua?.nama_wali ||
            jadwal.pendaftar.nama_lengkap;

        const parentPhone =
            jadwal.pendaftar.orang_tua?.no_hp_ayah ||
            jadwal.pendaftar.orang_tua?.no_hp_ibu ||
            jadwal.pendaftar.no_hp;

        const santriPhone = jadwal.pendaftar.no_hp || parentPhone;
        const santriJenjang = jadwal.pendaftar.jenjang;

        const sessionTitle = (jadwal.exam_session?.title || "").toLowerCase();
        const isQuran = sessionTitle.includes("quran") || sessionTitle.includes("qur'an");
        const isOrtu = sessionTitle.includes("ortu") || sessionTitle.includes("cawalsan") || sessionTitle.includes("orang tua");
        const isSantri = sessionTitle.includes("calsan") || (sessionTitle.includes("santri") && !isOrtu);

        // 1. Kirim ke Pendaftar jika belum terkirim
        if (!jadwal.notif_h1_pendaftar_terkirim) {
            let sent = false;
            if (isQuran && santriPhone) {
                const meet = jadwal.penguji_quran?.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderQuranPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_quran_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                sent = true;
            } else if (isSantri && santriPhone) {
                const meet = jadwal.penguji_santri?.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderSantriPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_santri_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                sent = true;
            } else if (isOrtu && parentPhone) {
                const meet = jadwal.penguji_ortu?.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderOrtuPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: parentPhone, jenisNotif: "reminder_ortu_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                sent = true;
            } else {
                // Sesi Umum / Terpadu
                if (jadwal.penguji_quran && santriPhone) {
                    const meet = jadwal.penguji_quran.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderQuranPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meet
                    });
                    await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_quran_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                    sent = true;
                }
                if (jadwal.penguji_santri && santriPhone) {
                    const meet = jadwal.penguji_santri.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderSantriPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meet
                    });
                    await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_santri_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                    sent = true;
                }
                if (jadwal.penguji_ortu && parentPhone) {
                    const meet = jadwal.penguji_ortu.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderOrtuPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meet
                    });
                    await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: parentPhone, jenisNotif: "reminder_ortu_pendaftar_h1", messageContent: msg, force: true, sendNow: true });
                    sent = true;
                }
            }

            if (sent) {
                await prisma.jadwalUjian.update({
                    where: { id: jadwal.id },
                    data: { notif_h1_pendaftar_terkirim: true }
                });
                enqueuedPendaftar++;
            }
        }

        // 2. Kirim ke Penguji jika belum terkirim
        if (!jadwal.notif_h1_penguji_terkirim) {
            let sentPenguji = false;
            const examinerTasks: Array<{
                profile: any;
                builder: (p: any) => string;
                notifType: string;
            }> = [];

            if (isQuran && jadwal.penguji_quran) {
                examinerTasks.push({ profile: jadwal.penguji_quran, builder: buildMessageReminderQuranPenguji, notifType: "reminder_quran_penguji_h1" });
            } else if (isSantri && jadwal.penguji_santri) {
                examinerTasks.push({ profile: jadwal.penguji_santri, builder: buildMessageReminderSantriPenguji, notifType: "reminder_santri_penguji_h1" });
            } else if (isOrtu && jadwal.penguji_ortu) {
                examinerTasks.push({ profile: jadwal.penguji_ortu, builder: buildMessageReminderOrtuPenguji, notifType: "reminder_ortu_penguji_h1" });
            } else {
                if (jadwal.penguji_quran) examinerTasks.push({ profile: jadwal.penguji_quran, builder: buildMessageReminderQuranPenguji, notifType: "reminder_quran_penguji_h1" });
                if (jadwal.penguji_santri) examinerTasks.push({ profile: jadwal.penguji_santri, builder: buildMessageReminderSantriPenguji, notifType: "reminder_santri_penguji_h1" });
                if (jadwal.penguji_ortu) examinerTasks.push({ profile: jadwal.penguji_ortu, builder: buildMessageReminderOrtuPenguji, notifType: "reminder_ortu_penguji_h1" });
            }

            for (const task of examinerTasks) {
                if (task.profile && task.profile.phone && task.profile.phone !== "-") {
                    const inputLink = generateExaminerInputLink(task.profile.id, jadwal.pendaftar.nomor_pendaftaran, appUrl);
                    const meet = task.profile.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = task.builder({
                        namaPenguji: task.profile.full_name,
                        gender: task.profile.jenis_kelamin,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meet,
                        linkInputNilai: inputLink
                    });
                    await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: task.profile.phone, jenisNotif: task.notifType, messageContent: msg, force: true, sendNow: true });
                    sentPenguji = true;
                }
            }

            if (sentPenguji || examinerTasks.length === 0) {
                await prisma.jadwalUjian.update({
                    where: { id: jadwal.id },
                    data: { notif_h1_penguji_terkirim: true }
                });
                enqueuedPenguji++;
            }
        }
    }

    return { checked: jadwalBesok.length, enqueuedPendaftar, enqueuedPenguji };
}

/**
 * LAYER 2: PENGINGAT HARI H (1 Jam / 60 Menit Sebelum Sesi Ujian)
 * Mencari ujian yang akan mulai dalam 15 - 90 menit ke depan, yang belum menerima pengingat H-0.
 */
export async function checkAndSendH0Reminders(appUrl: string): Promise<{ checked: number; enqueuedPendaftar: number; enqueuedPenguji: number }> {
    const now = new Date();
    const minTime = now;
    const maxTime = new Date(now.getTime() + 90 * 60 * 1000);

    const jadwalSoon = await prisma.jadwalUjian.findMany({
        where: {
            exam_session: {
                start_time: {
                    gte: minTime,
                    lte: maxTime
                }
            },
            pendaftar: {
                deleted_at: null
            }
        },
        include: {
            exam_session: true,
            pendaftar: {
                include: {
                    orang_tua: true
                }
            },
            penguji_santri: true,
            penguji_quran: true,
            penguji_ortu: true,
            notif_reminders: true
        }
    });

    let enqueuedPendaftar = 0;
    let enqueuedPenguji = 0;

    for (const jadwal of jadwalSoon) {
        const alreadySent = (jadwal.notif_reminders || []).some((r: any) => r.reminder_sent === true);
        if (alreadySent) {
            continue;
        }

        const examDate = new Date(jadwal.tanggal_ujian);
        const finalHariTanggal = formatHariTanggal(examDate);

        const startTime = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
        const finalJam = formatJamWIB(startTime);

        const namaWali =
            jadwal.pendaftar.orang_tua?.nama_ayah ||
            jadwal.pendaftar.orang_tua?.nama_ibu ||
            jadwal.pendaftar.orang_tua?.nama_wali ||
            jadwal.pendaftar.nama_lengkap;

        const parentPhone =
            jadwal.pendaftar.orang_tua?.no_hp_ayah ||
            jadwal.pendaftar.orang_tua?.no_hp_ibu ||
            jadwal.pendaftar.no_hp;

        const santriPhone = jadwal.pendaftar.no_hp || parentPhone;
        const santriJenjang = jadwal.pendaftar.jenjang;

        const sessionTitle = (jadwal.exam_session?.title || "").toLowerCase();
        const isQuran = sessionTitle.includes("quran") || sessionTitle.includes("qur'an");
        const isOrtu = sessionTitle.includes("ortu") || sessionTitle.includes("cawalsan") || sessionTitle.includes("orang tua");
        const isSantri = sessionTitle.includes("calsan") || (sessionTitle.includes("santri") && !isOrtu);

        // 1. Kirim Pengingat Hari H ke Pendaftar
        if (isQuran && santriPhone) {
            const meet = jadwal.penguji_quran?.google_meet_link || jadwal.google_meet_link || "-";
            const msg = buildMessageReminderQuranPendaftar({
                namaWali,
                namaSantri: jadwal.pendaftar.nama_lengkap,
                jenjang: santriJenjang,
                hariTanggal: finalHariTanggal,
                waktu: finalJam,
                googleMeetLink: meet
            });
            await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_quran_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
            enqueuedPendaftar++;
        } else if (isSantri && santriPhone) {
            const meet = jadwal.penguji_santri?.google_meet_link || jadwal.google_meet_link || "-";
            const msg = buildMessageReminderSantriPendaftar({
                namaWali,
                namaSantri: jadwal.pendaftar.nama_lengkap,
                jenjang: santriJenjang,
                hariTanggal: finalHariTanggal,
                waktu: finalJam,
                googleMeetLink: meet
            });
            await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_santri_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
            enqueuedPendaftar++;
        } else if (isOrtu && parentPhone) {
            const meet = jadwal.penguji_ortu?.google_meet_link || jadwal.google_meet_link || "-";
            const msg = buildMessageReminderOrtuPendaftar({
                namaWali,
                namaSantri: jadwal.pendaftar.nama_lengkap,
                jenjang: santriJenjang,
                hariTanggal: finalHariTanggal,
                waktu: finalJam,
                googleMeetLink: meet
            });
            await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: parentPhone, jenisNotif: "reminder_ortu_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
            enqueuedPendaftar++;
        } else {
            // Sesi Umum / Terpadu
            if (jadwal.penguji_quran && santriPhone) {
                const meet = jadwal.penguji_quran.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderQuranPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_quran_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
                enqueuedPendaftar++;
            }
            if (jadwal.penguji_santri && santriPhone) {
                const meet = jadwal.penguji_santri.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderSantriPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: santriPhone, jenisNotif: "reminder_santri_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
                enqueuedPendaftar++;
            }
            if (jadwal.penguji_ortu && parentPhone) {
                const meet = jadwal.penguji_ortu.google_meet_link || jadwal.google_meet_link || "-";
                const msg = buildMessageReminderOrtuPendaftar({
                    namaWali,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: parentPhone, jenisNotif: "reminder_ortu_pendaftar_h0", messageContent: msg, force: true, sendNow: true });
                enqueuedPendaftar++;
            }
        }

        // 2. Kirim Pengingat Hari H ke Penguji
        const examinerTasks: Array<{
            profile: any;
            builder: (p: any) => string;
            notifType: string;
        }> = [];

        if (isQuran && jadwal.penguji_quran) {
            examinerTasks.push({ profile: jadwal.penguji_quran, builder: buildMessageReminderQuranPenguji, notifType: "reminder_quran_penguji_h0" });
        } else if (isSantri && jadwal.penguji_santri) {
            examinerTasks.push({ profile: jadwal.penguji_santri, builder: buildMessageReminderSantriPenguji, notifType: "reminder_santri_penguji_h0" });
        } else if (isOrtu && jadwal.penguji_ortu) {
            examinerTasks.push({ profile: jadwal.penguji_ortu, builder: buildMessageReminderOrtuPenguji, notifType: "reminder_ortu_penguji_h0" });
        } else {
            if (jadwal.penguji_quran) examinerTasks.push({ profile: jadwal.penguji_quran, builder: buildMessageReminderQuranPenguji, notifType: "reminder_quran_penguji_h0" });
            if (jadwal.penguji_santri) examinerTasks.push({ profile: jadwal.penguji_santri, builder: buildMessageReminderSantriPenguji, notifType: "reminder_santri_penguji_h0" });
            if (jadwal.penguji_ortu) examinerTasks.push({ profile: jadwal.penguji_ortu, builder: buildMessageReminderOrtuPenguji, notifType: "reminder_ortu_penguji_h0" });
        }

        for (const task of examinerTasks) {
            if (task.profile && task.profile.phone && task.profile.phone !== "-") {
                const inputLink = generateExaminerInputLink(task.profile.id, jadwal.pendaftar.nomor_pendaftaran, appUrl);
                const meet = task.profile.google_meet_link || jadwal.google_meet_link || "-";
                const msg = task.builder({
                    namaPenguji: task.profile.full_name,
                    gender: task.profile.jenis_kelamin,
                    namaSantri: jadwal.pendaftar.nama_lengkap,
                    jenjang: santriJenjang,
                    hariTanggal: finalHariTanggal,
                    waktu: finalJam,
                    googleMeetLink: meet,
                    linkInputNilai: inputLink
                });
                await enqueueWhatsapp({ pendaftarId: jadwal.pendaftar_id, phone: task.profile.phone, jenisNotif: task.notifType, messageContent: msg, force: true, sendNow: true });
                enqueuedPenguji++;
            }
        }

        await prisma.jadwalNotifReminder.upsert({
            where: {
                jadwal_ujian_id_pendaftar_id: {
                    jadwal_ujian_id: jadwal.id,
                    pendaftar_id: jadwal.pendaftar_id
                }
            },
            update: {
                reminder_sent: true,
                sent_at: new Date()
            },
            create: {
                jadwal_ujian_id: jadwal.id,
                pendaftar_id: jadwal.pendaftar_id,
                reminder_sent: true,
                sent_at: new Date()
            }
        });
    }

    return { checked: jadwalSoon.length, enqueuedPendaftar, enqueuedPenguji };
}

/**
 * PUSAT PENGENDALI PENGINGAT (Dipanggil oleh internal worker & route API)
 */
export async function processScheduleReminders(options?: {
    forceH1?: boolean;
    appUrl?: string;
}): Promise<ScheduleReminderResult> {
    const finalAppUrl = options?.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://spmb.pesantren-ululalbaab.com";

    const [h1Result, h0Result] = await Promise.all([
        checkAndSendH1Reminders(finalAppUrl, options?.forceH1 || false),
        checkAndSendH0Reminders(finalAppUrl)
    ]);

    return {
        h1: h1Result,
        h0: h0Result,
        timestamp: new Date().toISOString()
    };
}
