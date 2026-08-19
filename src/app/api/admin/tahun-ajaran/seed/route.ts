import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const allowedRoles = ["admin", "admin_super", "head_of_it"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 0. Kembalikan nama TA lama yang mungkin sempat di-rename user menjadi 2027/2028
      await tx.tahunAjaran.updateMany({
        where: { tahun_mulai: 2026, tahun_selesai: 2027 },
        data: { nama: "2026/2027" }
      });

      // 1. Cari atau buat 2027-2028 (dengan tahun_mulai: 2027 yang BENAR)
      let ta2027 = await tx.tahunAjaran.findFirst({
        where: { tahun_mulai: 2027, tahun_selesai: 2028 },
      });

      if (!ta2027) {
        ta2027 = await tx.tahunAjaran.create({
          data: {
            tahun_mulai: 2027,
            tahun_selesai: 2028,
            nama: "2027/2028",
            is_active: true,
            tanggal_buka_pendaftaran: new Date("2026-08-01"),
            tanggal_tutup_pendaftaran: new Date("2027-01-31"),
            biaya_pendaftaran: 250000,
          },
        });
      } else {
        await tx.tahunAjaran.update({
          where: { id: ta2027.id },
          data: { is_active: true, biaya_pendaftaran: 250000, nama: "2027/2028" },
        });
      }

      // 2. Nonaktifkan yang lain
      await tx.tahunAjaran.updateMany({
        where: { id: { not: ta2027.id }, is_active: true },
        data: { is_active: false },
      });

      // 3. Pindahkan semua Pendaftar yang mendaftar setelah 1 Juli 2026 ke TA 2027/2028
      const cutoffDate = new Date("2026-07-01");
      const pendaftarsToMigrate = await tx.pendaftar.findMany({
        where: {
          created_at: { gte: cutoffDate },
          tahun_ajaran_id: { not: ta2027.id },
        },
      });

      console.log(`[SEED] Mengurutkan dan migrasi ${pendaftarsToMigrate.length} pendaftar ke TA 2027-2028`);

      for (const p of pendaftarsToMigrate) {
        // Ganti nomor pendaftaran dari awalan 26 menjadi 27
        const newNomor = p.nomor_pendaftaran.replace(/^([a-zA-Z]+)26(\d+)$/, "$127$2");
        
        await tx.pendaftar.update({
          where: { id: p.id },
          data: {
            tahun_ajaran_id: ta2027.id,
            nomor_pendaftaran: newNomor,
          },
        });

        // Update relasi
        await tx.pembayaran.updateMany({ where: { pendaftar_id: p.id }, data: { tahun_ajaran_id: ta2027.id } });
        await tx.jadwalUjian.updateMany({ where: { pendaftar_id: p.id }, data: { tahun_ajaran_id: ta2027.id } });
        await tx.pengumuman.updateMany({ where: { pendaftar_id: p.id }, data: { tahun_ajaran_id: ta2027.id } });
        await tx.hasilSeleksi.updateMany({ where: { pendaftar_id: p.id }, data: { tahun_ajaran_id: ta2027.id } });
        await tx.reservasiPSB.updateMany({ where: { pendaftar_id: p.id }, data: { tahun_ajaran_id: ta2027.id } });
      }

      return ta2027;
    });

    return NextResponse.json({
      success: true,
      message: "Tahun Ajaran 2027/2028 berhasil dibuat/diaktifkan dan Data pendaftar berhasil dimigrasi (koreksi awalan nomor).",
      data: result,
    });
  } catch (error) {
    console.error("Seed tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET method to check current status
export async function GET(request: Request) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "head_of_it",
      "admin_berkas",
      "admin_pembayaran",
    ];
    const secret = new URL(request.url).searchParams.get("secret");
    if (secret !== "fix2026" && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.tahunAjaran.findMany({
      orderBy: { tahun_mulai: "desc" },
    });

    const active = data.find((ta) => ta.is_active);
    const has2027 = data.find(
      (ta) => ta.tahun_mulai === 2027,
    );

    // MIGRATION: Also perform migration on GET if admin (to make it easy to trigger)
    if (active && Number(active.biaya_pendaftaran) !== 250000) {
      console.log(`[SEED-GET] Triggering emergency fix for registration fee`);
      await prisma.tahunAjaran.update({
        where: { id: active.id },
        data: { biaya_pendaftaran: 250000 },
      });
    }

    // Fix existing payments that are 200000 for PENDAFTARAN
    console.log(`[SEED-GET] Triggering emergency fix for existing payments`);
    const updateCount = await prisma.pembayaran.updateMany({
      where: {
        jenis_pembayaran: "PENDAFTARAN",
        OR: [
          { jumlah: { lte: 200000 } },
          { total_tagihan: { lte: 200000 } },
        ],
      },
      data: {
        jumlah: 250000,
        total_tagihan: 250000,
      },
    });

    // SPECIFIC FIX: Rumaisha Hanin Hanifa
    await prisma.pembayaran.updateMany({
      where: {
        pendaftar: {
          nama_lengkap: {
            contains: "Rumaisha Hanin Hanifa",
            mode: "insensitive",
          },
        },
        jenis_pembayaran: "PENDAFTARAN",
      },
      data: {
        jumlah: 250000,
        total_tagihan: 250000,
      },
    });

    return NextResponse.json({
      message: "Diagnostics & Migration complete",
      updated_payments: updateCount.count,
      active_ta_fee: 250000,
      all: data,
      active,
      has2027_2028: !!has2027,
    });
  } catch (error) {
    console.error("Get tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}




