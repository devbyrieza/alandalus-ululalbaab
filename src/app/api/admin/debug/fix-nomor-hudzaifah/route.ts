import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY - DELETE AFTER USE

export async function GET() {
  try {
    // Cek siapa yang pakai ILA2600003
    const conflict = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: "ILA2600003" },
      select: { id: true, nama_lengkap: true, jenjang: true, nomor_pendaftaran: true, nik: true }
    });

    // Cek Hudzaifah saat ini
    const hudzaifah = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: "ILA2600003A" },
      select: { id: true, nama_lengkap: true, jenjang: true, nomor_pendaftaran: true }
    });

    // Cek nomor ILA yang sudah ada untuk tahu range terakhir
    const allILA = await prisma.pendaftar.findMany({
      where: { nomor_pendaftaran: { startsWith: "ILA" } },
      select: { nomor_pendaftaran: true, nama_lengkap: true },
      orderBy: { nomor_pendaftaran: "asc" }
    });

    return NextResponse.json({
      pemegang_ILA2600003: conflict,
      hudzaifah_saat_ini: hudzaifah,
      semua_nomor_ILA: allILA,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    // ILA2600015 adalah nomor terakhir di seri 2600
    // ILA2600016 tersedia → nomor bersih untuk Hudzaifah
    const NOMOR_BARU = "ILA2600016";

    const conflict = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: NOMOR_BARU }
    });

    if (conflict) {
      return NextResponse.json({
        error: `${NOMOR_BARU} sudah dipakai oleh ${conflict.nama_lengkap}`
      }, { status: 409 });
    }

    const updated = await prisma.pendaftar.update({
      where: { nomor_pendaftaran: "ILA2600003A" },
      data: { nomor_pendaftaran: NOMOR_BARU }
    });

    return NextResponse.json({
      success: true,
      nama: updated.nama_lengkap,
      sebelum: "ILA2600003A",
      sesudah: NOMOR_BARU,
      login_baru: NOMOR_BARU,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
