import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { 
    enqueueWhatsapp, 
    buildMessageKonfirmasiJadwal, 
    buildMessageKonfirmasiJadwalInterviewer, 
    buildMessageReminderH1Santri, 
    buildMessageReminderH1Penguji 
} from "@/lib/whatsapp-queue";
import { generateMagicToken } from "@/lib/utils/magic-link";

function getExamCategory(title: string): string {
    const t = (title || "").toLowerCase();
    if (t.includes('quran') || t.includes('qur\'an')) return 'QURAN';
    if (t.includes('calsan') || t.includes('santri')) return 'W_SANTRI';
    if (t.includes('cawalsan') || t.includes('ortu') || t.includes('orang tua')) return 'W_ORTU';
    return 'OTHER';
}

function sanitizeTitle(title: string): string {
    // Remove anything in parentheses (e.g. examiner names)
    return (title || "").replace(/\s*\(.*?\)\s*/g, '').trim();
}

async function getSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

// GET: Fetch existing schedule for pendaftar
export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'pendaftar') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const jadwal = await prisma.jadwalUjian.findMany({
            where: { pendaftar_id: session.id },
            include: {
                exam_session: true
            },
            orderBy: { created_at: 'desc' }
        });

        // Transform to match front-end expectation
        const data = jadwal.map(item => ({
            id: item.id,
            jenis_ujian: sanitizeTitle(item.exam_session?.title || "Seleksi Santri Baru"),
            category: getExamCategory(item.exam_session?.title || ""),
            tanggal_ujian: item.tanggal_ujian,
            waktu_mulai: item.exam_session?.start_time || item.waktu_mulai_santri,
            waktu_selesai: item.exam_session?.end_time || item.waktu_selesai_santri,
            lokasi: item.exam_session?.location || item.tempat_santri,
            keterangan: item.catatan || item.exam_session?.notes,
            online_test_link: item.online_test_link, // For Phase 1
        }));

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("GET pendaftar/jadwal error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Book a slot (Create Schedule)
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'pendaftar') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { exam_session_id } = body;

        if (!exam_session_id) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        // 1. Validate Session First
        const examSession = await prisma.examSession.findUnique({
            where: { id: exam_session_id },
            include: { _count: { select: { bookings: true } } }
        });

        if (!examSession) return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
        if (!examSession.is_active) return NextResponse.json({ error: "Sesi tidak aktif" }, { status: 400 });
        if (examSession._count.bookings >= examSession.quota) {
            return NextResponse.json({ error: "Kuota penuh" }, { status: 400 });
        }

        // 2. Check for categorical duplication (Quran, Santri, Ortu)
        const existingBookings = await prisma.jadwalUjian.findMany({
            where: { pendaftar_id: session.id },
            include: { exam_session: true }
        });
        
        const currentCategory = getExamCategory(examSession.title || "");

        // Check if any existing booking has the same category
        const duplicateCategory = existingBookings.find(booking => {
            const bookedTitle = booking.exam_session?.title || "";
            return getExamCategory(bookedTitle) === currentCategory;
        });

        if (duplicateCategory) {
            const categoryLabel = 
                currentCategory === 'QURAN' ? 'Ujian Al-Quran' :
                currentCategory === 'W_SANTRI' ? 'Wawancara Calon Santri' :
                currentCategory === 'W_ORTU' ? 'Wawancara Orang Tua' : 
                'Ujian ini';
            
            return NextResponse.json({
                error: `Anda sudah memiliki jadwal untuk ${categoryLabel}.`
            }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedSession = await tx.examSession.update({
                where: { id: exam_session_id },
                data: { booked_count: { increment: 1 } }
            });

            if (updatedSession.booked_count > updatedSession.quota) {
                throw new Error("Kuota penuh (race condition)");
            }

            const pendaftar = await tx.pendaftar.findUnique({ where: { id: session.id } });
            if (!pendaftar) throw new Error("Data pendaftar tidak ditemukan");

            let pengujiFields: Record<string, string | null> = {};
            const sessionTitle = (examSession.title || "").toLowerCase();
            if (examSession.created_by) {
                const interviewer = await tx.profile.findUnique({
                    where: { id: examSession.created_by },
                    select: { google_meet_link: true, full_name: true, phone: true }
                });

                if (sessionTitle.includes("qur") || sessionTitle.includes("quran")) {
                    pengujiFields = {
                        penguji_quran_id: examSession.created_by,
                        google_meet_link: interviewer?.google_meet_link || null
                    };
                } else if (sessionTitle.includes("calsan") || sessionTitle.includes("santri")) {
                    pengujiFields = {
                        penguji_santri_id: examSession.created_by,
                        google_meet_link: interviewer?.google_meet_link || null
                    };
                } else if (sessionTitle.includes("cawalsan") || sessionTitle.includes("ortu") || sessionTitle.includes("orang")) {
                    pengujiFields = {
                        penguji_ortu_id: examSession.created_by,
                        google_meet_link: interviewer?.google_meet_link || null
                    };
                }
            }

            const jadwal = await tx.jadwalUjian.create({
                data: {
                    tahun_ajaran_id: pendaftar.tahun_ajaran_id,
                    pendaftar_id: session.id,
                    exam_session_id: exam_session_id,
                    tanggal_ujian: examSession.start_time,
                    waktu_mulai_santri: examSession.start_time,
                    waktu_selesai_santri: examSession.end_time,
                    tempat_santri: examSession.location || "Pesantren",
                    waktu_mulai_ortu: examSession.start_time,
                    waktu_selesai_ortu: examSession.end_time,
                    tempat_ortu: examSession.location || "Pesantren",
                    status_santri: "scheduled",
                    status_quran: "scheduled",
                    status_ortu: "scheduled",
                    status_online_test: "pending",
                    ...pengujiFields
                }
            });

            await tx.pendaftar.update({
                where: { id: session.id },
                data: { status_pendaftaran: 'scheduled' }
            });

            await tx.nilaiUjian.create({
                data: {
                    pendaftar_id: session.id,
                    jadwal_ujian_id: jadwal.id,
                }
            });

            return jadwal;
        });

        // Send WhatsApp via Queue
        const pendaftarInfo = await prisma.pendaftar.findUnique({
            where: { id: session.id },
            select: { nama_lengkap: true, no_hp: true }
        });

        if (pendaftarInfo && pendaftarInfo.no_hp) {
            const startTime = new Date(examSession.start_time);
            const dateStr = startTime.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
            const timeStr = startTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';
            const lokasi = examSession.location || "Pesantren Al-Andalus Ulul Albaab";
            const jenisUjian = sanitizeTitle(examSession.title || "Seleksi Santri Baru");

            const message = buildMessageKonfirmasiJadwal(
                pendaftarInfo.nama_lengkap,
                dateStr,
                timeStr,
                lokasi,
                jenisUjian
            );

            enqueueWhatsapp({
                pendaftarId: session.id,
                phone: pendaftarInfo.no_hp,
                jenisNotif: "konfirmasi_jadwal",
                messageContent: message,
            }).catch((err: any) => console.error("Failed to enqueue jadwal confirmation:", err));

            // Notify Interviewer
            if (examSession.created_by) {
                const interviewer = await prisma.profile.findUnique({
                    where: { id: examSession.created_by },
                    select: { full_name: true, phone: true, google_meet_link: true }
                });

                if (interviewer && interviewer.phone) {
                    const redirectPathPath = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(pendaftarInfo.nama_lengkap)}`;
                    const token = generateMagicToken(
                        examSession.created_by,
                        "penguji", 
                        interviewer.full_name,
                        72,
                        redirectPathPath
                    );
                    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ppdb.alandalus-ululalbaab.com'}/api/auth/magic?token=${token}`;

                    const intMessage = buildMessageKonfirmasiJadwalInterviewer(
                        interviewer.full_name,
                        pendaftarInfo.nama_lengkap,
                        dateStr,
                        timeStr,
                        interviewer.google_meet_link || lokasi,
                        jenisUjian,
                        magicLink
                    );

                    const scheduledAt = new Date();
                    scheduledAt.setMinutes(scheduledAt.getMinutes() + 1);

                    enqueueWhatsapp({
                        pendaftarId: session.id,
                        phone: interviewer.phone,
                        jenisNotif: "konfirmasi_jadwal_interviewer",
                        messageContent: intMessage,
                        scheduledAt: scheduledAt,
                    }).catch((err: any) => console.error("Failed to enqueue interviewer notification:", err));
                }
            }

            // SCHEDULE 4-HOUR REMINDERS
            try {
                const examStartTime = new Date(examSession.start_time);
                const reminderTime = new Date(examStartTime.getTime() - 4 * 60 * 60 * 1000);
                const now = new Date();
                const finalScheduledAt = reminderTime < now ? now : reminderTime;

                const remSantriMsg = buildMessageReminderH1Santri(
                    pendaftarInfo.nama_lengkap,
                    dateStr.split(',')[0] || "",
                    dateStr,
                    timeStr,
                    lokasi,
                    jenisUjian
                );

                enqueueWhatsapp({
                    pendaftarId: session.id,
                    phone: pendaftarInfo.no_hp,
                    jenisNotif: "reminder_h1",
                    messageContent: remSantriMsg,
                    scheduledAt: finalScheduledAt,
                }).then(async () => {
                    try {
                        await prisma.jadwalUjian.update({
                            where: { id: result.id },
                            data: { notif_h1_pendaftar_terkirim: true }
                        });
                    } catch (e) {}
                }).catch(err => console.error("Failed to enqueue H1 santri reminder:", err));

                if (examSession.created_by) {
                    const interviewer = await prisma.profile.findUnique({
                        where: { id: examSession.created_by },
                        select: { full_name: true, phone: true, google_meet_link: true }
                    });

                    if (interviewer && interviewer.phone) {
                        const redirectPathH1 = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(pendaftarInfo.nama_lengkap)}`;
                        const tokenH1 = generateMagicToken(
                            examSession.created_by,
                            "penguji",
                            interviewer.full_name,
                            48,
                            redirectPathH1
                        );
                        const magicLinkRem4h = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ppdb.alandalus-ululalbaab.com'}/api/auth/magic?token=${tokenH1}`;

                        const { getManualTinyUrl, generateTinyUrl } = await import("@/lib/utils/magic-link");
                        const manualTinyUrl = getManualTinyUrl(interviewer.full_name);
                        const shortUrlRem4h = manualTinyUrl || await generateTinyUrl(magicLinkRem4h);

                        const remIntMessage = buildMessageReminderH1Penguji(
                            interviewer.full_name,
                            pendaftarInfo.nama_lengkap,
                            dateStr.split(',')[0] || "",
                            dateStr,
                            timeStr,
                            interviewer.google_meet_link || lokasi,
                            jenisUjian,
                            shortUrlRem4h
                        );

                        const finalScheduledAtInt = new Date(finalScheduledAt);
                        finalScheduledAtInt.setMinutes(finalScheduledAtInt.getMinutes() + 5);

                        enqueueWhatsapp({
                            pendaftarId: session.id,
                            phone: interviewer.phone,
                            jenisNotif: "reminder_h1",
                            messageContent: remIntMessage,
                            scheduledAt: finalScheduledAtInt,
                        }).then(async () => {
                            try {
                                await prisma.jadwalUjian.update({
                                    where: { id: result.id },
                                    data: { notif_h1_penguji_terkirim: true }
                                });
                            } catch (e) {}
                        }).catch(err => console.error("Failed to enqueue 4h penguji reminder:", err));
                    }
                }
            } catch (error) {
                console.error("Error scheduling H1 reminders:", error);
            }
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("POST pendaftar/jadwal error:", error);
        return NextResponse.json({ error: error.message || "Gagal booking jadwal" }, { status: 500 });
    }
}
