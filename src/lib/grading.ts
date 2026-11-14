export const ANSWER_KEYS = {
  MTs: {
    1: "B",
    2: "D",
    3: "A",
    4: "B",
    5: "C", // PAI
    6: "A",
    7: "A",
    8: "B",
    9: "A",
    10: "D", // B.Indo
    11: "C",
    12: "B",
    13: "A",
    14: "A",
    15: "A", // IPA
    16: "D",
    17: "A",
    18: "C",
    19: "B",
    20: "B", // Mat
  },
  IL: {
    1: "B",
    2: "B",
    3: "B",
    4: "D",
    5: "B", // PAI
    6: "D",
    7: "C",
    8: "B",
    9: "D",
    10: "B", // B.Indo
    11: "B",
    12: "C",
    13: "C",
    14: "D",
    15: "B", // IPA
    16: "A",
    17: "C",
    18: "D",
    19: "B",
    20: "C", // Mat
  },
  SMA: {
    1: "A",
    2: "A",
    3: "C",
    4: "B",
    5: "B", // Nahwu
    6: "D",
    7: "C",
    8: "B",
    9: "D",
    10: "B", // B.Indo
    11: "B",
    12: "C",
    13: "C",
    14: "D",
    15: "B", // IPA
    16: "A",
    17: "C",
    18: "D",
    19: "B",
    20: "C", // Mat
  }
};

export function calculateAkademikScore(
  answers: Record<string, string>,
  jenjang: "MTs" | "IL" | "SMA",
): number {
  const key = ANSWER_KEYS[jenjang];
  if (!key) return 0;

  let correct = 0;
  for (let i = 1; i <= 20; i++) {
    if (answers[i] === key[i as keyof typeof key]) {
      correct++;
    }
  }
  return (correct / 20) * 100;
}

export function calculateKepribadianScore(
  answers: Record<string, string | number>,
): number {
  const keys = Object.keys(answers);
  if (keys.length === 0) return 0;

  // Check if answers are Likert numbers or legacy "A"/"B"
  const isLikert = keys.some(k => typeof answers[k] === 'number' || !isNaN(Number(answers[k])));

  if (!isLikert) {
    // Legacy EPPS forced choice fallback
    let positive = 0;
    Object.values(answers).forEach((val) => {
      if (val === "A") positive++;
    });
    return (positive / keys.length) * 100;
  }

  // 40-item Likert Karakter scoring
  const REVERSE_ITEMS = [3, 5, 8, 10, 14, 17, 21, 23, 26, 28, 32, 35];
  let coreTotal = 0;
  let coreCount = 0;

  for (let i = 1; i <= 36; i++) {
    const raw = answers[i] || answers[String(i)];
    if (raw !== undefined && raw !== null) {
      const val = Number(raw);
      if (!isNaN(val) && val >= 1 && val <= 5) {
        const itemScore = REVERSE_ITEMS.includes(i) ? (6 - val) : val;
        coreTotal += itemScore;
        coreCount++;
      }
    }
  }

  if (coreCount === 0) return 70; // safe baseline
  return Math.round((coreTotal / (coreCount * 5)) * 100);
}

export function calculateKesiapanScore(
  answers: Record<string, number | string>,
): number {
  const keys = Object.keys(answers);
  if (keys.length === 0) return 0;

  const REVERSE_ITEMS = [3, 5, 10, 13, 17];
  let total = 0;
  let count = 0;

  keys.forEach((k) => {
    const id = Number(k);
    const raw = answers[k];
    if (raw !== undefined && raw !== null) {
      const val = Number(raw);
      if (!isNaN(val) && val >= 1 && val <= 5) {
        const itemScore = REVERSE_ITEMS.includes(id) ? (6 - val) : val;
        total += itemScore;
        count++;
      }
    }
  });

  if (count === 0) return 0;
  const maxPossible = count * 5;
  return Math.round((total / maxPossible) * 100);
}

export function calculateFinalScore(
  akademik: number,
  quran: number,
  wawancara: number,
  kepribadian: number,
  kesiapan: number,
): number {
  // Weighting: Akademik 30%, Quran 30%, Wawancara 20%, Kepribadian 10%, Kesiapan 10%
  return (
    akademik * 0.3 +
    quran * 0.3 +
    wawancara * 0.2 +
    kepribadian * 0.1 +
    kesiapan * 0.1
  );
}

export function determineStatus(
  finalScore: number,
  quranScore: number,
  hafalanScore?: number,
  arabScore?: number,
  isDirectSMAorMA?: boolean
): "LULUS" | "CADANGAN" | "DITOLAK" {
  // Hard Gate Al-Qur'an: Minimal 70 untuk tetap memiliki peluang lulus (baik murni maupun bersyarat)
  if (quranScore < 70) return "DITOLAK";

  // Khusus Jalur Langsung SMA/MA: Tiga Pilar Wajib
  if (isDirectSMAorMA) {
    if ((hafalanScore != null && hafalanScore < 70) || (arabScore != null && arabScore < 70)) {
      return "DITOLAK";
    }
  }

  // Ambang Kelulusan Murni Al-Qur'an: Minimal 75. Jika 70-74 masuk Cadangan (Lulus Bersyarat)
  if (quranScore < 75) return "CADANGAN";

  if (isDirectSMAorMA) {
    if ((hafalanScore != null && hafalanScore < 75) || (arabScore != null && arabScore < 75)) {
      return "CADANGAN";
    }
  }

  if (finalScore >= 70) return "LULUS";
  if (finalScore >= 55) return "CADANGAN";
  return "DITOLAK";
}

