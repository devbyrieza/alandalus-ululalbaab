/**
 * Jadwal Seleksi API — Main data endpoint for the dashboard.
 *
 * Returns:
 * - Grup A test completion status (akademik, kepribadian, kesiapan)
 * - Grup B available sessions and booked schedules
 * - Condition state (jadwal tersedia or belum)
 * - Triggers notification enqueue (flag-guarded, no duplicate)
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessageJadwalBelum,
  buildMessageJadwalLangsungTersedia } from "@/lib/whatsapp-queue";

function getExamCategory(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("hafalan")) return "HAFALAN";
  if (t.includes("quran") || t.includes("qur'an") || t.includes("bacaan")) return "QURAN";
  if (t.includes("arab") || t.includes("lisan")) return "LISAN_ARAB";
  // W_ORTU must be checked BEFORE W_SANTRI because titles often contain "Orangtua/Wali Santri"
  if (
    t.includes("cawalsan") ||
    t.includes("ortu") ||
    t.includes("orang tua") ||
    t.includes("orangtua") ||
    t.includes("wali")
  ) {
    return "W_ORTU";
  }
  if (t.includes("calsan") || t.includes("santri")) return "W_SANTRI";
  return "OTHER";
}

function sanitizeTitle(title: string): string {
  // Remove anything in parentheses (e.g. examiner names)
  let clean = title.replace(/\s*\(.*?\)\s*/g, "").trim();
  
  // Expand Pewawancara/Penguji Calsan/Cawalsan
  clean = clean.replace(/Pewawancara Calsan/gi, "Pewawancara Calon Santri");
  clean = clean.replace(/Pewawancara Cawalsan/gi, "Pewawancara Calon Orang Tua/Wali Santri");
  clean = clean.replace(/Penguji Calsan/gi, "Penguji Calon Santri");
  clean = clean.replace(/Penguji Cawalsan/gi, "Penguji Calon Orang Tua/Wali Santri");

  // Expand generic Wawancara Santri / Ortu / Orang Tua
  clean = clean.replace(/Wawancara Santri/gi, "Wawancara Calon Santri");
  clean = clean.replace(/Wawancara Ortu/gi, "Wawancara Calon Orang Tua/Wali Santri");
  clean = clean.replace(/Wawancara Orang Tua/gi, "Wawancara Calon Orang Tua/Wali Santri");

  // Expand Calsan
  clean = clean.replace(/calsan/gi, "Calon Santri");

  // Expand Cawalsan
  clean = clean.replace(/cawalsan/gi, "Calon Orang Tua/Wali Santri");

  // Clean up potential double "Calon" or other artifacts
  clean = clean.replace(/Calon Santri Santri/gi, "Calon Santri");
  clean = clean.replace(/Calon Calon/gi, "Calon");
  
  return clean;
}

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// JADWAL H+1 s/d H+14 (Maksimal 2 Pekan):
// 1. Pendaftar hanya dapat memilih jadwal mulai BESOK (H+1). Jadwal hari ini tidak dapat dipilih.
// 2. Pendaftar hanya dapat memilih jadwal maksimal 14 hari (2 pekan) ke depan.
function getEarliestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 1,
      0, 0, 0, 0
    ) - WIB_OFFSET_MS,
  );
}

function getLatestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 14,
      23, 59, 59, 999
    ) - WIB_OFFSET_MS,
  );
}

