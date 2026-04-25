import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (["admin_super", "admin", "admin_berkas", "admin_keuangan", "penguji"].includes(session.role)) {
      return session;
    }
  } catch { }
  return null;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get("tahun_ajaran_id");

    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Determine Year ID
    let finalTAId: string | undefined = tahunAjaranId || undefined;
    if (!finalTAId) {
      const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
      });
      if (activeTA) finalTAId = activeTA.id;
    }

    if (!finalTAId) {
      console.error("❌ [API Stats] No active Year of Study found");
      return NextResponse.json({ error: "No active Year of Study found" }, { status: 404 });
    }

    // 2. Build where clause
    const where = getAdminWhereClause(finalTAId);
    console.log(`📊 [API Stats] Fetching for TA: ${finalTAId}`);

    // 3. Fetch Data
    const [pendaftarData, pembayaranData] = await Promise.all([
      prisma.pendaftar.findMany({
        where,
        select: {
          id: true,
          status_pendaftaran: true,
          jenjang: true,
          provinsi: true,
          jenis_kelamin: true,
          nama_lengkap: true
        }
      }),
      prisma.pembayaran.findMany({
        where: { tahun_ajaran_id: finalTAId },
        select: { pendaftar_id: true, status_pembayaran: true, jenis_pembayaran: true }
      })
    ]);

    console.log(`✅ [API Stats] Data fetched. Pendaftar: ${pendaftarData.length}, Pembayaran: ${pembayaranData.length}`);

    // 4. Calculate Stats
    const total_pendaftar = pendaftarData.length;
    const statusCounts: Record<string, number> = {};
    const jenjangCounts: Record<string, any> = {};
    const genderCounts: Record<string, number> = { "Laki-laki": 0, "Perempuan": 0, "Belum Diisi": 0 };

    pendaftarData.forEach(p => {
      const status = p.status_pendaftaran || "draft";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Normalize Jenjang: Handle common variations
      let jRaw = (p.jenjang || "UNKNOWN").toUpperCase();
      let jenjang = "MTS"; // Default fallback
      if (jRaw.includes("MTS")) jenjang = "MTS";
      else if (jRaw.includes("IL")) jenjang = "IL";
      else if (jRaw.includes("SMA")) jenjang = "SMA";
      else jenjang = "MTS"; // Map unknown to MTS as it's the largest pool

      if (!jenjangCounts[jenjang]) {
        jenjangCounts[jenjang] = {
          total: 0, putra: 0, putri: 0,
          accepted: 0, accepted_putra: 0, accepted_putri: 0,
          ulang_total: 0, ulang_putra: 0, ulang_putri: 0
        };
      }

      const j = jenjangCounts[jenjang];
      // Normalize Gender mapping (L/P or Full String)
      const isL = p.jenis_kelamin === "L" || p.jenis_kelamin === "Laki-laki";
      const isP = p.jenis_kelamin === "P" || p.jenis_kelamin === "Perempuan";

      j.total++;
      if (isL) { 
        j.putra++; 
        genderCounts["Laki-laki"]++; 
      } else if (isP) { 
        j.putri++; 
        genderCounts["Perempuan"]++; 
      } else { 
        genderCounts["Belum Diisi"]++; 
      }

      // Diterima Logic: accepted or enrolled only (announced is for Cadangan)
      if (status === "accepted" || status === "enrolled") {
        j.accepted++;
        if (isL) j.accepted_putra++;
        if (isP) j.accepted_putri++;
      }

      // Cadangan Logic: announced
      if (status === "announced") {
        j.cadangan = (j.cadangan || 0) + 1;
        if (isL) j.cadangan_putra = (j.cadangan_putra || 0) + 1;
        if (isP) j.cadangan_putri = (j.cadangan_putri || 0) + 1;
      }

      // Daftar Ulang Logic: enrolled only
      if (status === "enrolled") {
        j.ulang_total++;
        if (isL) j.ulang_putra++;
        if (isP) j.ulang_putri++;
      }
    });

    const stats = {
      total_pendaftar,
      diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0),
      cadangan: statusCounts.announced || 0,
      daftar_ulang: statusCounts.enrolled || 0,
      
      // Secondary metrics
      sudah_bayar: total_pendaftar - (statusCounts.draft || 0), 
      sudah_isi_data: total_pendaftar - (statusCounts.draft || 0) - (statusCounts.waiting_payment || 0),
      waiting_payment: statusCounts.waiting_payment || 0,
      waiting_docs: statusCounts.data_completed || 0,

      stats_per_jenjang: ["MTS", "IL", "SMA"].map(jenjang => {
        const data = jenjangCounts[jenjang] || {
          total: 0, putra: 0, putri: 0,
          accepted: 0, accepted_putra: 0, accepted_putri: 0,
          cadangan: 0, cadangan_putra: 0, cadangan_putri: 0,
          ulang_total: 0, ulang_putra: 0, ulang_putri: 0
        };
        const QUOTAS: Record<string, any> = {
          MTS: { putra: 49, putri: 24, total: 73 },
          IL: { putra: 27, putri: 12, total: 39 },
          SMA: { putra: 0, putri: 0, total: 0 }
        };
        const q = QUOTAS[jenjang];
        return {
          jenjang,
          kuota_putra: q.putra, kuota_putri: q.putri, kuota_total: q.total,
          pendaftar: data.total, pendaftar_putra: data.putra, pendaftar_putri: data.putri,
          diterima: data.accepted,
          diterima_putra: data.accepted_putra,
          diterima_putri: data.accepted_putri,
          cadangan: data.cadangan || 0,
          cadangan_putra: data.cadangan_putra || 0,
          cadangan_putri: data.cadangan_putri || 0,
          daftar_ulang: data.ulang_total,
          ulang_putra: data.ulang_putra,
          ulang_putri: data.ulang_putri
        };
      }),

      stats_gender: genderCounts,
      pie_chart_status: {
        diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0),
        cadangan: statusCounts.announced || 0,
        menunggu: (statusCounts.tested || 0) + (statusCounts.scheduled || 0) + (statusCounts.docs_verified || 0),
        proses: (statusCounts.draft || 0) + (statusCounts.verified || 0) + (statusCounts.data_completed || 0),
        ditolak: statusCounts.rejected || 0,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
