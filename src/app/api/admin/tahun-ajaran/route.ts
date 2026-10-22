import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let data = await prisma.tahunAjaran.findMany({
      select: {
        id: true,
        nama: true,
        tahun_mulai: true,
        tahun_selesai: true,
        is_active: true },
      orderBy: { tahun_mulai: "desc" } });

    // Auto-seed missing standard academic years so admin interfaces stay consistent
    const has27 = data.some(d => d.nama === "2027/2028");
    const has26 = data.some(d => d.nama === "2026/2027");
    if (!has27 || !has26) {
      try {
        if (!has27) {
          await prisma.tahunAjaran.create({
            data: {
              nama: "2027/2028",
              tahun_mulai: 2027,
              tahun_selesai: 2028,
              is_active: true,
              biaya_pendaftaran: 250000,
              tanggal_buka_pendaftaran: new Date("2026-10-01"),
              tanggal_tutup_pendaftaran: new Date("2027-06-30"),
            }
          });
          await prisma.tahunAjaran.updateMany({
            where: { nama: { not: "2027/2028" }, is_active: true },
            data: { is_active: false }
          });
        }
        if (!has26) {
          await prisma.tahunAjaran.create({
            data: {
              nama: "2026/2027",
              tahun_mulai: 2026,
              tahun_selesai: 2027,
              is_active: false,
              biaya_pendaftaran: 250000,
              tanggal_buka_pendaftaran: new Date("2025-10-01"),
              tanggal_tutup_pendaftaran: new Date("2026-06-30"),
            }
          });
        }
        data = await prisma.tahunAjaran.findMany({
          select: {
            id: true,
            nama: true,
            tahun_mulai: true,
            tahun_selesai: true,
            is_active: true },
          orderBy: { tahun_mulai: "desc" } });
      } catch (seedErr) {
        console.error("Auto-seed TA warning:", seedErr);
      }
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Tahun ajaran API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

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
    const allowedRoles = ["admin", "admin_super"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      tahun_mulai,
      tahun_selesai,
      nama,
      is_active = false,
      tanggal_buka_pendaftaran,
      tanggal_tutup_pendaftaran,
      biaya_pendaftaran = 250000 } = body;

    // Validate required fields
    if (
      !tahun_mulai ||
      !tahun_selesai ||
      !nama ||
      !tanggal_buka_pendaftaran ||
      !tanggal_tutup_pendaftaran
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if tahun ajaran already exists
    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahun_mulai,
        tahun_selesai } });

    if (existing) {
      return NextResponse.json(
        { error: "Tahun ajaran already exists", data: existing },
        { status: 409 },
      );
    }

    // Use transaction to deactivate others if needed
    const result = await prisma.$transaction(async (tx) => {
      // If setting as active, deactivate others first
      if (is_active) {
        await tx.tahunAjaran.updateMany({
          where: { is_active: true },
          data: { is_active: false } });
      }

      // Create new tahun ajaran
      return await tx.tahunAjaran.create({
        data: {
          tahun_mulai,
          tahun_selesai,
          nama,
          is_active,
          tanggal_buka_pendaftaran: new Date(tanggal_buka_pendaftaran),
          tanggal_tutup_pendaftaran: new Date(tanggal_tutup_pendaftaran),
          biaya_pendaftaran } });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Tahun ajaran POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
