import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause, resolveTahunAjaran } from "@/lib/utils/admin";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (!session.role.startsWith("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tahunAjaranParam = searchParams.get("tahun_ajaran_id") || "2027/2028";

    // 2. Resolve Target Year
    let targetYear = tahunAjaranParam;
    if (targetYear && targetYear.includes("-")) {
      // If it's a UUID, resolve its name from database
      const taRecord = await prisma.tahunAjaran.findUnique({
        where: { id: targetYear },
        select: { nama: true }
      });
      if (taRecord?.nama) {
        targetYear = taRecord.nama;
      }
    }

    // 3. Fetch all pendaftar with their PENDAFTARAN payment(s)
    // We query broadly and then filter accurately by resolved academic year
    const where = await getAdminWhereClause("all") as any;
    const allPendaftar = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        jenjang: true,
        status_pendaftaran: true,
        tahun_ajaran_id: true,
        created_at: true,
        updated_at: true,
        tahun_ajaran: {
          select: { id: true, nama: true }
        },
        pembayaran: {
          where: {
            jenis_pembayaran: "PENDAFTARAN" as any },
          select: {
            id: true,
            jumlah: true,
            status_pembayaran: true,
            metode_pembayaran: true,
            created_at: true,
            updated_at: true },
          orderBy: { created_at: "desc" } } } as any,
      orderBy: { created_at: "desc" } });

    // Filter by academic year
    const pendaftar = allPendaftar.filter((p: any) => {
      if (targetYear === "all" || targetYear === "ALL") return true;
      const resolved = resolveTahunAjaran(p);
      return resolved === targetYear || p.tahun_ajaran?.nama === targetYear;
    });

    // 4. Transform
    const data = (pendaftar as any[]).map((p, index) => {
      const payments = p.pembayaran || [];
      const latestPayment = payments[0] || null;

      // Determine overall payment status
      const verifiedPayment = payments.find(
        (pay: any) => pay.status_pembayaran === "verified",
      );
      const pendingPayment = payments.find(
        (pay: any) => !["verified", "rejected"].includes(pay.status_pembayaran),
      );

      let statusPembayaran = "BELUM_UPLOAD";
      let statusColor = "gray";
      if (verifiedPayment) {
        statusPembayaran = "TERVERIFIKASI";
        statusColor = "green";
      } else if (pendingPayment) {
        statusPembayaran = "MENUNGGU_VERIFIKASI";
        statusColor = "orange";
      } else if (
        payments.some((pay: any) => pay.status_pembayaran === "rejected")
      ) {
        statusPembayaran = "DITOLAK";
        statusColor = "red";
      }

      const totalBayar = payments
        .filter((pay: any) => pay.status_pembayaran === "verified")
        .reduce((sum: number, pay: any) => sum + Number(pay.jumlah), 0);

      const taResolved = resolveTahunAjaran(p);

      return {
        no: index + 1,
        id: p.id,
        nama: p.nama_lengkap,
        nomor_pendaftaran: p.nomor_pendaftaran,
        jenjang: p.jenjang || "-",
        tahun_ajaran: taResolved,
        status_pendaftaran: p.status_pendaftaran,
        total_bayar: totalBayar,
        jumlah_pembayaran: latestPayment ? Number(latestPayment.jumlah) : 0,
        status_pembayaran: statusPembayaran,
        status_color: statusColor,
        metode: latestPayment?.metode_pembayaran || "-",
        tanggal_daftar: p.created_at,
        last_updated: latestPayment?.updated_at || p.updated_at };
    });

    // 5. Summary stats (strictly for the filtered year)
    const summary = {
      total: data.length,
      terverifikasi: data.filter((d) => d.status_pembayaran === "TERVERIFIKASI")
        .length,
      menunggu: data.filter(
        (d) => d.status_pembayaran === "MENUNGGU_VERIFIKASI",
      ).length,
      belum_upload: data.filter((d) => d.status_pembayaran === "BELUM_UPLOAD")
        .length,
      ditolak: data.filter((d) => d.status_pembayaran === "DITOLAK").length,
      total_terkumpul: data.reduce((sum, d) => sum + d.total_bayar, 0) };

    return NextResponse.json({ success: true, data, summary, filter_ta: targetYear });
  } catch (error) {
    console.error("Error fetching pembayaran pendaftaran rekap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
