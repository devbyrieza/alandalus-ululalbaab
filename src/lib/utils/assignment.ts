import { prisma } from "../prisma";

function getExamCategory(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("hafalan")) return "HAFALAN";
  if (t.includes("quran") || t.includes("qur'an") || t.includes("bacaan")) return "QURAN";
  if (t.includes("arab") || t.includes("lisan")) return "LISAN_ARAB";
  // W_ORTU must be checked BEFORE W_SANTRI because titles often contain "Orangtua/Wali Santri"
  if (
    t.includes("cawalsan") ||
    t.includes("ortu") ||
    t.includes("orang tua") ||
    t.includes("orangtua") ||
    t.includes("wali")
  ) {
    return "W_ORTU";
  }
  if (t.includes("calsan") || t.includes("santri")) return "W_SANTRI";
  return "OTHER";
}

function matchesCategory(
  category: string,
  title: string,
  creatorRole?: string | null,
  creatorSecondaryRoles?: string[] | null,
): boolean {
  const titleCat = getExamCategory(title);
  if (titleCat === category) return true;

  const roles = [creatorRole, ...(creatorSecondaryRoles || [])].filter(Boolean) as string[];

  if (category === "QURAN") {
    return (
      roles.some((r) => ["penguji", "penguji_quran", "penguji_hafalan"].includes(r)) ||
      /qur|bacaan|tahfidz/i.test(title)
    );
  }
  if (category === "HAFALAN") {
    return (
      roles.some((r) => ["penguji_hafalan", "penguji", "penguji_quran"].includes(r)) ||
      /hafalan/i.test(title)
    );
  }
  if (category === "W_SANTRI") {
    return (
      roles.some((r) => ["pewawancara_calsan", "penguji_calsan", "pewawancara", "penguji_santri"].includes(r)) ||
      (/santri|calsan/i.test(title) && !/ortu|orang tua|orangtua|wali|cawalsan/i.test(title))
    );
  }
  if (category === "W_ORTU") {
    return (
      roles.some((r) => ["pewawancara_cawalsan", "penguji_cawalsan", "pewawancara_ortu"].includes(r)) ||
      /ortu|orang tua|orangtua|wali|cawalsan/i.test(title)
    );
  }
  if (category === "LISAN_ARAB") {
    return (
      roles.some((r) => ["penguji_bahasa_arab", "penguji_arab"].includes(r)) ||
      /arab|lisan/i.test(title)
    );
  }
  return false;
}

/**
 * Mencari penguji dengan beban kerja paling ringan dari sekumpulan sesi yang tersedia di waktu yang sama.
 * Logika Pemerataan Beban (Fair Load Balancing):
 * 1. Jika di waktu/jam yang sama terdapat > 1 penguji tersedia untuk jenis ujian/wawancara ini:
 * 2. Hitung jumlah jadwal yang telah diperoleh oleh masing-masing penguji:
 *    - Prioritas 1: Jumlah jadwal penguji di kategori tes/wawancara ini (categoryCount ASC).
 *    - Prioritas 2: Total jadwal menguji/mewawancara secara keseluruhan (totalCount ASC).
 * 3. Otomatis arahkan dan berikan pendaftar ke penguji yang lebih sedikit mendapat jadwal.
 *
 * @param startTime Waktu mulai ujian
 * @param category Kategori ujian (QURAN, HAFALAN, W_SANTRI, W_ORTU, LISAN_ARAB)
 * @param tahunAjaranId ID Tahun Ajaran aktif
 * @param pendaftarGender Jenis kelamin pendaftar (L / P)
 * @returns Object berisi examiner_id, session_id pemenang, serta rincian load
 */
