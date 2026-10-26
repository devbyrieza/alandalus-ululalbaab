import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache, redis } from "@/lib/redis";

/**
 * POST /api/admin/pendaftar/promote-selection
 * Mempromosikan Pendaftar dari status Proses Seleksi (selection, scheduled, testing, tested) ke Diterima (accepted).
 *
 * Body:
 *   { ids?: string[] }
 *   - Jika ids tidak ada atau kosong -> promosikan SEMUA yang berstatus selection/scheduled/testing/tested
 *   - Jika ids ada -> promosikan yang dipilih saja
 *
 * Access: admin_super or admin
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin_super" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat meluluskan status Proses Seleksi ke Diterima" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { ids } = body as { ids?: string[] };

    const promoteAll = !ids || ids.length === 0;
    const SELECTION_STATUSES = ["selection", "scheduled", "testing", "tested"];

    const whereClause = promoteAll
      ? { status_pendaftaran: { in: SELECTION_STATUSES } }
      : { id: { in: ids }, status_pendaftaran: { in: SELECTION_STATUSES } };

    const candidates = await prisma.pendaftar.findMany({
      where: whereClause,
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        tahun_ajaran_id: true,
        no_hp: true,
        jenjang: true,
        orang_tua: {
          select: {
            no_hp_ayah: true,
            no_hp_ibu: true,
          },
        },
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: true, updated_count: 0, message: "Tidak ada Pendaftar dalam Proses Seleksi yang ditemukan." },
        { status: 200 }
      );
    }

    const candidateIds = candidates.map((c) => c.id);

    await prisma.$transaction(async (tx) => {
      await tx.pendaftar.updateMany({
        where: { id: { in: candidateIds } },
        data: {
          status_pendaftaran: "accepted",
          updated_at: new Date(),
        },
      });

      for (const candidate of candidates) {
        await tx.pengumuman.upsert({
          where: { pendaftar_id: candidate.id },
          update: {
            status_kelulusan: "Diterima",
            is_published: true,
            published_at: new Date(),
            published_by: session.id,
            updated_at: new Date(),
          },
          create: {
            pendaftar_id: candidate.id,
            status_kelulusan: "Diterima",
            is_published: true,
            published_at: new Date(),
            published_by: session.id,
            tahun_ajaran_id: candidate.tahun_ajaran_id,
          },
        });

        if (redis) {
          try {
            await redis.del(`pengumuman_${candidate.id}`);
          } catch (e) {}
        }
      }
    });

    try {
      if (invalidateAdminPendaftarCache) {
        await invalidateAdminPendaftarCache();
      }
    } catch (e) {}

    let notifiedCount = 0;
    try {
      const { notifyCombinedFinalResult } = await import("@/lib/wablas");
      const { processWhatsappQueue } = await import("@/lib/whatsapp-queue");

      for (const candidate of candidates) {
        const phone = candidate.no_hp || candidate.orang_tua?.no_hp_ayah || candidate.orang_tua?.no_hp_ibu;
        if (phone) {
          await notifyCombinedFinalResult({
            pendaftarId: candidate.id,
            phone,
            nama: candidate.nama_lengkap,
            status: "DITERIMA",
            jenjang: candidate.jenjang,
          });
          notifiedCount++;
        }
      }

      if (notifiedCount > 0) {
        processWhatsappQueue().catch((err) =>
          console.error("Failed to run processWhatsappQueue asynchronously:", err)
        );
      }
    } catch (notifErr) {
      console.error("WhatsApp Promotion Notification Error:", notifErr);
    }

    logAdminAction({
      action: "PROMOTE_SELECTION_TO_DITERIMA" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin Super",
      targetId: promoteAll ? "ALL_SELECTION" : candidateIds.join(","),
      targetName: promoteAll
        ? `Semua Proses Seleksi (${candidates.length} orang)`
        : candidates.map((c) => c.nama_lengkap).join(", "),
      details: {
        promoted_count: candidates.length,
        notified_count: notifiedCount,
        mode: promoteAll ? "all" : "selected",
        ids: candidateIds,
      },
    });

    return NextResponse.json({
      success: true,
      updated_count: candidates.length,
      notified_count: notifiedCount,
      message: `${candidates.length} Pendaftar berhasil diluluskan ke status Diterima. Notifikasi WhatsApp telah diantrekan.`,
    });
  } catch (error) {
    console.error("Promote selection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
