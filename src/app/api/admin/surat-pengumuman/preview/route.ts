import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SURAT_PENGUMUMAN_CONFIG } from "@/config/surat-pengumuman";
import { prisma } from "@/lib/prisma";
import { generateSuratPengumumanHasil, getNextNomorSurat } from "@/lib/surat/surat-pengumuman";

export const runtime = "nodejs";

async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === "admin_super" ? session : null;
  } catch {
    return null;
  }
}

/**
 * POST — generate DRAFT surat pengumuman hasil (belum final, nomor belum terkunci).
 * Body: { pendaftar_id, tanggal_terbit?: ISO, kelas_diterima?: string }
 * Return: { nomor_surat, kelas_diterima, pdf_base64, filename }
 */
export async function POST(request: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Hanya Admin Super." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const pendaftarId = body.pendaftar_id as string;
    if (!pendaftarId) {
      return NextResponse.json({ error: "pendaftar_id wajib." }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findFirst({
      where: { id: pendaftarId, deleted_at: null },
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        jenjang: true,
      },
    });
    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    }

    const tanggalTerbit = body.tanggal_terbit ? new Date(body.tanggal_terbit) : new Date();
    const kelasDiterima: string =
      body.kelas_diterima || SURAT_PENGUMUMAN_CONFIG.kelasDiterimaDefault;

    const { nomor } = await getNextNomorSurat(tanggalTerbit);
    const { buffer, filename } = await generateSuratPengumumanHasil({
      nomorSurat: nomor,
      tanggalTerbit,
      namaLengkap: pendaftar.nama_lengkap,
      nomorPendaftaran: pendaftar.nomor_pendaftaran,
      kelasDiterima,
    });

    return NextResponse.json({
      nomor_surat: nomor,
      kelas_diterima: kelasDiterima,
      tanggal_terbit: tanggalTerbit.toISOString(),
      pdf_base64: buffer.toString("base64"),
      filename,
    });
  } catch (error: any) {
    console.error("POST /api/admin/surat-pengumuman/preview error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal generate draft surat" },
      { status: 500 }
    );
  }
}
