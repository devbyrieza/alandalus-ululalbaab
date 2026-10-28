import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jadwals = await prisma.jadwalUjian.findMany({
      where: {
        exam_session_id: { not: null } },
      include: {
        exam_session: true } });

    let updatedCount = 0;
    const updates = [];

    for (const jadwal of jadwals) {
      if (!jadwal.exam_session) continue;

      const title = (jadwal.exam_session.title || "").toLowerCase();
      const sessionCreator = jadwal.exam_session.created_by;
      let updateData: any = {};

      const isOrtu =
        title.includes("cawalsan") ||
        title.includes("ortu") ||
        title.includes("orang") ||
        title.includes("wali");
      const isQuran =
        title.includes("qur") ||
        title.includes("quran") ||
        title.includes("hafalan") ||
        title.includes("bacaan");
      const isSantri =
        (title.includes("calsan") ||
        title.includes("santri") ||
        title.includes("wawancara")) && !isOrtu;

      if (isOrtu) {
        // If penguji_santri_id was mistakenly assigned or penguji_ortu_id is missing:
        if (jadwal.penguji_santri_id && !jadwal.penguji_ortu_id) {
          updateData.penguji_ortu_id = jadwal.penguji_santri_id;
          updateData.penguji_santri_id = null;
          if (jadwal.status_santri && !jadwal.status_ortu) {
            updateData.status_ortu = jadwal.status_santri;
            updateData.status_santri = null;
          }
        } else if (!jadwal.penguji_ortu_id && sessionCreator) {
          updateData.penguji_ortu_id = sessionCreator;
        }
      } else if (isQuran) {
        if (!jadwal.penguji_quran_id && sessionCreator) {
          updateData.penguji_quran_id = sessionCreator;
        }
      } else if (isSantri) {
        if (!jadwal.penguji_santri_id && sessionCreator) {
          updateData.penguji_santri_id = sessionCreator;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.jadwalUjian.update({
          where: { id: jadwal.id },
          data: updateData });
        updatedCount++;
        updates.push({ id: jadwal.id, ...updateData });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} records`,
      updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
