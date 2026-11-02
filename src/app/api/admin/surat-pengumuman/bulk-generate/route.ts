import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { delCache, invalidateAdminPendaftarCache } from "@/lib/redis";
import { saveFileLocal } from "@/lib/storage/local";
import { signFilePath } from "@/lib/storage/file-signing";
import {
  generateSuratPengumumanHasil,
  getNextNomorSurat,
  buildNomorSurat,
  nextKodeSurat,
  parseKodeSurat,
} from "@/lib/surat/surat-pengumuman";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";
import { sendDocumentMessage } from "@/lib/wablas";

export const runtime = "nodejs";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    const allowed = ["admin_super", "admin", "superadmin", "head_of_it"];
    return allowed.includes(session.role) ? session : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Khusus Admin." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { items, tanggalTerbit: rawTanggal, kirimWa = true } = body as {
      items: { pendaftarId: string; kelasDiterima?: string }[];
      tanggalTerbit?: string;
      kirimWa?: boolean;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Daftar santri tidak boleh kosong." }, { status: 400 });
    }

    const tanggal = rawTanggal ? new Date(rawTanggal) : new Date();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spmb.pesantren-ululalbaab.com";

    // Dapatkan nomor surat awal yang tersedia
    let currentNext = await getNextNomorSurat(tanggal);
    let currentKode: string | null = currentNext.kode;

    const results: any[] = [];

    for (const item of items) {
      if (!currentKode) {
        throw new Error("Nomor surat habis (melebihi ZZ).");
      }

      const pendaftar = await prisma.pendaftar.findUnique({
        where: { id: item.pendaftarId },
        include: { tahun_ajaran: true },
      });

      if (!pendaftar) {
        results.push({ pendaftarId: item.pendaftarId, success: false, error: "Pendaftar tidak ditemukan" });
        continue;
      }

      const assignedNomorSurat = buildNomorSurat(currentKode, tanggal);
      currentKode = nextKodeSurat(currentKode);

      const targetKelas =
        item.kelasDiterima ||
        (pendaftar.jenjang?.toUpperCase().includes("IL")
          ? "IL Putra"
          : pendaftar.jenjang?.toUpperCase().includes("SMA") || pendaftar.jenjang?.toUpperCase().includes("MA")
            ? "X SMA Putra"
            : "VII MTs Putra");

      // Generate PDF
      const { buffer, filename } = await generateSuratPengumumanHasil({
        nomorSurat: assignedNomorSurat,
        tanggalTerbit: tanggal,
        namaLengkap: pendaftar.nama_lengkap,
        nomorPendaftaran: pendaftar.nomor_pendaftaran,
        kelasDiterima: targetKelas,
      });

      const safeName = filename.replace(/[^a-zA-Z0-9 .-]/g, "-");
      const suratPath = await saveFileLocal(buffer, "pengumuman", pendaftar.id, safeName);

      // Upsert pengumuman + update pendaftar status
      await prisma.$transaction(async (tx) => {
        await tx.pengumuman.upsert({
          where: { pendaftar_id: pendaftar.id },
          update: {
            status_kelulusan: "Diterima",
            nomor_surat: assignedNomorSurat,
            kelas_diterima: targetKelas,
            tanggal_terbit: tanggal,
            surat_pengumuman_path: suratPath,
            is_published: true,
            published_at: new Date(),
            published_by: admin.id,
            updated_at: new Date(),
          },
          create: {
            pendaftar_id: pendaftar.id,
            tahun_ajaran_id: pendaftar.tahun_ajaran_id,
            status_kelulusan: "Diterima",
            nomor_surat: assignedNomorSurat,
            kelas_diterima: targetKelas,
            tanggal_terbit: tanggal,
            surat_pengumuman_path: suratPath,
            is_published: true,
            published_at: new Date(),
            published_by: admin.id,
          },
        });

        await tx.pendaftar.update({
          where: { id: pendaftar.id },
          data: { status_pendaftaran: "accepted" },
        });

        // Simpan binary PDF ke tabel Dokumen untuk persistensi permanen (BYTEA)
        const existingDoc = await tx.dokumen.findFirst({
          where: {
            pendaftar_id: pendaftar.id,
            jenis_dokumen: "surat_pengumuman",
          },
        });

        if (existingDoc) {
          await tx.dokumen.update({
            where: { id: existingDoc.id },
            data: {
              file_name: safeName,
              file_path: suratPath,
              file_size: buffer.length,
              file_type: "application/pdf",
              file_data: buffer,
              is_verified: true,
              updated_at: new Date(),
            },
          });
        } else {
          await tx.dokumen.create({
            data: {
              pendaftar_id: pendaftar.id,
              jenis_dokumen: "surat_pengumuman",
              file_name: safeName,
              file_path: suratPath,
              file_size: buffer.length,
              file_type: "application/pdf",
              file_data: buffer,
              is_verified: true,
            },
          });
        }
      });

      await delCache(`pengumuman_${pendaftar.id}`);

      // Kirim WhatsApp jika diminta
      let waSent = false;
      if (kirimWa && pendaftar.no_hp) {
        try {
          const token = signFilePath(suratPath);
          const suratDownloadUrl = `${appUrl}/api/files/${encodeURI(suratPath)}?k=${token}`;

          const messageContent = `📋 *PENGUMUMAN HASIL KELULUSAN SELEKSI PSB*
*PESANTREN ULUL ALBAAB SUKABUMI*
Tahun Ajaran 2027/2028

Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Orang Tua / Wali dari:
👤 *${pendaftar.nama_lengkap}*
No. Pendaftaran: *${pendaftar.nomor_pendaftaran}*

Alhamdulillah, ananda dinyatakan *DITERIMA* sebagai Santri Baru di Pesantren Ulul Albaab Sukabumi:
🎓 *Jenjang / Kelas:* ${targetKelas}
📜 *No. Surat Keputusan:* ${assignedNomorSurat}

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

          const enqResult = await enqueueWhatsapp({
            pendaftarId: pendaftar.id,
            phone: pendaftar.no_hp,
            jenisNotif: "hasil_seleksi",
            messageContent,
            force: true,
            sendNow: true,
          });

          waSent = !!enqResult.queued;

          try {
            await sendDocumentMessage({
              phone: pendaftar.no_hp,
              message: `📄 Surat Keputusan Kelulusan — ${pendaftar.nama_lengkap} (${assignedNomorSurat})`,
              documentUrl: suratDownloadUrl,
            });
          } catch {}

          await prisma.pengumuman.update({
            where: { pendaftar_id: pendaftar.id },
            data: { wa_blast_sent: waSent, wa_blast_sent_at: waSent ? new Date() : null },
          });
        } catch (waErr) {
          console.error(`[BulkGenerate] WA gagal untuk ${pendaftar.nama_lengkap}:`, waErr);
        }
      }

      results.push({
        pendaftarId: pendaftar.id,
        nama: pendaftar.nama_lengkap,
        nomorSurat: assignedNomorSurat,
        kelasDiterima: targetKelas,
        suratPath,
        waSent,
        success: true,
      });
    }

    await invalidateAdminPendaftarCache();

    logAdminAction({
      action: "BULK_GENERATE_SURAT_PENGUMUMAN",
      adminId: admin.id,
      adminName: admin.name || admin.username || "admin",
      targetId: "bulk",
      details: { count: results.filter((r) => r.success).length, results },
    });

    return NextResponse.json({
      success: true,
      count: results.filter((r) => r.success).length,
      data: results,
    });
  } catch (error: any) {
    console.error("POST /api/admin/surat-pengumuman/bulk-generate error:", error);
    return NextResponse.json({ error: error.message || "Gagal generate surat massal" }, { status: 500 });
  }
}
