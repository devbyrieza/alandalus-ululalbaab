import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SURAT_PENGUMUMAN_CONFIG } from "@/config/surat-pengumuman";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { delCache } from "@/lib/redis";
import { signFilePath } from "@/lib/storage/file-signing";
import { saveFileLocal } from "@/lib/storage/local";
import {
  generateSuratPengumumanHasil,
  getKodeTerpakai,
  nilaiKode,
  parseKodeSurat,
} from "@/lib/surat/surat-pengumuman";
import { notifySelectionResult, sendDocumentMessage } from "@/lib/wablas";

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
 * POST — FINALISASI surat: generate PDF final, simpan ke storage, lock nomor surat
 * (unique constraint), publish Pengumuman, set pendaftar accepted, kirim WA + dokumen.
 * Body: { pendaftar_id, nomor_surat, tanggal_terbit?, kelas_diterima?, kirim_wa?: boolean }
 */
export async function POST(request: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Hanya Admin Super." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const pendaftarId = body.pendaftar_id as string;
    const nomorSurat = ((body.nomor_surat as string) || "").trim();
    if (!pendaftarId || !nomorSurat) {
      return NextResponse.json({ error: "pendaftar_id dan nomor_surat wajib." }, { status: 400 });
    }

    const tanggalTerbit = body.tanggal_terbit ? new Date(body.tanggal_terbit) : new Date();
    const kelasDiterima: string =
      body.kelas_diterima || SURAT_PENGUMUMAN_CONFIG.kelasDiterimaDefault;

    // Validasi format nomor + konsistensi tanggal (bulan/tahun romawi)
    const kode = parseKodeSurat(nomorSurat);
    if (!kode) {
      return NextResponse.json(
        {
          error: `Format nomor surat tidak valid. Harusnya ${SURAT_PENGUMUMAN_CONFIG.nomorPrefix}-AA/${SURAT_PENGUMUMAN_CONFIG.nomorSuffix}/X/2026.`,
        },
        { status: 400 }
      );
    }

    const pendaftar = await prisma.pendaftar.findFirst({
      where: { id: pendaftarId, deleted_at: null },
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        no_hp: true,
        jenjang: true,
        status_pendaftaran: true,
        tahun_ajaran: { select: { nama: true } },
      },
    });
    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    }

    // Lock: nomor sudah dipakai pendaftar lain?
    const bentrok = await prisma.pengumuman.findFirst({
      where: { nomor_surat: nomorSurat, pendaftar_id: { not: pendaftarId } },
      select: { pendaftar_id: true },
    });
    if (bentrok) {
      return NextResponse.json(
        {
          error: `Nomor surat ${nomorSurat} sudah dipakai pendaftar lain. Muat ulang preview untuk dapat nomor berikutnya.`,
        },
        { status: 409 }
      );
    }

    // Validasi kode: harus urut setelah kode terakhir yang terpakai (anti lompat/dua kali).
    // Termasuk baseline surat manual (AA & AB Ibrahim/Jooara) dari app_settings.
    const existing = await getKodeTerpakai();
    const nilaiTerpakai = existing.filter((k) => k !== kode).map(nilaiKode);
    const maxTerpakai = nilaiTerpakai.length ? Math.max(...nilaiTerpakai) : -1;
    if (nilaiKode(kode) <= maxTerpakai) {
      return NextResponse.json(
        {
          error: `Kode ${kode} tidak boleh dipakai (sudah lewat urutan). Gunakan kode setelah yang terakhir terbit.`,
        },
        { status: 409 }
      );
    }

    // Generate PDF final
    const { buffer, filename } = await generateSuratPengumumanHasil({
      nomorSurat,
      tanggalTerbit,
      namaLengkap: pendaftar.nama_lengkap,
      nomorPendaftaran: pendaftar.nomor_pendaftaran,
      kelasDiterima,
    });

    const safeName = filename.replace(/[^a-zA-Z0-9 .-]/g, "-");
    const suratPath = await saveFileLocal(buffer, "pengumuman", pendaftarId, safeName);

    // Publish Pengumuman + update status pendaftar (transaksi)
    const pengumuman = await prisma.$transaction(async (tx) => {
      const p = await tx.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: {
          status_kelulusan: "Diterima",
          nomor_surat: nomorSurat,
          kelas_diterima: kelasDiterima,
          tanggal_terbit: tanggalTerbit,
          surat_pengumuman_path: suratPath,
          is_published: true,
          published_at: new Date(),
          published_by: admin.id,
          updated_at: new Date(),
        },
        create: {
          pendaftar_id: pendaftarId,
          tahun_ajaran_id: (
            await tx.pendaftar.findUniqueOrThrow({
              where: { id: pendaftarId },
              select: { tahun_ajaran_id: true },
            })
          ).tahun_ajaran_id,
          status_kelulusan: "Diterima",
          nomor_surat: nomorSurat,
          kelas_diterima: kelasDiterima,
          tanggal_terbit: tanggalTerbit,
          surat_pengumuman_path: suratPath,
          is_published: true,
          published_at: new Date(),
          published_by: admin.id,
        },
      });

      await tx.pendaftar.update({
        where: { id: pendaftarId },
        data: { status_pendaftaran: "accepted" },
      });

      return p;
    });

    await delCache(`pengumuman_${pendaftarId}`);

    logAdminAction({
      action: "TERBIT_SURAT_PENGUMUMAN",
      adminId: admin.id,
      adminName: admin.name || admin.username || "admin_super",
      targetId: pendaftarId,
      targetName: pendaftar.nama_lengkap,
      details: { nomor_surat: nomorSurat, surat_path: suratPath },
    });

    // Kirim WA: teks selamat + dokumen PDF (signed URL agar bisa diambil Wablas)
    let waSent = false;
    if (body.kirim_wa !== false && pendaftar.no_hp) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spmb.pesantren-ululalbaab.com";
        const suratUrl = `${appUrl}/api/files/${suratPath}?k=${signFilePath(suratPath)}`;
        const result = await notifySelectionResult({
          phone: pendaftar.no_hp,
          nama: pendaftar.nama_lengkap,
          status: "DITERIMA",
          jenjang: pendaftar.jenjang,
          tahun_ajaran: pendaftar.tahun_ajaran?.nama,
        });
        void result;
        const docResult = await sendDocumentMessage({
          phone: pendaftar.no_hp,
          message: `Alhamdulillah, ananda ${pendaftar.nama_lengkap} DITERIMA sebagai Santri Pesantren Ulul Albaab Sukabumi TA 2027/2028. Terlampir Surat Pengumuman Hasil (${nomorSurat}). Jazakumullohu khoiron katsiron.`,
          documentUrl: suratUrl,
        });
        waSent = !!docResult.status;
        await prisma.pengumuman.update({
          where: { id: pengumuman.id },
          data: { wa_blast_sent: waSent, wa_blast_sent_at: waSent ? new Date() : null },
        });
      } catch (waErr) {
        console.error("[SuratPengumuman] Kirim WA gagal (surat tetap terbit):", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        pengumuman_id: pengumuman.id,
        nomor_surat: nomorSurat,
        surat_path: suratPath,
        wa_sent: waSent,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Nomor surat sudah dipakai (race). Muat ulang preview untuk nomor berikutnya." },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/surat-pengumuman/finalize error:", error);
    return NextResponse.json({ error: error.message || "Gagal finalisasi surat" }, { status: 500 });
  }
}
