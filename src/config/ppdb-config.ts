// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   PPDB CONFIGURATION - AL ANDALUS ULUL ALBAAB
//   Tahun Ajaran 2027/2028 (PSB / PPDB)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PPDB_CONFIG = {
  // 🏫 INFO PESANTREN
  pesantren: {
    nama: "Pesantren Islam Al-Andalus Ulul Albaab",
    singkatan: "Al Andalus Ulul Albaab",
    legal: "Pesantren Ulul Albaab Sukabumi Managed by Al Andalus IIBS",
    alamat:
      "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    telepon: "+62 812-8530-0800",
    email: "alandalusululalbaab2@gmail.com",
    emailPpdb: "alandalusululalbaab2@gmail.com",
    website: "https://spmb.pesantren-ululalbaab.com",
  },

  // 🎨 BRAND COLORS
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
    },
    accent: {
      gold: "#fbbf24",
      teal: "#14b8a6",
      red: "#ef4444",
    },
  },

  // 📱 PROGRAM PENDIDIKAN (KHUSUS PUTRA)
  programs: [
    {
      id: "mts",
      name: "MTs",
      fullName: "Madrasah Tsanawiyah (MTs)",
      description:
        "Program pendidikan formal setara SMP memadukan kurikulum kepesantrenan khas Andalus, Tahfidz Al-Qur'an, dan kurikulum nasional.",
      image: "/images/ruang-kelas.jpg",
      theme: "blue",
      kuotaPutra: 48,
    },
    {
      id: "il",
      name: "I'dad Lughowi",
      fullName: "Program I'dad Lughowi (Persiapan Bahasa Arab)",
      description:
        "Program intensif penguasaan Bahasa Arab aktif, Tahfidz Al-Qur'an, dan ilmu syar'i persiapan jenjang SMA.",
      image: "/images/kelas-dari-dalam.webp",
      theme: "gold",
      kuotaPutra: 24,
    },
    {
      id: "sma",
      name: "SMA",
      fullName: "Sekolah Menengah Atas (SMA) Langsung",
      description:
        "Program SMA 3 tahun langsung tanpa IL bagi santri lulusan SMP/MTs yang lancar berbahasa Arab aktif dan memiliki hafalan Al-Qur'an mutqin.",
      image: "/images/ruang-kelas.jpg",
      theme: "blue",
      kuotaPutra: 24,
    },
  ],

  // 💰 BIAYA PENDIDIKAN & PENDAFTARAN
  pricing: [
    {
      label: "Biaya Pendaftaran",
      amount: "Rp 250.000",
      note: "Biaya pendaftaran dan tes seleksi (non-refundable)",
    },
    {
      label: "Uang Pangkal",
      amount: "Rp 9.900.000",
      note: "Dapat dicicil 3x: cicilan 1 sebesar 50% sepekan setelah pengumuman kelulusan, sisanya 2x s/d Mei 2027",
    },
    {
      label: "SPP Bulanan (All-In)",
      amount: "Rp 1.100.000",
      note: "Per bulan (Total 1 tahun Rp 13.200.000 All-In mencakup makan, asrama, & kegiatan)",
    },
  ],

  // 🏦 REKENING BANK RESMI
  bank: {
    namaBank: "Bank Syariah Indonesia (BSI)",
    nomorRekening: "7253701263",
    atasNama: "Al Andalus Ulul Albaab 1",
    kodeBank: "451",
  },

  // 📅 JADWAL PPSB 2027/2028
  schedule: {
    tahunAjaran: "2027/2028",
    pembukaan: "16 Oktober 2026",
    penutupan: "20 Desember 2026",
    jadwalTes: "16 Oktober – 20 Desember 2026",
  },

  // 👥 DEWAN PEMBINA, PENGURUS & PENGASUH
  dewanPembina: [
    "Ust. Dr. Muhammad Arifin Badri, Lc., MA",
    "Ust. Dr. Nurdin Apud Sarbini, Lc., M.Pd",
    "K.H. Dudun Abdul Ghofar",
    "H. Tarmen Tascha, SE",
    "Ust. Wahyu Iskandar, M.Pd",
    "Ust. Wahab Rajasam, M.Pd",
  ],

  // 🎯 VISI & MISI
  visi: "Kaderisasi Ummat Hanif, Kontributif, dan Adaptif",
  misi: [
    "Melaksanakan pendidikan aqidah yang shohihah dan ibadah yang sesuai sunnah.",
    "Menumbuhkembangkan soft skill berupa fitrah potensi dan growth mindset.",
    "Mengembangkan hard skill berupa jiwa kewirausahaan dan life skills.",
    "Membentuk generasi yang berjiwa dakwah dan mau'idzoh hasanah.",
  ],

  // 📋 FASILITAS PESANTREN (12 ITEM)
  fasilitas: [
    "Masjid",
    "Gedung Sekolah Terpadu",
    "Asrama Representatif",
    "Fasilitas Olahraga",
    "Lab Komputer",
    "Mini Market",
    "Ruang Makan",
    "Perpustakaan",
    "Kantin",
    "Aula",
    "Mesin Air Bio dan RO",
    "UKS (Unit Kesehatan Santri)",
  ],

  // ⚽ EKSTRAKURIKULER (15 ITEM)
  ekstrakurikuler: [
    "Futsal",
    "Basket",
    "Voli",
    "Karate",
    "Badminton",
    "Panahan",
    "Pertanian",
    "Perikanan",
    "Peternakan",
    "Komputer",
    "Desain Grafis",
    "Konten Kreator",
    "Kaligrafi",
    "Arabic Club",
    "Pramuka",
  ],

  // 6 KEUNGGULAN PENGASUHAN
  keunggulanPengasuhan: [
    "Berupaya maksimal menghidupkan fitrah santri diiringi adab Islami dalam interaksi.",
    "Pengawasan di setiap aktifitas santri.",
    "Musyrif (guru asrama) tinggal di kamar santri.",
    "Bimbingan dengan pendekatan penyadaran dan pendewasaan pada setiap kesalahan santri, bukan sekedar hukuman.",
    "Pengasuhan dilakukan sepenuhnya oleh ustadz.",
    "Tidak memberikan kewenangan pada santri senior untuk menghukum santri lain.",
  ],

  // 📋 PERSYARATAN BERKAS
  requirements: [
    "Fotocopy Akta Kelahiran (1 lembar)",
    "Fotocopy Kartu Keluarga (1 lembar)",
    "Fotocopy Rapor SD/MI sederajat (bagi MTs) atau Ijazah SMP/MTs (bagi IL)",
    "Pas Foto 3x4 (4 lembar) bersongkok hitam latar belakang biru",
    "Surat Keterangan Sehat dari Dokter/Puskesmas",
    "Surat kesediaan mematuhi tata tertib pesantren dan bebas dari perilaku menyimpang",
  ],

  // 🔗 KONTAK & SOSMED
  contact: {
    whatsapp: "+6281285300800",
    phone: "0812-8530-0800",
    instagram: "@alandalusululalbaab",
    facebook: "Pesantren Al Andalus Ulul Albaab",
    youtube: "Al Andalus Ulul Albaab",
  },

  tahunAjaran: "2027/2028",
  angkatan: "Angkatan ke-5 (2027/2028)",

  // ⚙️ SETTING TEKNIS
  technical: {
    appName: "SPMB Al Andalus Ulul Albaab",
    appDescription: "Sistem Penerimaan Murid Baru (SPMB) 2027/2028",
    version: "2.0.0",
    author: "Rieza Eka Tomara",
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getPesantrenInfo = () => PPDB_CONFIG.pesantren;
export const getPrograms = () => PPDB_CONFIG.programs;
export const getPricing = () => PPDB_CONFIG.pricing;
export const getRequirements = () => PPDB_CONFIG.requirements;
export const getContact = () => PPDB_CONFIG.contact;
export const getColors = () => PPDB_CONFIG.colors;
export const getBank = () => PPDB_CONFIG.bank;
export const getSchedule = () => PPDB_CONFIG.schedule;
export const getDewanPembina = () => PPDB_CONFIG.dewanPembina;

export const generateCSSVariables = () => {
  const { colors } = PPDB_CONFIG;
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  };
};

