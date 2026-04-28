import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY - DELETE AFTER USE

export async function GET() {
  try {
    // Cari Putra Perdana di production DB
    const putra = await prisma.pendaftar.findFirst({
      where: {
        nama_lengkap: { contains: "Putra Perdana", mode: "insensitive" }
      },
      select: {
        id: true,
        nama_lengkap: true,
        nik: true,
        nomor_pendaftaran: true,
        tempat_lahir: true,
        tanggal_lahir: true,
        no_hp: true,
        alamat: true,
        nisn: true,
        golongan_darah: true,
        kabupaten: true,
        kecamatan: true,
        provinsi: true,
        jenjang: true,
      }
    });

    // Cek berapa banyak pendaftar yang field-nya kosong vs terisi
    const stats = await prisma.pendaftar.aggregate({
      _count: { id: true },
    });

    const filled = await prisma.pendaftar.count({
      where: { tempat_lahir: { not: null } }
    });

    const empty = await prisma.pendaftar.count({
      where: { tempat_lahir: null }
    });

    return NextResponse.json({
      putra_perdana: putra,
      statistik: {
        total: stats._count.id,
        tempat_lahir_terisi: filled,
        tempat_lahir_kosong: empty,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
