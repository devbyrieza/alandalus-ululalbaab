/**
 * Surat Pengumuman Hasil Seleksi — penomoran resmi & generator PDF (server-side).
 * Format nomor: 012-<KODE>/PSB-PUAS/<ROMAWI-BULAN>/<TAHUN>
 * KODE urut: AA..AZ lalu BA, BB, ... (2 huruf A-Z, basis 26).
 */
import { jsPDF } from "jspdf";
import { PDF_BRANDING } from "@/config/pdf-branding";
import { SURAT_PENGUMUMAN_CONFIG as CFG } from "@/config/surat-pengumuman";
import { prisma } from "@/lib/prisma";

const BULAN_ROMAWI = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

// ============ PENOMORAN ============

/** Kode berikutnya: AA -> AB ... AZ -> BA ... ZZ -> null (habis). */
export function nextKodeSurat(kode: string): string | null {
  const chars = kode.toUpperCase().split("");
  if (chars.length !== 2 || chars.some((c) => c < "A" || c > "Z")) return null;
  const value = (chars[0].charCodeAt(0) - 65) * 26 + (chars[1].charCodeAt(0) - 65) + 1;
  if (value >= 26 * 26) return null;
  return String.fromCharCode(65 + Math.floor(value / 26)) + String.fromCharCode(65 + (value % 26));
}

export function firstKodeSurat(): string {
  return "AA";
}

export function buildNomorSurat(kode: string, tanggal: Date): string {
  const bulan = BULAN_ROMAWI[tanggal.getMonth()];
  const tahun = tanggal.getFullYear();
  return `${CFG.nomorPrefix}-${kode}/${CFG.nomorSuffix}/${bulan}/${tahun}`;
}

/** Kode dari nomor surat lengkap, atau null jika format beda. */
export function parseKodeSurat(nomor: string): string | null {
  const m = nomor.match(new RegExp(`^${CFG.nomorPrefix}-([A-Z]{2})/${CFG.nomorSuffix}/`));
  return m ? m[1] : null;
}

/** Ambil semua kode surat yang sudah terpakai: dari pengumuman + baseline manual di app_settings. */
export async function getKodeTerpakai(): Promise<string[]> {
  const rows = await prisma.pengumuman.findMany({
    where: { nomor_surat: { not: null } },
    select: { nomor_surat: true },
  });
  const kodes: string[] = [];
  for (const r of rows) {
    const kode = parseKodeSurat(r.nomor_surat!);
    if (kode) kodes.push(kode);
  }
  // Surat yang terbit MANUAL sebelum fitur ini (mis. AA & AB Ibrahim/Jooara)
  // dicatat sebagai baseline di app_settings: key "surat_nomor_terakhir".
  const setting = await prisma.appSetting.findUnique({
    where: { key: "surat_nomor_terakhir" },
  });
  if (setting) {
    const kode = parseKodeSurat(setting.value);
    if (kode) kodes.push(kode);
  }
  return kodes;
}

export function nilaiKode(kode: string): number {
  return (kode.charCodeAt(0) - 65) * 26 + (kode.charCodeAt(1) - 65);
}

export function kodeDariNilai(v: number): string {
  return String.fromCharCode(65 + Math.floor(v / 26)) + String.fromCharCode(65 + (v % 26));
}

/**
 * Nomor surat berikutnya yang belum terpakai (menjalankan urutan AA, AB, ...).
 * Tidak mengunci — finalisasi memverifikasi ulang + unique constraint.
 */
export async function getNextNomorSurat(tanggal: Date): Promise<{ kode: string; nomor: string }> {
  const terpakai = await getKodeTerpakai();
  let nilai = terpakai.length ? Math.max(...terpakai.map(nilaiKode)) + 1 : 0;
  const max = 26 * 26;
  while (nilai < max) {
    const kode = kodeDariNilai(nilai);
    const nomor = buildNomorSurat(kode, tanggal);
    const ada = await prisma.pengumuman.findUnique({ where: { nomor_surat: nomor } });
    if (!ada) return { kode, nomor };
    nilai++;
  }
  throw new Error("Nomor surat untuk tahun ajaran ini sudah habis (melebihi ZZ).");
}

