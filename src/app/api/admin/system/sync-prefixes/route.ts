import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint Sinkronisasi Awalan Nomor Pendaftaran Ulul Albaab (Khusus Putra)
 * Standar Prefix:
 * - MTs Putra -> MTA
 * - IL Putra  -> ILA
 * - SMA Putra -> SMA
 */
export async function GET(request: NextRequest) {
  try {
    const list = await prisma.pendaftar.findMany({
      where: {
        OR: [
          { nomor_pendaftaran: { startsWith: "MTI" } },
          { nomor_pendaftaran: { startsWith: "ILI" } },
          { nomor_pendaftaran: { startsWith: "MAI" } },
          { nomor_pendaftaran: { startsWith: "MAA" } },
          { nomor_pendaftaran: { startsWith: "SMI" } },
          { jenis_kelamin: "P" },
        ],
      },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true,
        jenis_kelamin: true,
        data_lengkap: true,
      },
      orderBy: { nomor_pendaftaran: "asc" },
    });

    const updates: Array<{ id: string; name: string; from: string; to: string }> = [];
    const reservedNomor = new Set<string>();

    for (const item of list) {
      let targetPrefix = "MTA";
      const normJ = (item.jenjang || "").toUpperCase();
      if (normJ.includes("IL")) targetPrefix = "ILA";
      else if (normJ.includes("SMA") || normJ.includes("MA")) targetPrefix = "SMA";
      else targetPrefix = "MTA";

      let newNomor = item.nomor_pendaftaran;
      if (item.nomor_pendaftaran && /^(MTI|ILI|MAI|MAA|SMI|SPI)/.test(item.nomor_pendaftaran)) {
        const tahun = item.nomor_pendaftaran.slice(3, 5);
        const candidate = `${targetPrefix}${item.nomor_pendaftaran.slice(3)}`;

        const conflict = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: candidate } });
        if ((!conflict || conflict.id === item.id) && !reservedNomor.has(candidate)) {
          newNomor = candidate;
        } else {
          const existingList = await prisma.pendaftar.findMany({
            where: { nomor_pendaftaran: { startsWith: `${targetPrefix}${tahun}` } },
            select: { nomor_pendaftaran: true },
          });
          const usedSeqs = new Set(
            existingList
              .map((p) => parseInt(p.nomor_pendaftaran.slice(5), 10))
              .filter((n) => !isNaN(n))
          );
          let nextSeq = 1;
          while (
            usedSeqs.has(nextSeq) ||
            reservedNomor.has(`${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
          ) {
            nextSeq++;
          }
          newNomor = `${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
        }
        reservedNomor.add(newNomor);
      }

      const updatePayload: any = {};
      if (newNomor !== item.nomor_pendaftaran) {
        updatePayload.nomor_pendaftaran = newNomor;
        const dl = (item.data_lengkap as any) || {};
        dl.legacy_nomor_pendaftaran = item.nomor_pendaftaran;
        updatePayload.data_lengkap = dl;
      }
      if (item.jenis_kelamin !== "L") {
        updatePayload.jenis_kelamin = "L";
      }

      if (Object.keys(updatePayload).length > 0) {
        await prisma.pendaftar.update({
          where: { id: item.id },
          data: updatePayload,
        });
        updates.push({
          id: item.id,
          name: item.nama_lengkap,
          from: item.nomor_pendaftaran,
          to: newNomor,
        });
      }
    }

    return NextResponse.json({
      success: true,
      institution: "Ulul Albaab (Khusus Putra)",
      message: `Berhasil menyinkronkan ${updates.length} data pendaftar ke format Putra (MTA, ILA, SMA)`,
      updated_count: updates.length,
      updates,
    });
  } catch (error: any) {
    console.error("SYNC_PREFIXES_ULUL_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
