import { prisma } from "@/lib/prisma";

/**
 * Resolves the accurate academic year string (e.g. "2027/2028") based on
 * registration number, academic year relation, or registration timestamp.
 */
export function resolveTahunAjaran(p: {
  nomor_pendaftaran?: string | null;
  created_at?: Date | string | null;
  tahun_ajaran?: { nama?: string | null } | null;
}): string {
  const no = p.nomor_pendaftaran || "";
  const m4 = no.match(/20(\d{2})/);
  if (m4) {
    const c = parseInt(m4[1], 10);
    return `20${c}/20${c + 1}`;
  }
  const m2 = no.match(/^[A-Za-z]+(\d{2})/);
  if (m2) {
    const c = parseInt(m2[1], 10);
    if (c >= 20 && c <= 35) {
      return `20${c}/20${c + 1}`;
    }
  }
  if (p.tahun_ajaran?.nama && p.tahun_ajaran.nama.includes("/")) {
    return p.tahun_ajaran.nama;
  }
  if (p.created_at) {
    const yr = new Date(p.created_at).getFullYear();
    return `${yr}/${yr + 1}`;
  }
  return "2027/2028";
}

/**
 * Standard filtering for administrative views.
 * Excludes soft-deleted records and "test/bypass" students by default.
 */
export async function getAdminWhereClause(tahunAjaranId?: string): Promise<any> {
  const where: any = {
    deleted_at: null,
    status_pendaftaran: { not: "mengundurkan_diri" } };

  if (tahunAjaranId === "all" || tahunAjaranId === "ALL") {
    // Show all
  } else if (tahunAjaranId && tahunAjaranId.includes("-")) {
    // Likely a UUID
    where.tahun_ajaran_id = tahunAjaranId;
  }

  return where;
}