// ============ GENERATOR PDF ============

export interface SuratPengumumanData {
  nomorSurat: string;
  tanggalTerbit: Date; // UTC
  namaLengkap: string;
  nomorPendaftaran: string;
  kelasDiterima: string;
}

const imageCache: Record<string, string | null> = {};

async function loadImage(path: string): Promise<string | null> {
  if (!path) return null;
  if (imageCache[path] !== undefined) return imageCache[path];
  try {
    const fs = await import("fs/promises");
    const pathMod = await import("path");
    const filePath = pathMod.join(process.cwd(), "public", path);
    const data = await fs.readFile(filePath);
    const ext = pathMod.extname(path).slice(1).toLowerCase() || "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : "png";
    imageCache[path] = `data:image/${mime};base64,${data.toString("base64")}`;
  } catch {
    imageCache[path] = null;
  }
  return imageCache[path];
}

function tanggalIndo(d: Date): string {
  // Gunakan WIB (UTC+7) sebagai tanggal terbit resmi
  const wib = new Date(d.getTime() + 7 * 3600 * 1000);
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${wib.getUTCDate()} ${bulan[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
}

/**
 * Kop surat programatik meniru kop surat resmi PPSP-PUAS
 * (logo kiri + nama pesantren + alamat kanan + garis pemisah).
 */
async function drawKopProgramatik(doc: jsPDF): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth();

  const logo = await loadImage("/images/kop-surat.png");
  if (logo) doc.addImage(logo, "PNG", 14, 8, 22, 27);

  const textX = 40;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  // Baris nama arab di kop asli dilewati: font standar jsPDF tidak punya glyph arab
  doc.text("", textX, 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15.5);
  doc.text("PESANTREN ULUL ALBAAB SUKABUMI", textX, 17.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("MANAGED BY AL-ANDALUS INTERNATIONAL ISLAMIC BOARDING SCHOOL", textX, 22.5);
  doc.text("RABBANI, CENDEKIA, DAN MANDIRI", textX, 26.5);

  // Blok alamat kanan
  const rx = pageWidth - 15;
  doc.setFontSize(7.5);
  doc.text("Kp. Cihaur RT.04 RW.04 Desa Cicantayan", rx, 11, { align: "right" });
  doc.text("Kec. Cicantayan, Kab. Sukabumi - Jawa Barat", rx, 14.5, { align: "right" });
  doc.text("Telepon : 0812 85 300 800", rx, 18, { align: "right" });
  doc.text("Email : alandalusululalbaab2@gmail.com", rx, 21.5, { align: "right" });

  // Garis pemisah ganda
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.9);
  doc.line(14, 31, pageWidth - 14, 31);
  doc.setLineWidth(0.25);
  doc.line(14, 32.2, pageWidth - 14, 32.2);
  doc.setTextColor(0, 0, 0);
}

/** Tulis paragraf mengalir dengan segmen bold/normal, return y berikutnya. */
function writeRichText(
  doc: jsPDF,
  segments: { text: string; bold?: boolean; italic?: boolean }[],
  x: number,
  y: number,
  width: number,
  lineHeight = 5.6
): number {
  doc.setFontSize(11);
  // Bangun daftar kata dengan style masing-masing
  const words: { text: string; bold: boolean; italic: boolean }[] = [];
  for (const seg of segments) {
    const parts = seg.text.split(/(\s+)/).filter((p) => p !== "");
    for (const p of parts) words.push({ text: p, bold: !!seg.bold, italic: !!seg.italic });
  }

  const spaceW = doc.getTextWidth(" ");
  let lineX = x;
  let lineY = y;
  const maxWidth = x + width;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    doc.setFont("helvetica", w.bold ? "bold" : w.italic ? "italic" : "normal");
    const ww = doc.getTextWidth(w.text);
    const isSpace = /^\s+$/.test(w.text);
    if (!isSpace && lineX + ww > maxWidth && lineX > x) {
      lineX = x;
      lineY += lineHeight;
    }
    if (!isSpace) doc.text(w.text, lineX, lineY);
    lineX += ww;
    // spasi antar kata: normal style
    doc.setFont("helvetica", "normal");
    if (i < words.length - 1) {
      const next = words[i + 1];
      const gap = isSpace ? doc.getTextWidth(w.text.trim() + " ") : spaceW;
      lineX += gap;
      void next;
    }
  }
  return lineY + lineHeight;
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  opts?: { italic?: boolean; indentFirst?: number; lineHeight?: number }
): number {
  doc.setFont("helvetica", opts?.italic ? "italic" : "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(text, width - (opts?.indentFirst || 0));
  let cy = y;
  const lh = opts?.lineHeight || 5.6;
  lines.forEach((line: string, idx: number) => {
    const indent = idx === 0 ? opts?.indentFirst || 0 : 0;
    doc.text(line, x + indent, cy);
    cy += lh;
  });
  return cy;
}

/**
 * Generate PDF Surat Pengumuman Hasil (server-side).
 * Jalur utama: overlay teks variabel di atas background template resmi
 * (public/images/template-surat-pengumuman.jpg — halaman surat asli dengan
 * zona variabel dikosongkan), sehingga hasil identik dengan surat manual.
 * Jalur cadangan: render programatik bila aset template tidak ditemukan.
 */
export async function generateSuratPengumumanHasil(
  data: SuratPengumumanData
): Promise<{ buffer: Buffer; filename: string }> {
  const template = await loadImage("/images/template-surat-pengumuman.jpg");
  if (template) {
    return generateSuratDariTemplate(data, template);
  }
  return generateSuratProgramatik(data);
}

/**
 * Posisi zona variabel pada template resmi (pt, page 612 x 935.52).
 * y diukur pdf.js dari BAWAH halaman (baseline) — dikonversi ke koordinat jsPDF (dari ATAS).
 */
const TEMPLATE_PAGE = { w: 612, h: 935.52 };
const Y = (yBottom: number) => TEMPLATE_PAGE.h - yBottom;
const ZONA = {
  nomor: { x: 127.49, y: Y(793.42), bold: true },
  nama: { x: 251.14, y: Y(521.42), bold: true },
  noPendaftaran: { x: 251.14, y: Y(504.62), bold: true },
  kelas: { x: 241.06, y: Y(474.12), bold: false },
  tanggal: { x: 345, y: Y(348.82), bold: false },
};

async function generateSuratDariTemplate(
  data: SuratPengumumanData,
  template: string
): Promise<{ buffer: Buffer; filename: string }> {
  const doc = new jsPDF({
    unit: "pt",
    format: [TEMPLATE_PAGE.w, TEMPLATE_PAGE.h],
  });
  doc.addImage(template, "JPEG", 0, 0, TEMPLATE_PAGE.w, TEMPLATE_PAGE.h);

  const tulis = (text: string, zona: { x: number; y: number; bold: boolean }) => {
    doc.setFont("times", zona.bold ? "bold" : "normal");
    doc.setFontSize(12);
    doc.text(text, zona.x, zona.y);
  };

  tulis(data.nomorSurat, ZONA.nomor);
  tulis(data.namaLengkap.toUpperCase(), ZONA.nama);
  tulis(data.nomorPendaftaran, ZONA.noPendaftaran);
  tulis(`kelas ${data.kelasDiterima}`, ZONA.kelas);
  tulis(`Sukabumi, ${tanggalIndo(data.tanggalTerbit)}`, ZONA.tanggal);

  const filename = `Surat Pengumuman Hasil PSB 2027-2028 ${data.namaLengkap}.pdf`;
  return { buffer: Buffer.from(doc.output("arraybuffer")), filename };
}

/**
 * Jalur cadangan programatik (bila aset template hilang): layout mengacu surat
 * resmi 012-/PSB-PUAS dengan kop digambar via jsPDF.
 */
async function generateSuratProgramatik(
  data: SuratPengumumanData
): Promise<{ buffer: Buffer; filename: string }> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const width = pageWidth - marginX * 2;

  // 1. Kop surat — coba full image letterhead; jika aset tidak ada, gambar programatik
  const kop = await loadImage(PDF_BRANDING.assets.kop_full);
  if (kop) {
    doc.addImage(kop, "JPEG", 0, 0, pageWidth, pageHeight);
  } else {
    await drawKopProgramatik(doc);
  }

  let y = 48;

  // 2. No & Hal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("No", marginX, y);
  doc.text(":", marginX + 18, y);
  doc.text(data.nomorSurat, marginX + 22, y);
  y += 6;
  doc.text("Hal", marginX, y);
  doc.text(":", marginX + 18, y);
  doc.text(CFG.hal, marginX + 22, y);
  y += 12;

  // 3. Tujuan
  doc.setFont("helvetica", "bold");
  for (const line of CFG.tujuan) {
    doc.text(line, marginX, y);
    y += 6;
  }
  y += 4;

  // 4. Salam pembuka (transliterasi; aset gambar arab menyusul bila tersedia)
  doc.setFont("helvetica", "italic");
  doc.text("Assalamu'alaikum Warahmatullahi Wabarakatuh.", pageWidth / 2, y, { align: "center" });
  y += 10;

  // 5. Badan surat
  y = paragraph(
    doc,
    "Alhamdulillah segala puji bagi Allah Rabb semesta alam. Shalawat dan salam semoga tercurah kepada Rasulullah saw. keluarga, para sahabat, dan pengikutnya hingga akhir zaman.",
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    "Kami berharap bapak/ibu wali calon santri Pesantren Ulul Albaab Sukabumi senantiasa dalam keadaan sehat serta dalam ketaatan yang diridhai Allah swt., amin.",
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    "Selanjutnya, Kami selaku Panitia Penerimaan Santri Baru Pesantren Ulul Albaab Sukabumi Tahun Pelajaran 2027/2028 mengucapkan selamat kepada putra/putri Bapak/Ibu yang bernama:",
    marginX,
    y,
    width
  );
  y += 2;

  // 6. Blok identitas
  doc.setFont("helvetica", "bold");
  doc.text("Ananda", marginX + 8, y);
  doc.text(":", marginX + 45, y);
  doc.text(data.namaLengkap.toUpperCase(), marginX + 49, y);
  y += 6.5;
  doc.text("No. Pendaftaran", marginX + 8, y);
  doc.text(":", marginX + 45, y);
  doc.text(data.nomorPendaftaran, marginX + 49, y);
  y += 6.5;

  y = writeRichText(
    doc,
    [
      { text: "DITERIMA", bold: true },
      {
        text: ` Sebagai Santri Pesantren Ulul Albaab Sukabumi Tahun Pelajaran 2027/2028 di ${data.kelasDiterima}`,
      },
    ],
    marginX,
    y,
    width
  );

  y = paragraph(
    doc,
    "Selanjutnya, diharapkan kepada orangtua/wali untuk melakukan pembayaran UANG PANGKAL.",
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    "Demikian informasi ini kami sampaikan, semoga Allah swt. memudahkan kita dalam kebaikan, atas perhatiannya kami ucapkan terima kasih dan jazakumullohu khoiron katsiron.",
    marginX,
    y,
    width
  );
  y += 2;

  doc.setFont("helvetica", "italic");
  doc.text("Wassalamu'alaikum Warahmatullahi Wabarakatuh.", pageWidth / 2, y, { align: "center" });
  y += 12;

  // 7. Tanda tangan (kanan)
  const sigX = pageWidth - 75;
  doc.setFont("helvetica", "normal");
  doc.text(`Sukabumi, ${tanggalIndo(data.tanggalTerbit)}`, sigX, y);
  y += 6;
  doc.text("Ketua Panitia,", sigX, y);

  const ttd = CFG.signatureImage ? await loadImage(CFG.signatureImage) : null;
  const stempel = CFG.stampImage ? await loadImage(CFG.stampImage) : null;
  if (stempel) doc.addImage(stempel, "PNG", sigX - 12, y + 2, 30, 30);
  if (ttd) doc.addImage(ttd, "PNG", sigX + 2, y + 2, 30, 30);

  y += 34;
  doc.setFont("helvetica", "bold");
  doc.text(CFG.ketuaPanitia, sigX, y);

  // 8. NB ketentuan uang pangkal (kiri bawah)
  let ny = Math.max(y - 20, 236);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(CFG.nb.judul, marginX, ny);
  ny += 4.5;
  doc.text(CFG.nb.subJudul, marginX, ny);
  ny += 4.5;
  doc.setFont("helvetica", "normal");
  for (const poin of CFG.nb.poin) {
    const lines = doc.splitTextToSize(poin, width);
    doc.text(lines, marginX, ny);
    ny += lines.length * 4 + 0.5;
  }

  const filename = `Surat Pengumuman Hasil PSB 2027-2028 ${data.namaLengkap}.pdf`;
  return { buffer: Buffer.from(doc.output("arraybuffer")), filename };
}

