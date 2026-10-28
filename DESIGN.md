# DESIGN.md — Pesantren Ulul Albaab (PPDB / SPMB)

Design system hasil Fase 1 restyle UI. Berlaku untuk seluruh perubahan lapisan
presentasi (className/Tailwind, CSS, layout, komponen visual, animasi) di repo ini.

**Keputusan yang disetujui pemilik project (2026-10-29):**
- Peran referensi: **Kombinasi** — zcode.z.ai (struktur: navbar glass, announcement
  pill, hairline), tilas.vercel.app (nuansa: hangat, editorial, flat border-driven),
  ngodingpakeai.com/pricing (pola halaman paket/biaya).
- Kedalaman: **flat + hairline** (default; bisa ditinjau ulang).
- Efek dekoratif lama (glow-blob, glow-ring, gradient-text, hover-lift besar,
  glass berat): **dihapus semua**. Glass hanya tersisa di navbar saat scroll.

**ATURAN MUTLAK (tidak dinegosiasikan oleh dokumen ini):**
warna brand, konten/teks/data/gambar/link, metadata SEO, logika bisnis, routing,
API, database, autentikasi, state, dan validasi form TIDAK berubah. Mode
terang/gelap tidak ditambah/dikurangi. Tidak ada dependency baru.

---

## 1. Identitas brand — TERKUNCI (dipakai apa adanya)

| Token | Nilai | Keterangan |
|---|---|---|
| `--primary` | `#0977E6` | Electric Royal Blue Ulul Albaab |
| `--secondary` | `#eab308` | Canary Golden Yellow |
| `--bg` | `#fafaf9` | Latar utama |
| `--text-main` | `#111827` | Teks utama (ink-950) |
| Font sans | Plus Jakarta Sans | via `next/font`, tidak diganti |
| Font Arab | Amiri | tidak diganti |
| Skala blue/amber | sesuai `@theme` globals.css | tidak diganti |

Sumber nilai: `src/app/globals.css` (`:root` TIER PLATINUM) dan
`src/config/branding.ts`.

## 2. Prinsip visual

1. **Tenang dan berwibawa** — website pesantren, bukan landing produk startup.
   Tanpa neon/glow, tanpa animasi ramai.
2. **Kedalaman dari border & layering, bukan bayangan** — kartu flat dengan
   border 1px + shadow sangat halus (gaya tilas/zcode).
3. **Satu aksen per bagian** — satu frasa berwarna/satu elemen brand per section;
   sisanya netral.
4. **Hirarki dari ukuran & weight, bukan warna** — H3 ke bawah memakai warna tinta,
   bukan warna primary.
5. **Pill untuk aksi & info** — tombol dan badge pill (konsisten keempat referensi).

## 3. Design tokens

### Radius
| Token | Nilai | Pemakaian |
|---|---|---|
| `sm` | 8px | input kecil, badge kecil |
| `md` | 10px | tombol kecil, item nav, sel tabel |
| `lg` | 12px | **kartu standar** |
| `xl` | 16px | panel besar, bento, hero card |
| `2xl` | 20px | modal, kartu hero besar |
| `full` | 9999px | tombol, badge, pill |

Perubahan dari kondisi lama: kartu turun dari 20–32px → **12–16px**; tombol tetap
pill; `--radius: 20px` global diganti skala di atas.

### Shadow (netral, tanpa warna brand)
| Token | Nilai | Pemakaian |
|---|---|---|
| `xs` | `0 1px 2px rgba(0,0,0,.05)` | kartu rest |
| `sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` | kartu hover |
| `md` | `0 4px 12px -2px rgba(0,0,0,.08)` | dropdown, popover |
| `lg` | `0 12px 28px -6px rgba(0,0,0,.12)` | modal |
| hairline | `inset 0 0.5px 0 rgba(255,255,255,.12)` | tombol/panel gelap (zcode) |

`--shadow-blue*`, `--shadow-yellow*`, dan sejenisnya (colored glow) **tidak
dipakai lagi** pada elemen baru; bertahap dihapus saat bertemu.

### Border
- Terang: `1px solid ink-200`/`surface-200`; hover kartu: border `brand-200`.
- Section gelap (blue-800→950 bila ada): `rgba(255,255,255,.1)`.

### Tipografi (font tidak berubah)
| Elemen | Weight | Tracking | Line-height | Warna |
|---|---|---|---|---|
| H1 | 800 | −0.03em | 1.05–1.1 | ink-950 (aksen 1 frasa: primary solid) |
| H2 | 700 | −0.025em | 1.15 | ink-950 |
| H3 | 700 | −0.02em | 1.25 | **ink-900** (bukan primary) |
| H4–H6 | 600 | −0.01em | 1.35 | ink-800 |
| Body | 400–450 | 0 | 1.7 | ink-600 |
| Small | 400 | 0 | 1.6 | ink-500 |
| Label kecil | 600–700 | **0.04–0.06em** | 1 | ink-500 / brand-700 |

Turun dari kondisi lama: label dari 800/0.1–0.15em → 600–700/0.04–0.06em.
`text-gradient-*` diganti warna brand solid pada `<span>`.

### Spacing
- Section: `clamp(4rem, 8vw, 6.5rem)` vertikal (turun dari maks 7rem).
- Container: `max-w-6xl px-4 sm:px-6 lg:px-8`.
- Kartu: `p-6` (24px), panel besar `p-8`; grid `gap-4 sm:gap-6`.

