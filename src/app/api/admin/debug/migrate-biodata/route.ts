import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY - DELETE AFTER USE
// Menerima batch data biodata dari SQL dump lama dan update ke production DB

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records } = body as {
      records: Array<{
        nik: string;
        tempat_lahir?: string | null;
        tanggal_lahir?: string | null;
        golongan_darah?: string | null;
        jumlah_saudara?: number | null;
        anak_ke?: number | null;
        hobi?: string | null;
        cita_cita?: string | null;
        alamat?: string | null;
        kode_pos?: string | null;
        provinsi?: string | null;
        kabupaten?: string | null;
        kecamatan?: string | null;
        kelurahan?: string | null;
        asal_sekolah?: string | null;
        alamat_sekolah?: string | null;
        tahun_lulus?: number | null;
        no_hp?: string | null;
        nisn?: string | null;
      }>
    };

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: "records array required" }, { status: 400 });
    }

    let updated = 0;
    let skipped = 0;
    let not_found = 0;

    for (const rec of records) {
      const pendaftar = await prisma.pendaftar.findFirst({
        where: { nik: rec.nik, deleted_at: null },
        select: { id: true, tempat_lahir: true }
      });

      if (!pendaftar) {
        not_found++;
        continue;
      }

      if (pendaftar.tempat_lahir) {
        skipped++;
        continue;
      }

      const updateData: Record<string, any> = {};

      if (rec.tempat_lahir) updateData.tempat_lahir = rec.tempat_lahir;
      if (rec.tanggal_lahir) updateData.tanggal_lahir = new Date(rec.tanggal_lahir);
      if (rec.golongan_darah) updateData.golongan_darah = rec.golongan_darah;
      if (rec.jumlah_saudara != null) updateData.jumlah_saudara = rec.jumlah_saudara;
      if (rec.anak_ke != null) updateData.anak_ke = rec.anak_ke;
      if (rec.hobi) updateData.hobi = rec.hobi;
      if (rec.cita_cita) updateData.cita_cita = rec.cita_cita;
      if (rec.alamat) updateData.alamat = rec.alamat;
      if (rec.kode_pos) updateData.kode_pos = rec.kode_pos;
      if (rec.provinsi) updateData.provinsi = rec.provinsi;
      if (rec.kabupaten) updateData.kabupaten = rec.kabupaten;
      if (rec.kecamatan) updateData.kecamatan = rec.kecamatan;
      if (rec.kelurahan) updateData.kelurahan = rec.kelurahan;
      if (rec.asal_sekolah) updateData.asal_sekolah = rec.asal_sekolah;
      if (rec.alamat_sekolah) updateData.alamat_sekolah = rec.alamat_sekolah;
      if (rec.tahun_lulus) updateData.tahun_lulus = rec.tahun_lulus;
      if (rec.no_hp) updateData.no_hp = rec.no_hp;
      if (rec.nisn) updateData.nisn = rec.nisn;

      if (Object.keys(updateData).length === 0) {
        skipped++;
        continue;
      }

      await prisma.pendaftar.update({
        where: { id: pendaftar.id },
        data: updateData,
      });

      updated++;
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      not_found,
      total: records.length,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
