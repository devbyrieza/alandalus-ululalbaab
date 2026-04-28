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
    // Hudzaifah Al fawwaz saat ini punya ILA2600003A
    // Kita cari nomor ILA berikutnya yang kosong setelah semua yang ada
    const allILA = await prisma.pendaftar.findMany({
      where: { nomor_pendaftaran: { startsWith: "ILA26" } },
      select: { nomor_pendaftaran: true },
    });

    // Cari nomor bersih yang available
    // Cek dari ILA2600050 ke atas untuk nomor fresh yang tidak konflik
    const usedNomors = new Set(allILA.map(p => p.nomor_pendaftaran));
    let nomorBaru: string | null = null;

    for (let i = 50; i <= 999; i++) {
      const candidate = `ILA26000${i.toString().padStart(2, "0")}`;
      if (!usedNomors.has(candidate)) {
        nomorBaru = candidate;
        break;
      }
    }

    if (!nomorBaru) {
      return NextResponse.json({ error: "Tidak ada nomor tersedia" }, { status: 409 });
    }

    const updated = await prisma.pendaftar.update({
      where: { nomor_pendaftaran: "ILA2600003A" },
      data: { nomor_pendaftaran: nomorBaru }
    });

    return NextResponse.json({
      success: true,
      nama: updated.nama_lengkap,
      sebelum: "ILA2600003A",
      sesudah: nomorBaru,
      login_baru: nomorBaru,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
