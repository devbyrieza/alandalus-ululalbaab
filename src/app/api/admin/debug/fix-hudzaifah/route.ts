import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY ENDPOINT - DELETE AFTER USE

export async function GET() {
  try {
    const all = await prisma.pendaftar.findMany({
      where: {
        nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" },
      },
      select: {
        id: true,
        nama_lengkap: true,
        jenjang: true,
        nomor_pendaftaran: true,
        nik: true,
      }
    });
    return NextResponse.json({ data: all });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Target: Hudzaifah Al fawwaz (ID dari production DB via GET)
    const TARGET_ID = "6d5c0aa1-b9aa-43a5-b6e8-27577ad20ad4";
    const NOMOR_LAMA = "SMA2600003";

    // Coba beberapa kandidat nomor baru (ILA = IL Putra)
    const candidates = ["ILA2600003", "ILA2600003A", "ILA26000031", "ILA2600003B"];
    let nomorBaru: string | null = null;

    for (const candidate of candidates) {
      const conflict = await prisma.pendaftar.findUnique({
        where: { nomor_pendaftaran: candidate }
      });
      if (!conflict) {
        nomorBaru = candidate;
        break;
      }
    }

    if (!nomorBaru) {
      return NextResponse.json({ error: "Semua kandidat nomor sudah dipakai" }, { status: 409 });
    }

    const updated = await prisma.pendaftar.update({
      where: { id: TARGET_ID },
      data: {
        jenjang: "IL",
        nomor_pendaftaran: nomorBaru,
      }
    });

    return NextResponse.json({
      success: true,
      nama: updated.nama_lengkap,
      sebelum: { jenjang: "SMA", nomor: NOMOR_LAMA },
      sesudah: { jenjang: updated.jenjang, nomor: updated.nomor_pendaftaran },
      login_baru: nomorBaru,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
