/**
 * Cron endpoint for 4-hour reminders.
 * Called every 15 minutes by external cron.
 * Finds all jadwal with exams starting in exactly 4 hours and sends reminders immediately.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageReminderQuranPendaftar,
    buildMessageReminderSantriPendaftar,
    buildMessageReminderOrtuPendaftar,
    buildMessageReminderQuranPenguji,
    buildMessageReminderSantriPenguji,
    buildMessageReminderOrtuPenguji } from "@/lib/whatsapp-queue";
import { generateExaminerInputLink } from "@/lib/utils/magic-link";

const CRON_SECRET = process.env.CRON_SECRET || "ppdb-alimam-cron-2026";

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    const secret = authHeader?.replace("Bearer ", "") || urlSecret;

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Calculate 4-hour window from now
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "spmb.pesantren-ululalbaab.com";
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const reqBaseUrl = `${protocol}://${host}`;
        const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || "";
        const fullAppUrl = appUrlEnv.startsWith("http") ? appUrlEnv : `${reqBaseUrl}${appUrlEnv}`;

        const now = new Date();
        const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const fourHoursPlus15Min = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 15 * 60 * 1000); // 15 min buffer

        // Find all jadwal_ujian with exams starting in the 4-hour window
        const jadwalIn4Hours = await prisma.jadwalUjian.findMany({
            where: {
                exam_session: {
                    start_time: {
                        gte: fourHoursFromNow,
                        lte: fourHoursPlus15Min } },
                pendaftar: {
                    deleted_at: null } },
            include: {
                pendaftar: {
                    include: {
                        orang_tua: true }
                },
                exam_session: true,
                penguji_santri: true,
                penguji_quran: true,
                penguji_ortu: true,
                penguji_arab: true,
                notif_reminders: true } });

        let enqueuedSantri = 0;
        let enqueuedPenguji = 0;

        for (const jadwal of jadwalIn4Hours) {
            // Format details
            const dateObj = new Date(jadwal.tanggal_ujian);
            const hari = dateObj.toLocaleDateString("id-ID", { weekday: "long" }).replace("Minggu", "Ahad");
            const tanggalStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            const finalHariTanggal = `${hari}, ${tanggalStr}`;

            const timeObj = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
            const rawJam = timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
            const finalJam = `${rawJam.replace(":", ".")} WIB`;

            const sessionTitle = (jadwal.exam_session?.title || "").toLowerCase();
            const isDedicatedQuran = sessionTitle.includes("quran") || sessionTitle.includes("qur'an");
            const isDedicatedOrtu = sessionTitle.includes("ortu") || sessionTitle.includes("cawalsan") || sessionTitle.includes("orang tua");
            const isDedicatedSantri = sessionTitle.includes("calsan") || (sessionTitle.includes("santri") && !isDedicatedOrtu);

            const finalScheduledAt = now;

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
            const santriJenjang = jadwal.pendaftar.jenjang || "MTs";

            // 1. Enqueue for Pendaftar / Orang Tua
            if (isDedicatedQuran) {
                if (santriPhone) {
                    const meetQuran = jadwal.penguji_quran?.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderQuranPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetQuran,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: santriPhone,
                        jenisNotif: "reminder_quran_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }
            } else if (isDedicatedOrtu) {
                if (parentPhone) {
                    const meetOrtu = jadwal.penguji_ortu?.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderOrtuPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetOrtu,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: parentPhone,
                        jenisNotif: "reminder_ortu_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }
            } else if (isDedicatedSantri) {
                if (santriPhone) {
                    const meetSantri = jadwal.penguji_santri?.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderSantriPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetSantri,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: santriPhone,
                        jenisNotif: "reminder_santri_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }
            } else {
                // Sesi Terpadu (General Session): Kirim pengingat per agenda yang dijadwalkan
                if (jadwal.penguji_quran && santriPhone) {
                    const meetQuran = jadwal.penguji_quran.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderQuranPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetQuran,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: santriPhone,
                        jenisNotif: "reminder_quran_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }

                if (jadwal.penguji_santri && santriPhone) {
                    const meetSantri = jadwal.penguji_santri.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderSantriPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetSantri,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: santriPhone,
                        jenisNotif: "reminder_santri_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }

                if (jadwal.penguji_ortu && parentPhone) {
                    const meetOrtu = jadwal.penguji_ortu.google_meet_link || jadwal.google_meet_link || "-";
                    const msg = buildMessageReminderOrtuPendaftar({
                        namaWali,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetOrtu,
                    });
                    const res = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: parentPhone,
                        jenisNotif: "reminder_ortu_pendaftar",
                        messageContent: msg,
                        scheduledAt: finalScheduledAt,
                    });
                    if (res.queued) enqueuedSantri++;
                }
            }

            // 2. Enqueue for Penguji / Pewawancara (dengan shortlink input nilai otomatis)
            const examinerTasks: Array<{
                profile: any;
                builder: (p: any) => string;
                notifType: string;
            }> = [];

            if (jadwal.penguji_quran) {
                examinerTasks.push({
                    profile: jadwal.penguji_quran,
                    builder: buildMessageReminderQuranPenguji,
                    notifType: "reminder_quran_penguji",
                });
            }

            if (jadwal.penguji_santri) {
                examinerTasks.push({
                    profile: jadwal.penguji_santri,
                    builder: buildMessageReminderSantriPenguji,
                    notifType: "reminder_santri_penguji",
                });
            }

            if (jadwal.penguji_ortu) {
                examinerTasks.push({
                    profile: jadwal.penguji_ortu,
                    builder: buildMessageReminderOrtuPenguji,
                    notifType: "reminder_ortu_penguji",
                });
            }

            for (const { profile, builder, notifType } of examinerTasks) {
                if (profile && profile.phone) {
                    const directInputLink = generateExaminerInputLink(
                        profile.id,
                        jadwal.pendaftar.nomor_pendaftaran,
                        fullAppUrl
                    );
                    const meetLink = profile.google_meet_link || jadwal.google_meet_link || "-";

                    const msgPenguji = builder({
                        namaPenguji: profile.full_name,
                        namaSantri: jadwal.pendaftar.nama_lengkap,
                        jenjang: santriJenjang,
                        hariTanggal: finalHariTanggal,
                        waktu: finalJam,
                        googleMeetLink: meetLink,
                        linkInputNilai: directInputLink,
                    });

                    const result = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: profile.phone,
                        jenisNotif: notifType,
                        messageContent: msgPenguji,
                        scheduledAt: finalScheduledAt,
                    });

                    if (result.queued) enqueuedPenguji++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            totalJadwalIn4Hours: jadwalIn4Hours.length,
            enqueuedSantri,
            enqueuedPenguji,
            timestamp: now.toISOString() });
    } catch (error: any) {
        console.error("❌ Cron Reminder error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
