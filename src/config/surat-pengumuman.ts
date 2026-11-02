/**
 * Konfigurasi Surat Pengumuman Hasil SPMB/PSB — Ulul Albaab (putra)
 * Format mengacu surat resmi: 012-<KODE>/PSB-PUAS/<ROMAWI>/<TAHUN>
 * Ubah teks di sini (bukan di generator) bila kebijakan panitia berubah.
 */
export const SURAT_PENGUMUMAN_CONFIG = {
  nomorPrefix: "012",
  nomorSuffix: "PSB-PUAS",
  hal: "Informasi Hasil Seleksi Penerimaan Santri Baru",
  tujuan: ["Kepada Yth.", "Orangtua/Wali Ananda Calon Santri", "di", "Tempat"],
  ketuaPanitia: "Tri Sunyoto, M.Pd.",
  kelasDiterimaDefault: "VII MTs Putra",
  // Aset tanda tangan (null = kosongkan ruang untuk TTD basah + stempel)
  signatureImage: null as string | null,
  stampImage: null as string | null,
  nb: {
    judul: "NB :",
    subJudul: "Ketentuan pembayaran Uang Pangkal:",
    poin: [
      "1. Besaran Uang Pangkal: Rp. 9.900.000,- (sembilan juta sembilan ratus ribu rupiah)",
      "2. Pembayaran minimal 50% dari total nilai Uang Pangkal dilakukan paling lambat 1 (satu) pekan setelah pengumuman ini.",
      "3. Sisa pembayaran Uang Pangkal bisa dilakukan dalam 2 tahap hingga sebelum bulan Mei 2027.",
      "4. Pembayaran Uang Pangkal ke: No. Rekening BSI : 7253701263 (AL ANDALUS ULUL ALBAAB 1) konfirmasi pembayaran ke Nomor 0812 2063 6945 (PUAS FINANCE)",
      "5. Uang Pangkal yang sudah di bayarkan tidak dapat dikembalikan lagi dengan alasan apapun.",
      "6. Yang tidak membayar uang pangkal hingga batas waktu yang ditentukan dan tidak melakukan konfirmasi. Maka posisinya akan digantikan Calon Santri lain",
    ],
  },
};