### Motion
- Durasi: 150ms (hover/kecil), 200ms (standar), 250ms (panel/section);
  drawer/menu boleh 300ms.
- Easing: `cubic-bezier(0,0,0.2,1)`; spring hanya drawer.
- Hover kartu = border menguat + shadow naik satu tingkat. **Tanpa
  translateY** (kecuali kartu-link boleh −1px).
- HAPUS: lift −2…−4px massal, `rotate(3deg)` ikon, shimmer, marquee, shine-hover.
- Scroll-reveal: fade + translateY 12px, sekali, 300ms, maks 1 animasi masuk per
  section.
- **WAJIB** `@media (prefers-reduced-motion: reduce)` mematikan semua
  animasi/transition; framer-motion memakai `useReducedMotion`.

## 4. Komponen dasar

- **Button**
  - Primary: pill, `bg-primary` solid (TANPA gradient), teks putih, `shadow-xs`
    + hairline inset tipis; hover: satu shade lebih gelap; active: `scale(.98)`.
  - Secondary: pill, putih, border `ink-200`; hover: `bg-primary-50`, border
    `primary-200`.
  - Ghost: pill, teks ink-600; hover `bg-surface-100`.
- **Card**: putih, border 1px `ink-200`, radius `lg`(12)/`xl`(16), `shadow-xs`;
  hover (bila interaktif): border `primary-200` + `shadow-sm`.
- **Badge / SectionLabel**: pill; 600–700; tracking 0.04–0.06em; tint `*-100` +
  teks `*-700` dari palet brand; titik indikator kecil diperbolehkan.
- **Input**: border `ink-200` 1px, radius `md`; focus: border primary + ring
  `0 0 0 3px rgba(9,119,230,.12)`.
- **Navbar** (gaya zcode): sticky h-16; transparan di puncak; setelah scroll:
    `bg-white/85 backdrop-blur(12px)` + border-b 1px `ink-100`; link `text-sm`
    ink-600 → hover ink-900, aktif ink-900 + garis bawah 2px primary (aksen
    tilas); CTA pill primary; mobile hamburger → panel 200ms.
- **Announcement pill** (gaya zcode): pill kecil ber-border di atas H1 untuk
  info penting SPMB (periode, pengumuman) — hanya pengganti gaya elemen yang
  sudah ada, tidak menambah teks baru.
- **Footer**: container sama; border-t hairline; kolom link `text-sm` ink-500
  hover ink-800; baris bawah copyright `small`.
- **Halaman paket/biaya** (bila ada): pola npai/pricing — header tengah (badge
  pill → H2 → subteks), kartu tier border 1px radius 16, tier unggulan: border
  2px primary + badge pill + tint `primary-50`, harga `text-4xl` weight 800 +
  harga lama dicoret, fitur daftar centang, CTA full-width mobile.

## 5. Do & Don't

**Do**: whitespace lega; kontras teks min AA (4.5:1); `:focus-visible` ring
terlihat; `tabular-nums` untuk angka statistik/countdown; satu animasi masuk per
section; uji di 375px / 768px / 1440px.

**Don't**: gradient berlapis; glow/neon; lift besar; uppercase + tracking lebar
berlebihan; shadow berwarna; `cursor: pointer` global; `table { display:block }`
global di mobile (ganti wrapper `overflow-x-auto` per tabel).

## 6. Mapping kelas lama → arah baru

| Kelas/efek lama | Arah baru |
|---|---|
| `.btn-primary` gradient + colored shadow + sheen | solid primary, shadow-xs, hover shade gelap |
| `.app-card`/`.card-blue` hover −3/−4px | radius 12/16, border, hover border+shadow |
| `.glow-blob-*`, `.glow-ring-*`, `.shimmer`, `.shine-hover`, marquee | dihapus dari halaman (bersihkan bertahap) |
| `.glass`/`.glass-panel-*` | hanya navbar & overlay; blur 12px, tanpa saturate |
| `.section-label` 800/0.1em | 700/0.06em |
| `.text-gradient-*`/`.gradient-text-*` | warna solid brand pada span |
| H3–H5 warna primary | ink-900/ink-800 |
| `.icon-box` hover rotate(3deg) scale | tanpa transform; hover ganti shade background |
| `.hover-lift`/`.hover-lift-sm` | deprecated |
| `* { cursor: pointer !important }` | hapus (kembalikan default browser) |
| Dua definisi `focus-visible`/`::selection` bertumpuk | satu definisi final di `@layer base` |

## 7. Dial project ini

Website publik pesantren: **VARIANCE sedang · MOTION rendah-sedang · DENSITY
sedang**. Beranda punya 21 section — jaga ritme: section tenang (About, Program,
Teachers) memakai kartu flat tilas; section energi (Stats, CTA, kegitan unggulan)
boleh sedikit lebih hidup namun tetap tanpa glow.

## 8. Rencana eksekusi (Fase 2)

1. Branch `ui/restyle-alandalus-ululalbaab` dari `main`; commit pertama:
   DESIGN.md + konsolidasi token di `globals.css` (menghapus lapisan yang
   bertentangan).
2. Commit per tahap: layout global (Navbar/Footer/Container/Section) →
   komponen bersama (Button/Card/Badge/Input) → halaman (beranda per-section,
   lalu `/ppdb`, `/daftar`, `/login`, dst.).
3. QA per tahap: `biome check`, `tsc`, `next build` lolos; screenshot
   375/768/1440 sebelum-sesudah.
4. Laporan per project lalu **berhenti menunggu persetujuan** sebelum project
   berikutnya.
