import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Find all active schedules from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSchedules = await prisma.jadwalUjian.findMany({
      where: {
        OR: [
          { tanggal_ujian: { gte: today } },
          { exam_session: { start_time: { gte: today } } },
        ],
      },
      include: {
        exam_session: true,
      },
    });

    if (upcomingSchedules.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada jadwal ujian aktif ke depan." });
    }

    // 2. Collect unique Penguji IDs
    const pengujiIds = new Set<string>();
    upcomingSchedules.forEach((j) => {
      if (j.penguji_santri_id) pengujiIds.add(j.penguji_santri_id);
      if (j.penguji_quran_id) pengujiIds.add(j.penguji_quran_id);
      if (j.penguji_ortu_id) pengujiIds.add(j.penguji_ortu_id);
      if (j.penguji_hafalan_id) pengujiIds.add(j.penguji_hafalan_id);
      if (j.penguji_arab_id) pengujiIds.add(j.penguji_arab_id);
    });

    if (pengujiIds.size === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada penguji yang ditugaskan pada jadwal aktif." });
    }

    // 3. Fetch Penguji Profiles
    const pengujiProfiles = await prisma.profile.findMany({
      where: {
        id: { in: Array.from(pengujiIds) },
      },
    });

    // 4. Determine base URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const appBaseUrl = host 
      ? `${proto}://${host}` 
      : (process.env.NEXT_PUBLIC_APP_URL || "https://ppdb.alandalus-ululalbaab.com");

    let successCount = 0;

    // 5. Send WA to each Penguji
    for (const profile of pengujiProfiles) {
      if (!profile.phone) continue;

      const title = profile.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz";
      const authUrl = `${appBaseUrl}/x/${profile.id}`;

      const message = `*PEMBERITAHUAN JADWAL MENGUJI*

Assalamu'alaikum ${title} *${profile.full_name}*,

Mengingatkan bahwa Anda telah dijadwalkan untuk menguji pada sesi seleksi penerimaan santri baru PPDB Pesantren Ulul Albaab.

Untuk melihat rincian lengkap daftar santri, waktu, dan form penilaian, silakan klik tautan masuk berikut:
${authUrl}

_Link ini aman dan dapat diakses dengan memasukkan 4 digit terakhir nomor WhatsApp Anda._

Jazakumullahu khairan.
Panitia PPDB Pesantren Ulul Albaab`;

      await enqueueWhatsapp({
        pendaftarId: null,
        phone: profile.phone,
        jenisNotif: "broadcast_penguji",
        messageContent: message,
        force: true,
        sendNow: true,
      });

      successCount++;
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      message: `Berhasil mengirim notifikasi ke ${successCount} penguji.`,
    });
  } catch (error: any) {
    console.error("Broadcast Penguji error:", error);
    return NextResponse.json({ error: error.message || "Failed to broadcast" }, { status: 500 });
  }
}