export function gradeToScore(grade: string): number {
  switch (grade?.toUpperCase()) {
    case "A":
      return 95;
    case "B":
      return 80;
    case "C":
      return 68;
    case "D":
      return 50;
    case "E":
      return 20;
    default:
      return 0;
  }
}

export function scoreToGrade(score: number): string {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 70) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateQuranGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  // Standar KKM Resmi Ujian Bacaan Al-Qur'an:
  // >= 85: A (Sangat Baik / Lulus Murni)
  // 75 - 84: B (Baik / Lulus Murni - Memenuhi KKM 75)
  // 70 - 74: C (Cukup / Lulus Bersyarat - Wajib Matrikulasi Tahsin)
  // 40 - 69: D (Kurang / Tidak Lulus - Hard Gate Fail)
  // < 40: E (Sangat Kurang / Tidak Lulus)
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 70) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateHafalanGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 70) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateArabGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 70) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateAkademikGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "E";
}

export function evaluateKepribadianGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
}

export function evaluateWawancaraGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
}

export function evaluateKesiapanGrade(
  score: number,
): "A" | "B" | "C" | "D" | "E" {
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 25) return "D";
  return "E";
}

export function evaluateStatusGrade(
  status: string | null | undefined,
): "A" | "B" | "C" | "D" | "E" {
  const s = status?.toLowerCase() || "";
  if (
    s.includes("cadangan") ||
    s.includes("catatan") ||
    s.includes("pembinaan") ||
    s.includes("bimbingan")
  ) {
    return "B";
  }
  if (s.includes("sangat layak") || s === "siap" || s.includes("diterima"))
    return "A";
  if (
    s.includes("layak") ||
    s.includes("cukup") ||
    s === "cukup siap"
  )
    return "B";
  if (s.includes("tidak layak") || s.includes("ditolak") || s.includes("gagal"))
    return "D";
  return "C";
}

export function determineFinalDecision(
  grades: {
    quran: "A" | "B" | "C" | "D" | "E";
    akademik: "A" | "B" | "C" | "D" | "E";
    kepribadian: "A" | "B" | "C" | "D" | "E";
    kesiapan: "A" | "B" | "C" | "D" | "E";
    wawancaraSantri: "A" | "B" | "C" | "D" | "E";
    wawancaraOrangTua: "A" | "B" | "C" | "D" | "E";
    hafalan?: "A" | "B" | "C" | "D" | "E";
    arab?: "A" | "B" | "C" | "D" | "E";
  },
  isDirectSMAorMA?: boolean
): "DITERIMA" | "CADANGAN" | "DITOLAK" {
  const vals = Object.values(grades).filter(Boolean) as ("A" | "B" | "C" | "D" | "E")[];

  // 1. HARD GATE: CRITICAL REJECTION (DITOLAK MUTLAK)
  // 1a. Ada komponen bernilai E
  if (vals.includes("E")) return "DITOLAK";

  // 1b. PILAR MUTLAK SEMUA JENJANG: Bacaan Al-Qur'an bernilai D (< 70) otomatis DITOLAK
  // Nilai CBT Akademik/Wawancara setinggi apapun TIDAK BISA menyelamatkan kelulusan jika Al-Qur'an < 70
  if (grades.quran === "D") return "DITOLAK";

  // 1c. Wawancara Calon Santri bernilai D otomatis DITOLAK
  if (grades.wawancaraSantri === "D") return "DITOLAK";

  // 1d. KHUSUS JALUR LANGSUNG SMA / MA: TIGA PILAR KUNCI
  // Jika Hafalan Al-Qur'an atau Lisan Bahasa Arab bernilai D (< 70), otomatis DITOLAK
  if (isDirectSMAorMA) {
    if (grades.hafalan === "D") return "DITOLAK";
    if (grades.arab === "D") return "DITOLAK";
  }

  // 1e. Jika ada lebih dari satu komponen sekunder bernilai D
  const secondaryDs = [
    grades.akademik,
    grades.kepribadian,
    grades.kesiapan,
    grades.wawancaraOrangTua,
  ].filter((v) => v === "D").length;
  if (secondaryDs > 1) return "DITOLAK";

  // 2. PILAR CADANGAN / LULUS BERSYARAT (CADANGAN)
  // 2a. Bacaan Al-Qur'an bernilai C (skor 70-74): Lulus Bersyarat / Wajib Matrikulasi Tahsin
  if (grades.quran === "C") return "CADANGAN";

  // 2b. Khusus SMA/MA: Jika Hafalan atau B. Arab bernilai C (skor 70-74), masuk CADANGAN (opsi turun IL / matrikulasi)
  if (isDirectSMAorMA) {
    if (grades.hafalan === "C" || grades.arab === "C") return "CADANGAN";
  }

  // 2c. Ada 1 komponen sekunder bernilai D
  if (secondaryDs === 1) return "CADANGAN";

  // 2d. Jika komponen sekunder ada lebih dari 1 yang bernilai C
  const countC = vals.filter((v) => v === "C").length;
  if (countC > 1) return "CADANGAN";

  // 3. DITERIMA (LULUS MURNI)
  // Al-Qur'an memenuhi KKM >= 75 (Grade A atau B), Tiga Pilar SMA/MA >= 75, dan komponen lain aman
  return "DITERIMA";
}
