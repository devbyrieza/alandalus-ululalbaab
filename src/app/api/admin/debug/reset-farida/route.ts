import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY ENDPOINT - DELETE AFTER USE
// Usage: GET /api/admin/debug/reset-farida
export async function GET() {
  try {
    // 1. Cari Farida
    const farida = await prisma.pendaftar.findFirst({
      where: {
        nama_lengkap: { contains: "Farida Kamila", mode: "insensitive" },
      },
      include: {
        pembayaran: true,
      },
    });

    if (!farida) {
      return NextResponse.json({ error: "Farida tidak ditemukan" }, { status: 404 });
    }

    // 2. Tampilkan info sebelum dihapus (untuk konfirmasi)
    const info = {
      id: farida.id,
      nama: farida.nama_lengkap,
      status_sebelum: farida.status_pendaftaran,
      jumlah_pembayaran: farida.pembayaran.length,
      pembayaran: farida.pembayaran.map(p => ({
        id: p.id,
        status: p.status_pembayaran,
        bukti: p.bukti_transfer_filename,
        created_at: p.created_at,
      })),
    };

    return NextResponse.json({
      message: "Data Farida ditemukan. Akses /api/admin/debug/reset-farida dengan method POST untuk menghapus.",
      data: info,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    // 1. Cari Farida
    const farida = await prisma.pendaftar.findFirst({
      where: {
        nama_lengkap: { contains: "Farida Kamila", mode: "insensitive" },
      },
      include: {
        pembayaran: true,
      },
    });

    if (!farida) {
      return NextResponse.json({ error: "Farida tidak ditemukan" }, { status: 404 });
    }

    if (farida.pembayaran.length === 0) {
      return NextResponse.json({ message: "Farida tidak memiliki record pembayaran, tidak ada yang perlu dihapus." });
    }

    // 2. Hapus semua record pembayaran Farida
    const deleted = await prisma.pembayaran.deleteMany({
      where: { pendaftar_id: farida.id },
    });

    // 3. Reset status pendaftaran ke "registered"
    await prisma.pendaftar.update({
      where: { id: farida.id },
      data: { status_pendaftaran: "registered" },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil! ${deleted.count} record pembayaran Farida dihapus. Status direset ke 'registered'.`,
      nama: farida.nama_lengkap,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
