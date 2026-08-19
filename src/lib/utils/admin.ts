import { prisma } from "@/lib/prisma";

/**
 * Standard filtering for administrative views.
 * Excludes soft-deleted records and "test/bypass" students by default.
 */
export async function getAdminWhereClause(tahunAjaranId?: string): Promise<any> {
  const where: any = {
    deleted_at: null,
    status_pendaftaran: { not: "mengundurkan_diri" },
  };

  if (tahunAjaranId === "all") {
    // Show all
  } else if (tahunAjaranId) {
    where.tahun_ajaran_id = tahunAjaranId;
  } else {
    try {
      const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
      });
      if (activeTA) {
        where.tahun_ajaran_id = activeTA.id;
      }
    } catch (e) {
      console.error("Failed to get active Tahun Ajaran for admin filter:", e);
    }
  }

  return where;
}

