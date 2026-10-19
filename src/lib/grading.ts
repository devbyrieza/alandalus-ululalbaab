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
): "LULUS" | "CADANGAN" | "DITOLAK" {
  // Standar KKM Baru Al-Qur'an: Minimal 75 untuk Lulus Murni
  if (quranScore < 60) return "DITOLAK";
  if (quranScore < 75) return "CADANGAN"; // Lulus bersyarat / wajib matrikulasi

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
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function evaluateQuranGrade(score: number): "A" | "B" | "C" | "D" | "E" {
  // Standar KKM Baru Resmi Ujian Al-Qur'an: Minimal 75
  if (score >= 85) return "A"; // Lulus predikat Baik Sekali
  if (score >= 75) return "B"; // Lulus predikat Baik (Memenuhi KKM)
  if (score >= 60) return "C"; // Lulus Bersyarat (Di bawah KKM, wajib matrikulasi)
  if (score >= 40) return "D"; // Tidak Lulus
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

export function determineFinalDecision(grades: {
  quran: "A" | "B" | "C" | "D" | "E";
  akademik: "A" | "B" | "C" | "D" | "E";
  kepribadian: "A" | "B" | "C" | "D" | "E";
  kesiapan: "A" | "B" | "C" | "D" | "E";
  wawancaraSantri: "A" | "B" | "C" | "D" | "E";
  wawancaraOrangTua: "A" | "B" | "C" | "D" | "E";
}): "DITERIMA" | "CADANGAN" | "DITOLAK" {
  const vals = Object.values(grades);

  // 1. CRITICAL REJECTION (DITOLAK)
  if (vals.includes("E")) return "DITOLAK";

  // Critical Components (Quran or Wawancara Calon Santri) getting D is an automatic rejection
  if (
    grades.quran === "D" ||
    grades.wawancaraSantri === "D"
  ) {
    return "DITOLAK";
  }

  // If there are multiple Ds in secondary components, it's a rejection
  const secondaryDs = [
    grades.akademik,
    grades.kepribadian,
    grades.kesiapan,
    grades.wawancaraOrangTua,
  ].filter((v) => v === "D").length;
  if (secondaryDs > 1) return "DITOLAK";

  // 2. AUTOMATIC RESERVE (CADANGAN)
  if (grades.quran === "B" || grades.quran === "C") return "CADANGAN";
  if (secondaryDs === 1) return "CADANGAN";

  if (grades.wawancaraSantri === "B") {
    const countA = vals.filter((v) => v === "A").length;
    if (countA < 4) return "CADANGAN";
  }

  // 3. DITERIMA (LULUS)
  const countC = vals.filter((v) => v === "C").length;
  if (countC > 1) return "CADANGAN";

  return "DITERIMA";
}