/**
 * Helper transaksi untuk menyinkronkan data pendaftar & nilai ujian saat kelulusan ditetapkan:
 * - Menangani kasus khusus calon santri yang mendaftar jalur SMA (SMA27...) tetapi dinyatakan lulus di I'dad Lughowi (IL).
 * - Menjaga konsistensi pendaftar.jenjang = 'IL', catatan_pindahan, dan catatan_kelulusan pada nilai_ujian.
 */
export async function syncPendaftarKelulusanTransaction(
  tx: any,
  pendaftarId: string,
  kelasDiterima: string
) {
  const p = await tx.pendaftar.findUnique({
    where: { id: pendaftarId },
    select: { id: true, jenjang: true, nomor_pendaftaran: true, catatan_pindahan: true },
  });
  if (!p) return;

  const isDiterimaIL = (kelasDiterima || "").toUpperCase().includes("IL");
  const isDaftarSMA =
    (p.jenjang || "").toUpperCase().includes("SMA") ||
    (p.jenjang || "").toUpperCase().includes("MA") ||
    p.nomor_pendaftaran.toUpperCase().startsWith("SMA");

  const updateData: any = { status_pendaftaran: "accepted" };

  if (isDiterimaIL && isDaftarSMA) {
    updateData.jenjang = "IL";
    if (!p.catatan_pindahan) {
      updateData.catatan_pindahan =
        "Diterima di I'dad Lughowi (Pengalihan dari pendaftaran awal SMA/MA)";
    }
  }

  await tx.pendaftar.update({
    where: { id: pendaftarId },
    data: updateData,
  });

  if (isDiterimaIL && isDaftarSMA) {
    const nu = await tx.nilaiUjian.findFirst({
      where: { pendaftar_id: pendaftarId },
      select: { id: true },
    });
    const catatanIL =
      "DITERIMA DI I'DAD LUGHOWI (IL) - Rekomendasi matrikulasi persiapan Bahasa Arab intensif 1 tahun sebelum menuju jenjang Aliyah.";
    if (nu) {
      await tx.nilaiUjian.update({
        where: { id: nu.id },
        data: {
          catatan_kelulusan: catatanIL,
          catatan_umum: "Diterima di Program I'dad Lughowi (IL).",
          status_kelulusan: "Diterima",
        },
      });
    }
  }
}