export async function getLeastLoadedExaminerFromPool(
  startTime: Date,
  category: string,
  tahunAjaranId?: string | null,
  pendaftarGender?: string | null,
) {
  const targetDate = new Date(startTime);
  if (isNaN(targetDate.getTime())) return null;

  // 1. Toleransi pencarian waktu +/- 45 detik untuk menangani perbedaan milidetik
  const minTime = new Date(targetDate.getTime() - 45000);
  const maxTime = new Date(targetDate.getTime() + 45000);

  // 2. Ambil semua sesi aktif di rentang waktu ini
  const sessions = await prisma.examSession.findMany({
    where: {
      start_time: {
        gte: minTime,
        lte: maxTime,
      },
      is_active: true,
    },
    select: {
      id: true,
      title: true,
      created_by: true,
      booked_count: true,
      quota: true,
      start_time: true,
      end_time: true,
      location: true,
      notes: true,
      creator: {
        select: {
          id: true,
          role: true,
          secondary_roles: true,
          jenis_kelamin: true,
          full_name: true,
        },
      },
    },
  });

  if (sessions.length === 0) return null;

  // 3. Filter sesi yang cocok dengan kategori yang diminta
  const categorySessions = sessions.filter((s) =>
    matchesCategory(
      category,
      s.title || "",
      s.creator?.role,
      s.creator?.secondary_roles as string[] | undefined,
    ),
  );

  if (categorySessions.length === 0) return null;

  // 4. Deteksi penguji yang sedang sibuk / terjadwal di jam yang sama pada kategori apapun
  const sStart = minTime;
  const sEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);

  const busyBookings = await prisma.jadwalUjian.findMany({
    where: {
      exam_session: {
        start_time: { lt: sEnd },
        end_time: { gt: sStart },
      },
      pendaftar: {
        deleted_at: null,
      },
    },
    select: {
      penguji_quran_id: true,
      penguji_hafalan_id: true,
      penguji_santri_id: true,
      penguji_ortu_id: true,
      penguji_arab_id: true,
    },
  });

  const busyExaminerIds = new Set<string>();
  busyBookings.forEach((b) => {
    if (b.penguji_quran_id) busyExaminerIds.add(b.penguji_quran_id);
    if (b.penguji_hafalan_id) busyExaminerIds.add(b.penguji_hafalan_id);
    if (b.penguji_santri_id) busyExaminerIds.add(b.penguji_santri_id);
    if (b.penguji_ortu_id) busyExaminerIds.add(b.penguji_ortu_id);
    if (b.penguji_arab_id) busyExaminerIds.add(b.penguji_arab_id);
  });

  // 5. Gender Matching
  const jk = pendaftarGender?.toUpperCase() || "";
  const isPendaftarPutra = jk === "L" || jk === "LAKI-LAKI" || jk.includes("PUTRA");

  // 6. Filter sesi yang masih memiliki kuota, penguji bebas bentrok, dan gender sesuai
  const availableSessions = categorySessions.filter((s) => {
    if (s.booked_count >= s.quota || !s.created_by) return false;

    const isCreatorAdmin =
      s.creator?.role === "admin" || s.creator?.role === "admin_super";

    // Jika bukan sesi admin, pastikan penguji tidak sedang ada jadwal di jam yang sama
    if (!isCreatorAdmin && busyExaminerIds.has(s.created_by)) return false;

    // Filter gender penguji jika tersedia
    if (pendaftarGender && s.creator?.jenis_kelamin) {
      const creatorJk = s.creator.jenis_kelamin.toUpperCase();
      const isCreatorPutra =
        creatorJk === "L" || creatorJk === "LAKI-LAKI" || creatorJk.includes("PUTRA");
      if (isCreatorPutra !== isPendaftarPutra) return false;
    }

    return true;
  });

  if (availableSessions.length === 0) return null;

  // 7. Resolusi Tahun Ajaran aktif jika tidak disediakan
  let activeTaId = tahunAjaranId;
  if (!activeTaId) {
    const activeTA = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { id: true },
    });
    activeTaId = activeTA?.id || null;
  }

  // 8. Hitung beban kerja setiap kandidat penguji
  type Candidate = {
    examinerId: string;
    sessionId: string;
    categoryCount: number;
    totalCount: number;
  };

  const candidates: Candidate[] = [];

  let catField: string | null = null;
  if (category === "QURAN") catField = "penguji_quran_id";
  else if (category === "HAFALAN") catField = "penguji_hafalan_id";
  else if (category === "W_SANTRI") catField = "penguji_santri_id";
  else if (category === "W_ORTU") catField = "penguji_ortu_id";
  else if (category === "LISAN_ARAB") catField = "penguji_arab_id";

  const countWhereBase: any = {
    pendaftar: {
      deleted_at: null,
      NOT: {
        nama_lengkap: { contains: "tes", mode: "insensitive" },
      },
    },
  };
  if (activeTaId) {
    countWhereBase.tahun_ajaran_id = activeTaId;
  }

  for (const s of availableSessions) {
    const isCreatorAdmin =
      s.creator?.role === "admin" || s.creator?.role === "admin_super";

    if (!isCreatorAdmin && s.created_by) {
      // Sesi milik penguji/pewawancara spesifik
      const [categoryCount, totalCount] = await Promise.all([
        catField
          ? prisma.jadwalUjian.count({
              where: {
                ...countWhereBase,
                [catField]: s.created_by,
              },
            })
          : 0,
        prisma.jadwalUjian.count({
          where: {
            ...countWhereBase,
            OR: [
              { penguji_quran_id: s.created_by },
              { penguji_hafalan_id: s.created_by },
              { penguji_santri_id: s.created_by },
              { penguji_ortu_id: s.created_by },
              { penguji_arab_id: s.created_by },
            ],
          },
        }),
      ]);

      candidates.push({
        examinerId: s.created_by,
        sessionId: s.id,
        categoryCount,
        totalCount,
      });
    } else {
      // Sesi umum / dibuat admin: cari penguji berkualifikasi dari Profile
      let targetRoles: string[] = [];
      if (category === "QURAN") targetRoles = ["penguji", "penguji_quran", "penguji_hafalan"];
      else if (category === "HAFALAN") targetRoles = ["penguji_hafalan", "penguji", "penguji_quran"];
      else if (category === "W_SANTRI") targetRoles = ["pewawancara_calsan", "penguji_calsan", "pewawancara", "penguji_santri"];
      else if (category === "W_ORTU") targetRoles = ["pewawancara_cawalsan", "penguji_cawalsan", "pewawancara_ortu"];
      else if (category === "LISAN_ARAB") targetRoles = ["penguji_bahasa_arab", "penguji_arab"];

      const eligibleProfiles = await prisma.profile.findMany({
        where: {
          OR: [
            { role: { in: targetRoles } },
            ...targetRoles.map((r) => ({ secondary_roles: { has: r } })),
          ],
        },
        select: {
          id: true,
          role: true,
          secondary_roles: true,
          jenis_kelamin: true,
        },
      });

      const freeProfiles = eligibleProfiles.filter((p) => {
        if (busyExaminerIds.has(p.id)) return false;
        if (pendaftarGender && p.jenis_kelamin) {
          const pJk = p.jenis_kelamin.toUpperCase();
          const isProfPutra = pJk === "L" || pJk === "LAKI-LAKI" || pJk.includes("PUTRA");
          if (isProfPutra !== isPendaftarPutra) return false;
        }
        return true;
      });

      if (freeProfiles.length > 0) {
        for (const p of freeProfiles) {
          const [categoryCount, totalCount] = await Promise.all([
            catField
              ? prisma.jadwalUjian.count({
                  where: {
                    ...countWhereBase,
                    [catField]: p.id,
                  },
                })
              : 0,
            prisma.jadwalUjian.count({
              where: {
                ...countWhereBase,
                OR: [
                  { penguji_quran_id: p.id },
                  { penguji_hafalan_id: p.id },
                  { penguji_santri_id: p.id },
                  { penguji_ortu_id: p.id },
                  { penguji_arab_id: p.id },
                ],
              },
            }),
          ]);

          candidates.push({
            examinerId: p.id,
            sessionId: s.id,
            categoryCount,
            totalCount,
          });
        }
      } else {
        candidates.push({
          examinerId: s.created_by,
          sessionId: s.id,
          categoryCount: 0,
          totalCount: 0,
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // 9. PEMERATAAN BEBAN KERJA (FAIR LOAD BALANCING):
  // Prioritas 1: Penguji yang lebih sedikit mendapat jadwal di kategori tes ini
  // Prioritas 2: Penguji yang lebih sedikit total jadwalnya secara keseluruhan
  // Prioritas 3: Deterministik berdasarkan ID penguji
  candidates.sort((a, b) => {
    if (a.categoryCount !== b.categoryCount) {
      return a.categoryCount - b.categoryCount;
    }
    if (a.totalCount !== b.totalCount) {
      return a.totalCount - b.totalCount;
    }
    return a.examinerId.localeCompare(b.examinerId);
  });

  const winner = candidates[0];

  return {
    examiner_id: winner.examinerId,
    session_id: winner.sessionId,
    category_count: winner.categoryCount,
    total_count: winner.totalCount,
  };
}
