// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
//   PPDB CONFIGURATION - AL ANDALUS ULUL ALBAAB
//   Tahun Ajaran 2027/2028 (PSB / PPDB)
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

export const PPDB_CONFIG = {
  // ðŸ« INFO PESANTREN
  pesantren: {
    nama: "Pesantren Islam Internasional Al-Andalus Ulul Albaab",
    singkatan: "Al Andalus Ulul Albaab",
    legal: "Pesantren Ulul Albaab Sukabumi Managed by Al Andalus IIBS",
    alamat:
      "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    telepon: "+62 812-8530-0800",
    email: "alandalusululalbaab2@gmail.com",
    emailPpdb: "alandalusululalbaab2@gmail.com",
    website: "https://pesantren-ululalbaab.com",
  },

  // ðŸŽ¨ BRAND COLORS
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

  // ðŸ“± PROGRAM PENDIDIKAN
  programs: [
    {
      id: "mts",
      name: "MTs",
      fullName: "Madrasah Tsanawiyah (MTs)",
      description:
        "Program pendidikan formal setara SMP memadukan kurikulum kepesantrenan khas Andalus, Tahfidz 12 Juz, dan kurikulum nasional.",
      image: "/images/ruang-kelas.jpg",
      theme: "blue",
      kuotaPutra: 48,
      kuotaPutri: 24,
    },
    {
      id: "il",
      name: "I'dad Lughowi",
      fullName: "Program I'dad Lughowi (Persiapan Bahasa Arab)",
      description:
        "Program intensif penguasaan Bahasa Arab aktif, Tahfidz 16 Juz, dan ilmu syar'i persiapan jenjang Aliyah / SMA.",
      image: "/images/kelas-dari-dalam.webp",
      theme: "gold",
      kuotaPutra: 24,
      kuotaPutri: 24,
    },
  ],

  // ðŸ’° BIAYA PENDIDIKAN & PENDAFTARAN (FORMULA SEMENTARA)
  pricing: [
    {
      label: "Biaya Pendaftaran",
      amount: "Rp 250.000",
      note: "Biaya pendaftaran dan tes seleksi",
    },
    {
      label: "Uang Pangkal",
      amount: "Rp 9.900.000",
      note: "Dibayarkan saat daftar ulang (dapat dicicil)",
    },
    {
      label: "SPP / Iwatase Bulanan",
      amount: "Rp 1.200.000",
      note: "Per bulan (Pendidikan + Asrama + Makan)",
    },
  ],

  // ðŸ¦ REKENING BANK RESMI
  bank: {
    namaBank: "Bank Syariah Indonesia (BSI)",
    nomorRekening: "7253701263",
    atasNama: "Al Andalus Ulul Albaab 1",
    kodeBank: "451",
  },

  // ðŸ“… JADWAL PPSB 2027/2028
  schedule: {
    tahunAjaran: "2027/2028",
    pembukaan: "05 September 2026",
    penutupan: "30 November 2026",
    jadwalTes: "05 September â€“ 30 November 2026",
  },

  // ðŸ‘¥ DEWAN PEMBINA
  dewanPembina: [
    "Ustadz Dr. Muhammad Arifin Badri, Lc., MA",
    "Ustadz Dr. Nurdin Apud Sarbini, Lc., M.Pd",
    "H. Tarmen Tascha, SE",
    "Ustadz Wahab Rajasam, M.Pd",
    "K.H Dudun Abdul Gofar",
    "Ustadz Dwi Wahyu Iskandar",
  ],

  // ðŸŽ¯ VISI & MISI
  visi: "KADERISASI UMMAT RABBANI, CENDEKIA & MANDIRI",
  misi: [
    "Menyelenggarakan Pendidikan Berbasis TICE (Tahfidz, Islamic Curriculum, Entrepreneurship)",
    "Mencetak HAMALATUL QUR'AN dengan bekal ilmu syar'i yang mumpuni",
    "Menanamkan jiwa Entrepreneur Muslim yang berwawasan global",
  ],

  // ðŸ“‹ PERSYARATAN BERKAS
  requirements: [
    "Fotocopy Kartu Keluarga (1 lembar)",
    "Fotocopy Akta Kelahiran (1 lembar)",
    "Fotocopy Rapor (2 semester terakhir)",
    "Pas Foto 3x4 (4 lembar)",
  ],

  // ðŸ”— KONTAK & SOSMED
  contact: {
    whatsapp: "+6281285300800",
    phone: "0812-8530-0800",
    instagram: "@alandalusululalbaab",
    facebook: "Pesantren Al Andalus Ulul Albaab",
    youtube: "Al Andalus Ulul Albaab",
  },

  tahunAjaran: "2027/2028",
  angkatan: "Angkatan ke-5 (2027/2028)",

  // âš™ï¸ SETTING TEKNIS
  technical: {
    appName: "PPDB Al Andalus Ulul Albaab",
    appDescription: "Sistem Penerimaan Santri Baru (PSB) 2027/2028",
    version: "2.0.0",
    author: "Rieza Eka Tomara",
  },
};

// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
//   HELPER FUNCTIONS
// â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

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