export async function GET(request: Request) {
  const session = await getSession();
  
  const { searchParams } = new URL(request.url);
  const targetPendaftarId = searchParams.get("pendaftarId");

  let pendaftarId = "";
  let isAdminBypass = false;

  if (session?.role === "admin_super" || session?.role === "admin" || session?.role === "penguji") {
    if (targetPendaftarId) {
      pendaftarId = targetPendaftarId;
      isAdminBypass = true;
    } else {
      return NextResponse.json({ error: "Unauthorized or missing pendaftarId" }, { status: 401 });
    }
  } else if (session?.role === "pendaftar") {
    pendaftarId = session.id;
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch pendaftar with notification flags and status
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: {
        id: true,
        nama_lengkap: true,
        no_hp: true,
        status_pendaftaran: true,
        jenis_kelamin: true,
        jenjang: true,
        notif_belum_jadwal_terkirim: true,
        notif_jadwal_tersedia_terkirim: true,
        notif_hasil_tes_terkirim: true } });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // --- ACCESS GUARD: Only allow if docs are verified ---
    const ALLOWED_STATUSES = [
      "data_completed",
      "docs_uploaded",
      "docs_incomplete",
      "docs_rejected",
      "docs_verified",
      "selection",
      "testing",
      "scheduled",
      "tested",
      "announced",
      "accepted",
      "enrolled",
    ];
    const isLocked = !ALLOWED_STATUSES.includes(
      pendaftar.status_pendaftaran || "",
    );

    if (isLocked && !isAdminBypass) {
      return NextResponse.json({
        data: {
          locked: true,
          message:
            "Tahap Seleksi & Seleksi Online akan terbuka secara otomatis setelah seluruh dokumen Anda diverifikasi oleh Admin.",
          current_status: pendaftar.status_pendaftaran } });
    }

    // ── EARLY EXIT: Seleksi sudah selesai & pendaftar sudah accepted/enrolled ──
    // Tampilkan halaman "Seleksi Selesai" daripada form jadwal
    const SELEKSI_DONE_STATUSES = ["accepted", "enrolled"];
    if (SELEKSI_DONE_STATUSES.includes(pendaftar.status_pendaftaran || "")) {
      return NextResponse.json({
        data: {
          condition: "seleksi_selesai",
          current_status: pendaftar.status_pendaftaran,
          grupA: {
            akademik: { completed: true, label: "Kemampuan Dasar Akademik" },
            kepribadian: { completed: true, label: "Identifikasi Kepribadian" },
            kesiapan: { completed: true, label: "Seleksi Kesiapan" } },
          grupB: { hasSchedules: false, availableSlots: [], booked: [] },
          progress: { completed: 6, total: 6, percentage: 100 } } });
    }

    // 2. Fetch Grup A — Online test completion status
    const nilaiUjian = await prisma.nilaiUjian.findMany({
      where: { pendaftar_id: pendaftarId },
      select: { score_akademik: true, score_kepribadian: true, score_kesiapan: true, detail_akademik: true, detail_kepribadian: true, detail_kesiapan: true, nilai_tes_quran: true, detail_quran: true, nilai_wawancara_santri: true, detail_wawancara: true, nilai_wawancara_ortu: true, detail_cawalsan: true } });

    // Combine to check completion
    const hasAkademik = nilaiUjian.some(
      (n) => n.score_akademik !== null || n.detail_akademik !== null,
    );
    const hasKepribadian = nilaiUjian.some(
      (n) => n.score_kepribadian !== null || n.detail_kepribadian !== null,
    );
    const hasKesiapan = nilaiUjian.some(
      (n) => n.score_kesiapan !== null || n.detail_kesiapan !== null,
    );

    const grupA = {
      akademik: { completed: hasAkademik, label: "Kemampuan Dasar Akademik" },
      kepribadian: {
        completed: hasKepribadian,
        label: "Identifikasi Kepribadian" },
      kesiapan: { completed: hasKesiapan, label: "Seleksi Kesiapan" } };

    // 3. Fetch Grup B — Available exam sessions (future, active within H+1 to H+14 window)
    const availableSessions = await prisma.examSession.findMany({
      where: {
        is_active: true,
        start_time: {
          gte: getEarliestSelectableDate(),
          lte: getLatestSelectableDate(),
        },
      },
      include: {
        _count: { select: { bookings: true } },
        creator: {
          select: {
            id: true,
            role: true,
            secondary_roles: true,
          },
        },
      },
      orderBy: { start_time: "asc" } });

    // 4. Fetch booked schedules for this pendaftar
    const bookedJadwal = await prisma.jadwalUjian.findMany({
      where: { pendaftar_id: pendaftarId },
      include: {
        exam_session: {
          select: {
            id: true,
            title: true,
            start_time: true,
            end_time: true,
            location: true,
            notes: true } },
        nilai_ujian: true },
      orderBy: { created_at: "desc" } });

    // 5. Determine condition
    const hasGrupBSessions = availableSessions.length > 0;

    // 6. Trigger WhatsApp notifications (flag-guarded, async, non-blocking)
    // GUARD: Only notify if they have exactly ZERO existing schedules (past or future)
    // EXTRA GUARD: Only notify if status is 'paid' or 'docs_verified' (prevent 'tested'/'scheduled' alerts)
    const isEligibleForNotif = ["paid", "docs_verified"].includes(
      pendaftar.status_pendaftaran,
    );

    if (pendaftar.no_hp && bookedJadwal.length === 0 && isEligibleForNotif) {
      if (!hasGrupBSessions && !pendaftar.notif_belum_jadwal_terkirim) {
        // Kondisi 1: No sessions yet, send "jadwal belum tersedia"
        const message = buildMessageJadwalBelum(pendaftar.nama_lengkap);
        enqueueWhatsapp({
          pendaftarId: pendaftar.id,
          phone: pendaftar.no_hp,
          jenisNotif: "jadwal_belum",
          messageContent: message }).catch((err) => console.error("Enqueue jadwal_belum error:", err));
      } else if (
        hasGrupBSessions &&
        !pendaftar.notif_jadwal_tersedia_terkirim
      ) {
        // Kondisi 2: Sessions available from the start (or passively), send "jadwal langsung tersedia"
        const message = buildMessageJadwalLangsungTersedia(
          pendaftar.nama_lengkap,
        );
        enqueueWhatsapp({
          pendaftarId: pendaftar.id,
          phone: pendaftar.no_hp,
          jenisNotif: "jadwal_langsung_tersedia",
          messageContent: message }).catch((err) =>
          console.error("Enqueue jadwal_langsung_tersedia error:", err),
        );
      }
    }

    // 7. Build response
    
    // Transform booked jadwal
    const booked: any[] = bookedJadwal.map((j) => {
      const rawTitle = j.exam_session?.title || "Seleksi Santri Baru";
      const hasScoreQuran = j.nilai_ujian?.some((n: any) => {
        const q = n.detail_quran as any;
        return n.nilai_tes_quran != null || !!(q && typeof q === "object" && (q.rekomendasi || q.nama_penguji));
      });
      const hasScoreSantri = j.nilai_ujian?.some((n: any) => {
        const w = n.detail_wawancara as any;
        return n.nilai_wawancara_santri != null || !!(w && typeof w === "object" && (w.rekomendasi || w.nama_penguji));
      });
      const hasScoreOrtu = j.nilai_ujian?.some((n: any) => {
        const c = n.detail_cawalsan as any;
        return n.nilai_wawancara_ortu != null || !!(c && typeof c === "object" && (c.rekomendasi || c.nama_penguji));
      });

      return {
        id: j.id,
        jenis_ujian: sanitizeTitle(rawTitle),
        category: getExamCategory(rawTitle),
        tanggal_ujian: j.tanggal_ujian,
        waktu_mulai: j.exam_session?.start_time || j.waktu_mulai_santri,
        waktu_selesai: j.exam_session?.end_time || j.waktu_selesai_santri,
        lokasi: j.exam_session?.location || j.tempat_santri,
        keterangan: j.catatan || j.exam_session?.notes,
        online_test_link: j.online_test_link,
        status_santri: hasScoreSantri ? "completed" : j.status_santri,
        status_quran: hasScoreQuran ? "completed" : j.status_quran,
        status_ortu: hasScoreOrtu ? "completed" : j.status_ortu };
    });

    

    // --- OFFLINE/MANUAL SCORE HANDLING ---
    // Jika admin sudah menginput nilai secara manual (offline) tanpa melalui booking jadwal,
    // kita perlu membuat entri "booked" sintetis agar UI pendaftar menunjukkan "Selesai".
    
    // Check if they have scores but NO booking
    const hasQuranBooking = bookedJadwal.some(j => getExamCategory(j.exam_session?.title || "") === "QURAN");
    const hasWawancaraSantriBooking = bookedJadwal.some(j => getExamCategory(j.exam_session?.title || "") === "W_SANTRI");
    const hasWawancaraOrtuBooking = bookedJadwal.some(j => getExamCategory(j.exam_session?.title || "") === "W_ORTU");
    
    // Look at nilaiUjian from earlier
    const userNilai = nilaiUjian.length > 0 ? nilaiUjian[0] : null;
    
    if (userNilai) {
      // Helper function to check score existence robustly
      const checkScore = (scoreField: any, detailField: any, rekomendasiField: string) => {
        if (scoreField !== null) return true;
        if (detailField && typeof detailField === 'object') {
          return !!detailField[rekomendasiField] || !!detailField.nama_penguji;
        }
        return false;
      };

      // 1. Quran
      if (!hasQuranBooking && checkScore((userNilai as any).nilai_tes_quran, (userNilai as any).detail_quran, 'rekomendasi')) {
        booked.push({
          id: "SYNTHETIC_QURAN",
          jenis_ujian: "Ujian Tahfidz/Al Qur'an (Admin/Jalur Khusus)",
          tanggal_ujian: new Date() as any,
          waktu_mulai: "00:00",
          waktu_selesai: "00:00", // Makes isSelesai = true in UI
          lokasi: "-",
          keterangan: "Nilai telah disesuaikan oleh sistem/admin",
          category: "QURAN" });
      }

      // 2. Wawancara Santri
      if (!hasWawancaraSantriBooking && checkScore((userNilai as any).nilai_wawancara_santri, (userNilai as any).detail_wawancara, 'rekomendasi')) {
        booked.push({
          id: "SYNTHETIC_W_SANTRI",
          jenis_ujian: "Wawancara Calon Santri (Admin/Jalur Khusus)",
          tanggal_ujian: new Date() as any,
          waktu_mulai: "00:00",
          waktu_selesai: "00:00",
          lokasi: "-",
          keterangan: "Nilai telah disesuaikan oleh sistem/admin",
          category: "W_SANTRI" });
      }

      // 3. Wawancara Ortu
      if (!hasWawancaraOrtuBooking && checkScore((userNilai as any).nilai_wawancara_ortu, (userNilai as any).detail_cawalsan, 'rekomendasi')) {
        booked.push({
          id: "SYNTHETIC_W_ORTU",
          jenis_ujian: "Wawancara Calon Orang Tua/Wali (Admin/Jalur Khusus)",
          tanggal_ujian: new Date() as any,
          waktu_mulai: "00:00",
          waktu_selesai: "00:00",
          lokasi: "-",
          keterangan: "Nilai telah disesuaikan oleh sistem/admin",
          category: "W_ORTU" });
      }
    }
    // -------------------------------------

    // --- CROSS-EXAMINER DUAL-ROLE CONFLICT DETECTION ---
    // Fetch future bookings where examiners are already occupied
    const activeExaminerBookings = await prisma.jadwalUjian.findMany({
      where: {
        exam_session: {
          start_time: { gte: new Date() },
        },
      },
      select: {
        id: true,
        penguji_quran_id: true,
        penguji_hafalan_id: true,
        penguji_santri_id: true,
        penguji_ortu_id: true,
        penguji_arab_id: true,
        exam_session: {
          select: {
            id: true,
            start_time: true,
            end_time: true,
            created_by: true,
          },
        },
      },
    });

    const isExaminerBusy = (session: any) => {
      if (!session.created_by) return false;

      // Sesi yang dibuat admin atau kuota > 1 adalah sesi umum / pool, bukan 1-on-1 penguji tunggal
      const creatorRole = session.creator?.role;
      if (creatorRole === "admin" || creatorRole === "admin_super") return false;
      if (session.quota > 1) return false;

      const sStart = new Date(session.start_time).getTime();
      const sEnd = new Date(session.end_time).getTime();
      if (isNaN(sStart) || isNaN(sEnd)) return false;

      return activeExaminerBookings.some((b) => {
        // Exclude the session itself if it is the one booked
        if (b.exam_session?.id === session.id) return false;

        // Cek bentrok penguji (termasuk role ganda Al-Qur'an & Hafalan)
        const isThisExaminer =
          b.penguji_quran_id === session.created_by ||
          b.penguji_hafalan_id === session.created_by ||
          b.penguji_santri_id === session.created_by ||
          b.penguji_ortu_id === session.created_by ||
          b.penguji_arab_id === session.created_by;

        if (!isThisExaminer || !b.exam_session) return false;

        const bStart = new Date(b.exam_session.start_time).getTime();
        const bEnd = new Date(b.exam_session.end_time).getTime();
        if (isNaN(bStart) || isNaN(bEnd)) return false;

        // Check overlapping intervals: [sStart, sEnd) overlaps with [bStart, bEnd)
        return sStart < bEnd && sEnd > bStart;
      });
    };

    // Filter jenjang & penentuan alur seleksi
    const cleanJenjang = (pendaftar.jenjang || "").toUpperCase();
    // Hanya langsung SMA (Ulul Albaab) atau langsung MA (Al-Imam) tanpa IL yang memiliki 8 komponen
    const isDirectSMAorMA = cleanJenjang === "SMA" || cleanJenjang === "MA";

    // ── EVALUASI KELENGKAPAN 6 KOMPONEN NORMAL (TAHAP 1) ──
    const isGrupACompleted = Boolean(hasAkademik && hasKepribadian && hasKesiapan);

    const hasScoreQuran = (userNilai as any)?.score_quran != null || (userNilai as any)?.nilai_tes_quran != null;
    const hasQuranCompleted = bookedJadwal.some((j) => {
      const cat = getExamCategory(j.exam_session?.title || "");
      if (cat !== "QURAN") return false;
      const s = j.nilai_ujian?.some((n: any) => n.score_quran != null || n.nilai_tes_quran != null || (n.detail_quran && (n.detail_quran.rekomendasi || n.detail_quran.nama_penguji)));
      return s || j.status_quran === "completed";
    }) || hasScoreQuran;

    const hasScoreSantri = (userNilai as any)?.score_wawancara != null || (userNilai as any)?.nilai_wawancara_santri != null;
    const hasSantriCompleted = bookedJadwal.some((j) => {
      const cat = getExamCategory(j.exam_session?.title || "");
      if (cat !== "W_SANTRI") return false;
      const s = j.nilai_ujian?.some((n: any) => n.score_wawancara != null || n.nilai_wawancara_santri != null || (n.detail_wawancara && (n.detail_wawancara.rekomendasi || n.detail_wawancara.nama_pewawancara)));
      return s || j.status_santri === "completed";
    }) || hasScoreSantri;

    const hasScoreOrtu = (userNilai as any)?.nilai_wawancara_ortu != null;
    const hasOrtuCompleted = bookedJadwal.some((j) => {
      const cat = getExamCategory(j.exam_session?.title || "");
      if (cat !== "W_ORTU") return false;
      const s = j.nilai_ujian?.some((n: any) => n.nilai_wawancara_ortu != null || (n.detail_cawalsan && (n.detail_cawalsan.rekomendasi || n.detail_cawalsan.nama_pewawancara)));
      return s || j.status_ortu === "completed";
    }) || hasScoreOrtu;

    const isTahap1Completed = isGrupACompleted && hasQuranCompleted && hasSantriCompleted && hasOrtuCompleted;
    const stage2Unlocked = isDirectSMAorMA && isTahap1Completed;

    // Filter sesi yang boleh dipilih berdasarkan tahap seleksi
    const openSlots: any[] = [];

    availableSessions.forEach((s) => {
      const busy = isExaminerBusy(s);
      const isFull = s._count.bookings >= s.quota || busy;
      const cat = getExamCategory(s.title || "");

      // Jika pendaftar BUKAN SMA/MA langsung, jangan pernah tampilkan sesi HAFALAN atau LISAN_ARAB
      if (!isDirectSMAorMA && (cat === "HAFALAN" || cat === "LISAN_ARAB")) {
        return;
      }

      // Jika pendaftar SMA/MA langsung tapi belum menyelesaikan 6 seleksi normal, kunci akses ke HAFALAN & LISAN_ARAB
      if (isDirectSMAorMA && !stage2Unlocked && (cat === "HAFALAN" || cat === "LISAN_ARAB")) {
        return;
      }

      // Format judul
      let displayTitle = sanitizeTitle(s.title || "Seleksi Santri Baru");
      if (cat === "QURAN") {
        displayTitle = "Tes Bacaan Al-Qur'an";
      } else if (cat === "HAFALAN") {
        displayTitle = "Tes Hafalan Al-Qur'an";
      }

      openSlots.push({
        id: s.id,
        title: displayTitle,
        raw_title: s.title,
        category: cat,
        start_time: s.start_time,
        end_time: s.end_time,
        quota: s.quota,
        booked: busy ? s.quota : s._count.bookings,
        location: s.location,
        notes: s.notes,
        isFull,
      });

      // ── DUAL ROLE PENGUJI QURAN & HAFALAN (SHARED EXCLUSIVE SLOT) ──
      // Siapapun penguji Al-Qur'an, dia otomatis juga bertindak sebagai penguji Hafalan.
      // Sesi ketersediaan yang sama dapat dipilih untuk Tes Hafalan oleh calon santri SMA/MA (jika tahap 2 sudah terbuka).
      const isQuranSession = cat === "QURAN" || (s.creator?.role && ["penguji", "penguji_quran", "penguji_hafalan"].includes(s.creator.role));
      if (isQuranSession && cat !== "HAFALAN" && stage2Unlocked) {
        openSlots.push({
          id: s.id,
          title: "Tes Hafalan Al-Qur'an",
          raw_title: s.title,
          category: "HAFALAN",
          start_time: s.start_time,
          end_time: s.end_time,
          quota: s.quota,
          booked: busy ? s.quota : s._count.bookings,
          location: s.location,
          notes: s.notes,
          isFull,
        });
      }
    });

    // Perhitungan Progress
    const totalTests = isDirectSMAorMA ? 8 : 6;
    const grupBCompleted = bookedJadwal.filter((j) => {
      const cat = getExamCategory(j.exam_session?.title || "");
      if (cat === "QURAN") {
        return hasQuranCompleted;
      } else if (cat === "W_ORTU") {
        return hasOrtuCompleted;
      } else if (cat === "W_SANTRI") {
        return hasSantriCompleted;
      } else if (cat === "HAFALAN") {
        const hasHafalan = j.nilai_ujian?.some((n: any) => (n as any).score_hafalan != null || (n as any).nilai_hafalan_total != null || ((n as any).detail_hafalan && (n as any).detail_hafalan.rekomendasi));
        return hasHafalan || (j as any).status_hafalan === "completed";
      } else if (cat === "LISAN_ARAB") {
        const hasArab = j.nilai_ujian?.some((n: any) => (n as any).score_arab != null || (n as any).nilai_arab_total != null || ((n as any).detail_arab && (n as any).detail_arab.rekomendasi));
        return hasArab || (j as any).status_arab === "completed";
      }
      return false;
    }).length;

    const completedTests =
      [hasAkademik, hasKepribadian, hasKesiapan].filter(Boolean).length +
      grupBCompleted;
    const progress = Math.round((completedTests / totalTests) * 100);

    return NextResponse.json({
      data: {
        isSMA: isDirectSMAorMA,
        isDirectSMAorMA,
        stage2Unlocked,
        isTahap1Completed,
        jenjang: pendaftar.jenjang,
        grupA,
        grupB: {
          hasSchedules: hasGrupBSessions,
          availableSlots: openSlots,
          booked },
        progress: {
          completed: completedTests,
          total: totalTests,
          percentage: Math.min(progress, 100) },
        condition: hasGrupBSessions ? "jadwal_tersedia" : "jadwal_belum" } });
  } catch (error: any) {
    console.error("GET undangan-seleksi error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

