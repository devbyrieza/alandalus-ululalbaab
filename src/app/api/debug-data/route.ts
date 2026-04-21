import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const counts = await prisma.pendaftar.count({
      where: {
        jenis_kelamin: { contains: 'P', mode: 'insensitive' },
        jenjang: { contains: 'MTS', mode: 'insensitive' },
        status_pendaftaran: 'enrolled',
        deleted_at: null
      }
    });

    const samples = await prisma.pendaftar.findMany({
      where: {
        jenis_kelamin: { contains: 'P', mode: 'insensitive' },
        jenjang: { contains: 'MTS', mode: 'insensitive' },
        status_pendaftaran: 'enrolled',
        deleted_at: null
      },
      take: 5,
      select: { nama_lengkap: true, jenjang: true, jenis_kelamin: true, status_pendaftaran: true }
    });

    return NextResponse.json({
      message: "Debug data retrieved",
      count_putri_mts_enrolled: counts,
      samples
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
