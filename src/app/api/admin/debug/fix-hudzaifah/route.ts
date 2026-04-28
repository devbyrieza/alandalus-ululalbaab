import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY ENDPOINT - DELETE AFTER USE

export async function GET() {
  try {
    const all = await prisma.pendaftar.findMany({
      where: {
        OR: [
          { nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" } },
        ]
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
    // Target: Hudzaifah Al fawwaz (ID dari production DB)
    const TARGET_ID = "6d5c0aa1-b9aa-43a5-b6e8-27577ad20ad4";
    const NOMOR_LAMA = "SMA2600003";

    // Coba beberapa opsi nomor baru (ILA = IL Putra)
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


// TEMPORARY ENDPOINT - DELETE AFTER USE

export async function GET() {
  try {
    const all = await prisma.pendaftar.findMany({
      where: {
        OR: [
          { nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" } },
        ]
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
    // Target: Hudzaifah Al fawwaz, ID dari hasil GET
    const TARGET_ID = "6d5c0aa1-b9aa-43a5-b6e8-27577ad20ad4";
    const NOMOR_LAMA = "SMA2600003";

    // Coba beberapa opsi nomor baru
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


export async function POST() {
  try {
    // Cari Hudzaifah Al Fawwaz dengan SMA2600003 atau mendekatinya
    const target = await prisma.pendaftar.findFirst({
      where: {
        AND: [
          { nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" } },
          { jenjang: "SMA" },
          { nomor_pendaftaran: { startsWith: "SMA260000" } },
        ]
      }
    });

    if (!target) {
      // Coba lebih luas
      const allSma = await prisma.pendaftar.findMany({
        where: {
          nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" },
          jenjang: "SMA",
        },
        select: { id: true, nama_lengkap: true, jenjang: true, nomor_pendaftaran: true }
      });
      return NextResponse.json({
        error: "Target tidak ditemukan dengan SMA260000x",
        all_hudzaifah_sma: allSma
      }, { status: 404 });
    }

    const nomorBaru = target.nomor_pendaftaran.replace(/^SMA/, "ILA");

    // Cek nomor baru tidak konflik
    const conflict = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran: nomorBaru }
    });

    if (conflict) {
      return NextResponse.json({
        error: `Nomor ${nomorBaru} sudah dipakai oleh ${conflict.nama_lengkap}`
      }, { status: 409 });
    }

    // Update
    const updated = await prisma.pendaftar.update({
      where: { id: target.id },
      data: {
        jenjang: "IL",
        nomor_pendaftaran: nomorBaru,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil update ${updated.nama_lengkap}`,
      sebelum: { jenjang: "SMA", nomor: target.nomor_pendaftaran },
      sesudah: { jenjang: updated.jenjang, nomor: updated.nomor_pendaftaran },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
