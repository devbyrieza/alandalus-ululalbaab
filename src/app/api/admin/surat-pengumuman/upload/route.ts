import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { delCache, invalidateAdminPendaftarCache } from "@/lib/redis";
import { saveFileLocal } from "@/lib/storage/local";
import { getNextNomorSurat } from "@/lib/surat/surat-pengumuman";

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
 * POST — fallback upload surat pengumuman MANUAL (dibuat di luar sistem).
 * FormData: pendaftar_id, nomor_surat, kelas_diterima?, kirim_wa?, file (pdf/jpg/png)
 * Setelah upload: publish Pengumuman + status pendaftar accepted + kirim WA.
 */
export async function POST(request: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Hanya Admin Super." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const pendaftarId = form.get("pendaftar_id") as string | null;
    let nomorSurat = ((form.get("nomor_surat") as string) || "").trim();
    let kelasDiterima = (form.get("kelas_diterima") as string) || null;
    const kirimWa = form.get("kirim_wa") !== "false";
    const file = form.get("file") as File | null;

    if (!pendaftarId || !file) {
      return NextResponse.json(
        { error: "pendaftar_id dan file surat keputusan wajib diisi." },
        { status: 400 }
      );
    }

    const pendaftar = await prisma.pendaftar.findFirst({
      where: { id: pendaftarId, deleted_at: null },
      select: {
        id: true,
        tahun_ajaran_id: true,
        nama_lengkap: true,
        no_hp: true,
        jenjang: true,
      },
    });
    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    }

    // Auto fallback jika nomor surat tidak diisi manual
    if (!nomorSurat) {
      const nextNomor = await getNextNomorSurat(new Date());
      nomorSurat = nextNomor.nomor;
    }

    // Auto fallback kelas diterima sesuai jenjang
    if (!kelasDiterima) {
      const normJ = (pendaftar.jenjang || "").toUpperCase();
      if (normJ.includes("IL")) kelasDiterima = "IL Putra";
      else if (normJ.includes("SMA") || normJ.includes("MA")) kelasDiterima = "X SMA Putra";
      else kelasDiterima = "VII MTs Putra";
    }

    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus PDF, JPG, atau PNG." }, { status: 400 });
    }

    const bentrok = await prisma.pengumuman.findFirst({
      where: { nomor_surat: nomorSurat, pendaftar_id: { not: pendaftarId } },
      select: { id: true },
    });
    if (bentrok) {
      return NextResponse.json(
        { error: `Nomor surat ${nomorSurat} sudah dipakai pendaftar lain.` },
        { status: 409 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName =
      `Surat Pengumuman Hasil PSB 2027-2028 ${pendaftar.nama_lengkap}.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg"}`.replace(
        /[^a-zA-Z0-9 .-]/g,
        "-"
      );
    const suratPath = await saveFileLocal(bytes, "pengumuman", pendaftarId, safeName);

    const pengumuman = await prisma.$transaction(async (tx) => {
      const p = await tx.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: {
          status_kelulusan: "Diterima",
          nomor_surat: nomorSurat,
          kelas_diterima: kelasDiterima,
          surat_pengumuman_path: suratPath,
          is_published: true,
          published_at: new Date(),
          published_by: admin.id,
          updated_at: new Date(),
        },
        create: {
          pendaftar_id: pendaftarId,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          status_kelulusan: "Diterima",
          nomor_surat: nomorSurat,
          kelas_diterima: kelasDiterima,
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
    await invalidateAdminPendaftarCache();

    logAdminAction({
      action: "UPLOAD_SURAT_PENGUMUMAN_MANUAL",
      adminId: admin.id,
      adminName: admin.name || admin.username || "admin_super",
      targetId: pendaftarId,
      targetName: pendaftar.nama_lengkap,
      details: { nomor_surat: nomorSurat, surat_path: suratPath },
    });

    let waSent = false;
    if (kirimWa && pendaftar.no_hp) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spmb.pesantren-ululalbaab.com";
        const { signFilePath } = await import("@/lib/storage/file-signing");
        const token = signFilePath(suratPath);
        const suratDownloadUrl = `${appUrl}/api/files/${encodeURI(suratPath)}?k=${token}`;
        const targetKelas = kelasDiterima || pendaftar.jenjang || "VII MTs Putra";

        const messageContent = `📋 *PENGUMUMAN HASIL KELULUSAN SELEKSI PSB*
*PESANTREN ULUL ALBAAB SUKABUMI*
Tahun Ajaran 2027/2028

Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Orang Tua / Wali dari:
👤 *${pendaftar.nama_lengkap}*
No. Pendaftaran: *${pendaftar.nomor_pendaftaran}*

Alhamdulillah, ananda dinyatakan *DITERIMA* sebagai Santri Baru di Pesantren Ulul Albaab Sukabumi:
🎓 *Jenjang / Kelas:* ${targetKelas}
📜 *No. Surat Keputusan:* ${nomorSurat}

📄 *Unduh Surat Keputusan Resmi (PDF):*
${suratDownloadUrl}

📝 *Tahap Selanjutnya (Daftar Ulang):*
Silakan masuk ke portal pendaftar untuk melihat rincian pengumuman dan panduan daftar ulang:
🔗 ${appUrl}/login

Semoga Allah ﷻ memberkahi ananda dan menjadikannya santri yang sholeh, berilmu, dan berakhlak mulia. Aamiin.

Jazakumullahu khairan katsiran.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.
---
*Panitia PSB Pesantren Ulul Albaab Sukabumi*`;

        const { enqueueWhatsapp } = await import("@/lib/whatsapp-queue");
        const enqResult = await enqueueWhatsapp({
          pendaftarId: pendaftar.id,
          phone: pendaftar.no_hp,
          jenisNotif: "hasil_seleksi",
          messageContent,
          force: true,
          sendNow: true,
        });

        waSent = !!enqResult.queued;

        // Coba kirim lampiran PDF jika paket Wablas mendukung (non-blocking)
        try {
          const { sendDocumentMessage } = await import("@/lib/wablas");
          await sendDocumentMessage({
            phone: pendaftar.no_hp,
            message: `📄 Surat Keputusan Kelulusan — ${pendaftar.nama_lengkap} (${nomorSurat})`,
            documentUrl: suratDownloadUrl,
          });
        } catch {
          // Ignored jika paket Wablas tidak support send-document
        }

        await prisma.pengumuman.update({
          where: { id: pengumuman.id },
          data: { wa_blast_sent: waSent, wa_blast_sent_at: waSent ? new Date() : null },
        });
      } catch (waErr) {
        console.error("[SuratPengumuman] Kirim WA gagal (surat tetap tersimpan):", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: { pengumuman_id: pengumuman.id, surat_path: suratPath, wa_sent: waSent },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Nomor surat sudah dipakai pendaftar lain." },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/surat-pengumuman/upload error:", error);
    return NextResponse.json({ error: error.message || "Gagal upload surat" }, { status: 500 });
  }
}
