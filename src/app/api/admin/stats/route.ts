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

    // Build where clause
    const where = getAdminWhereClause(tahunAjaranId || undefined) as any;

    // If no year specified and no active year found by utility, find active manually for deeper payment stats
    if (!where.tahun_ajaran_id) {
      const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
      });
      if (activeTA) {
        where.tahun_ajaran_id = activeTA.id;
      }
    }

    console.log(`[API] Admin Stats: ActiveTA=${where.tahun_ajaran_id || 'None'}, Role=${session.role}, Where=${JSON.stringify(where)}`);

    // Fetch pendaftar data with status, jenjang, and location
    const pendaftarData = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        status_pendaftaran: true,
        jenjang: true,
        provinsi: true,
        jenis_kelamin: true,
      },
    });

    // Fetch pembayaran data for the same year
    const pembayaranData = await prisma.pembayaran.findMany({
      where: {
        tahun_ajaran_id: where.tahun_ajaran_id || undefined
      },
      select: {
        pendaftar_id: true,
        status_pembayaran: true,
      },
    });

    // Calculate pendaftar status counts
    const total_pendaftar = pendaftarData.length;
    const statusCounts: Record<string, number> = {};
    
    // Detailed Jenjang Counts with gender breakdown
    interface JenjangMetric {
      total: number;
      putra: number;
      putri: number;
      ujian_total: number;
      ujian_putra: number;
      ujian_putri: number;
      ulang_total: number;
      ulang_putra: number;
      ulang_putri: number;
      accepted: number;
      accepted_putra: number;
      accepted_putri: number;
    }
    const jenjangCounts: Record<string, JenjangMetric> = {};
    const provinsiCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = { "Laki-laki": 0, "Perempuan": 0, "Belum Diisi": 0 };

    pendaftarData.forEach((item) => {
      const status = item.status_pendaftaran;
      // Normalize Jenjang to UPPERCASE and clean it
      const jenjang = (item.jenjang || "UNKNOWN").toUpperCase().trim();
      
      // Normalize Provinsi
      let provinsi = item.provinsi || "Belum Diisi";
      if (provinsi && provinsi !== "Belum Diisi") {
        provinsi = provinsi.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      
      // Normalize Gender mapping (L/P -> Laki-laki/Perempuan)
      let gender = item.jenis_kelamin || "Unknown";
      if (gender === "L") gender = "Laki-laki";
      if (gender === "P") gender = "Perempuan";

      // Status counts
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Jenjang metrics initialization
      if (!jenjangCounts[jenjang]) {
        jenjangCounts[jenjang] = { 
          total: 0, putra: 0, putri: 0, 
          ujian_total: 0, ujian_putra: 0, ujian_putri: 0,
          ulang_total: 0, ulang_putra: 0, ulang_putri: 0,
          accepted: 0, accepted_putra: 0, accepted_putri: 0
        };
      }
      
      const jData = jenjangCounts[jenjang];
      jData.total += 1;
      if (gender === "Laki-laki") jData.putra += 1;
      if (gender === "Perempuan") jData.putri += 1;

      // Sudah Ujian mapping
      const isUjian = ["tested", "announced", "accepted", "enrolled"].includes(status);
      if (isUjian) {
        jData.ujian_total += 1;
        if (gender === "Laki-laki") jData.ujian_putra += 1;
        if (gender === "Perempuan") jData.ujian_putri += 1;
      }

      // Daftar Ulang mapping
      if (status === "enrolled") {
        jData.ulang_total += 1;
        if (gender === "Laki-laki") jData.ulang_putra += 1;
        if (gender === "Perempuan") jData.ulang_putri += 1;
      }

      // Accepted (Diterima) mapping
      if (status === "accepted" || status === "enrolled") {
        jData.accepted += 1;
        if (gender === "Laki-laki") jData.accepted_putra += 1;
        if (gender === "Perempuan") jData.accepted_putri += 1;
      }

      // Provinsi counts
      provinsiCounts[provinsi] = (provinsiCounts[provinsi] || 0) + 1;

      // Gender counts
      if (gender === "Laki-laki" || gender === "Perempuan") {
        genderCounts[gender] += 1;
      } else {
        genderCounts["Belum Diisi"] += 1;
      }
    });

    // Calculate pembayaran status counts
    const pembayaranCounts: Record<string, number> = {};
    const pendaftarWithPayment = new Set<string>();
    pembayaranData.forEach((item) => {
      const status = item.status_pembayaran;
      pembayaranCounts[status] = (pembayaranCounts[status] || 0) + 1;
      pendaftarWithPayment.add(item.pendaftar_id);
    });

    // Quota configuration (Moved to API for centralized management)
    // Updated to match Fixed Data 2026/2027 (DATA_SANTRI_ULUL_ALBAAB_2026-2027-1.md)
    const QUOTAS: Record<string, { putra: number; putri: number; total: number }> = {
      MTS: { putra: 49, putri: 24, total: 73 },
      IL: { putra: 27, putri: 12, total: 39 },
      SMA: { putra: 0, putri: 0, total: 0 }
    };

    // Comprehensive stats mapping
    const stats = {
      total_pendaftar,

      // === PEMBAYARAN ===
      sudah_bayar:
        (statusCounts.paid || 0) +
        (statusCounts.verified || 0) +
        (statusCounts.data_completed || 0) +
        (statusCounts.docs_uploaded || 0) +
        (statusCounts.docs_verified || 0) +
        (statusCounts.scheduled || 0) +
        (statusCounts.tested || 0) +
        (statusCounts.announced || 0) +
        (statusCounts.accepted || 0) +
        (statusCounts.enrolled || 0),

      // === DATA LENGKAP ===
      sudah_isi_data:
        (statusCounts.data_completed || 0) +
        (statusCounts.docs_uploaded || 0) +
        (statusCounts.docs_verified || 0) +
        (statusCounts.scheduled || 0) +
        (statusCounts.tested || 0) +
        (statusCounts.announced || 0) +
        (statusCounts.accepted || 0) +
        (statusCounts.enrolled || 0),

      // === PENERIMAAN ===
      diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0),
      daftar_ulang: statusCounts.enrolled || 0,

      // === STATISTIK PER JENJANG (Expanded) ===
      stats_per_jenjang: Object.entries(jenjangCounts).map(([jenjang, data]) => {
        const quota = QUOTAS[jenjang] || { putra: 0, putri: 0, total: 0 };
        return {
          jenjang,
          // Quotas
          kuota_putra: quota.putra,
          kuota_putri: quota.putri,
          kuota_total: quota.total,
          // Pendaftar
          pendaftar: data.total,
          pendaftar_putra: data.putra,
          pendaftar_putri: data.putri,
          // Sudah Ujian
          sudah_ujian: data.ujian_total,
          ujian_putra: data.ujian_putra,
          ujian_putri: data.ujian_putri,
          // Sudah Daftar Ulang
          daftar_ulang: data.ulang_total,
          ulang_putra: data.ulang_putra,
          ulang_putri: data.ulang_putri,
          // Accepted (Diterima)
          diterima: data.accepted,
          diterima_putra: data.accepted_putra,
          diterima_putri: data.accepted_putri
        };
      }),

      // Statistics per Province
      stats_per_provinsi: Object.entries(provinsiCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([provinsi, jumlah]) => ({ provinsi, jumlah })),

      // Gender Statistics
      stats_gender: genderCounts,

      // Pie Chart Data
      pie_chart_status: {
        diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0),
        menunggu: (statusCounts.docs_verified || 0) + (statusCounts.scheduled || 0) + (statusCounts.tested || 0) + (statusCounts.announced || 0),
        proses: (statusCounts.draft || 0) + (statusCounts.waiting_payment || 0) + (statusCounts.awaiting_payment || 0) + 
                (statusCounts.paid || 0) + (statusCounts.payment_verification || 0) + (statusCounts.payment_rejected || 0) +
                (statusCounts.verified || 0) + (statusCounts.data_completed || 0) + (statusCounts.docs_uploaded || 0),
        ditolak: statusCounts.rejected || 0,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
