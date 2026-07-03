/**
 * Single Source of Truth for Institutional PDF Branding
 * "Locked" specifications for headers, backgrounds, and signatures.
 *
 * template: "full_image" → pakai gambar kop surat penuh sebagai background halaman
 * template: "programmatic" → render kop surat secara programatik (jsPDF elements)
 */

export const PDF_BRANDING = {
  // Template Mode
  template: "programmatic" as "full_image" | "programmatic",

  // Institution Labels
  institution: {
    name: "PESANTREN AL ANDALUS ULUL ALBAAB",
    subtitle: "Islamic Boarding School Managed by Al Andalus IIBS",
    committee: "PANITIA PENERIMAAN SANTRI BARU",
    academic_year: "2026-2027",
    address:
      "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    contact:
      "Website: /daftar | Email: alandalusululalbaab2@gmail.com",
    phones: "WhatsApp: 0812-8530-0800",
  },

  // Resource Paths
  assets: {
    logo: "/images/kop-surat.png",
    kop_full: "", // Belum tersedia — gunakan programmatic template
    stamp: "/images/stempel-pesantren.jpg",
    signature: "/images/ttd-mudir.png",
  },

  // Content Area Coordinates (berlaku ketika template = "full_image")
  content_area: {
    y_start: 52,
    y_end: 255,
    x_left: 18,
    x_right: 192,
    width: 174,
  },

  // Precise Coordinate Standards (jsPDF based) — digunakan saat template = "programmatic"
  coords: {
    header: {
      logo: { x: 18, y: 11, w: 20, h: 28 },
      vertical_bar: { x1: 44, y1: 13, x2: 44, y2: 39, width: 0.2 },
      text_x: 48,
      horizontal_sep: {
        y_thick: 45,
        y_thin: 46.5,
        thickness_thick: 1.2,
        thickness_thin: 0.3,
      },
    },
    signature: {
      stamp: { w: 35, h: 35 },
      ttd: { w: 35, h: 35 },
      margin_right: 80,
      y_offset_ttd: 5,
    },
  },

  // Official Mudir / Authority
  authority: {
    name: "M. Abdul Aziz, S.Pd.I",
    role: "Ketua Panitia",
    city: "Sukabumi",
  },
};
