"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Images, ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const GALLERY_CATEGORIES = [
  {
    title: "Fasilitas & Kompleks Pesantren",
    desc: "Sarana belajar, ibadah, dan tempat tinggal yang representatif, bersih, dan modern.",
    items: [
      { src: "/images/drone-campus.jpg", label: "Panorama Udara Kampus Pesantren Ulul Albaab" },
      { src: "/images/masjid-utama.jpg", label: "Masjid Jami' Ulul Albaab" },
      { src: "/images/masjid-interior.jpg", label: "Ruang Utama Sholat & Ibadah" },
      { src: "/images/gedung-asrama.jpg", label: "Kompleks Gedung Asrama Santri" },
      { src: "/images/ruang-kelas.jpg", label: "Ruang Kelas Pembelajaran Modern" },
      { src: "/images/ruang-kelas-2.jpg", label: "Suasana Belajar yang Nyaman & Kondusif" },
      { src: "/images/lab-komputer.jpg", label: "Laboratorium Komputer & Teknologi" },
      { src: "/images/lab-ipa.jpg", label: "Laboratorium Praktikum Sains & IPA" },
      { src: "/images/perpustakaan.jpg", label: "Perpustakaan & Sumber Belajar Santri" },
      { src: "/images/kantor-guru.jpg", label: "Ruang Kantor Asatidz & Guru" },
      { src: "/images/ruang-uks.jpg", label: "Ruang UKS & Pelayanan Kesehatan Santri" },
      { src: "/images/ruang-bk.jpg", label: "Ruang Bimbingan Konseling (BK)" },
      { src: "/images/ruang-osis.jpg", label: "Ruang OSIS & Gugus Depan Pramuka" },
      { src: "/images/toilet-putra.jpg", label: "Fasilitas Sanitasi & Toilet Putra Bersih" },
      { src: "/images/toilet-putri.jpg", label: "Fasilitas Sanitasi & Toilet Putri Bersih" },
    ]
  },
  {
    title: "Sarana Olahraga",
    desc: "Fasilitas olahraga lengkap untuk menjaga kebugaran, kesehatan fisik, dan sportivitas santri.",
    items: [
      { src: "/images/lapangan-futsal.jpg", label: "Lapangan Futsal Pesantren" },
      { src: "/images/lapangan-badminton.jpg", label: "Lapangan Badminton Santri" },
      { src: "/images/lapangan-voli.jpg", label: "Lapangan Voli Santri" },
    ]
  },
  {
    title: "Kegiatan Santri & Prestasi",
    desc: "Dokumentasi keseharian, halaqoh Al-Qur'an, pembinaan karakter, dan capaian prestasi santri.",
    items: [
      { src: "/images/prestasi-santri-1.jpg", label: "Profil Prestasi & Karakter Unggul Santri" },
      { src: "/images/prestasi-santri-2.jpg", label: "Halaqoh Tahfidz & Wisuda Prestasi" },
      { src: "/images/kegiatan-santri-1.jpg", label: "Keseharian & Disiplin Belajar Santri" },
      { src: "/images/kegiatan-santri-2.jpg", label: "Kegiatan Ekstrakurikuler & Pembinaan Bakat" },
      { src: "/images/kegiatan-santri-3.jpg", label: "Pembelajaran Luar Kelas & Lapangan" },
      { src: "/images/kegiatan-santri-4.jpg", label: "Kebersamaan & Ukhuwah Islamiyah" },
      { src: "/images/santri-aktivitas-1.jpg", label: "Aktivitas Santri Jenjang MTs" },
      { src: "/images/santri-aktivitas-2.jpg", label: "Aktivitas Santri Jenjang I'dad & SMA" },
    ]
  },
];

export default function GaleriPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi Pesantren</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-slate-900"
          >
            Galeri Foto <br />
            <span className="text-primary-700">Pesantren Ulul Albaab</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Jelajahi suasana kampus, fasilitas representatif, serta ragam aktivitas belajar dan pembinaan santri di Pesantren Islam Internasional Al-Andalus Ulul Albaab.
          </motion.p>
        </Container>
      </section>

      {/* Gallery Sections */}
      {GALLERY_CATEGORIES.map((category, catIdx) => (
        <section
          key={catIdx}
          className={`py-14 md:py-20 ${catIdx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
        >
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 border border-primary-100 shadow-sm">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {category.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{category.desc}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item, itemIdx) => (
                <motion.div
                  key={itemIdx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (itemIdx % 3) * 0.1 }}
                  className="group rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-white grow flex items-center justify-between gap-2 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-primary-700 transition-colors">
                      {item.label}
                    </p>
                    <Sparkles className="w-4 h-4 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Ingin Melihat Kampus Secara Langsung?
          </h2>
          <p className="text-primary-200/80 max-w-xl mx-auto mb-8 text-base md:text-lg">
            Kami menyambut kunjungan silaturahmi calon santri dan orang tua untuk melihat fasilitas dan lingkungan pesantren.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fasilitas"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5"
            >
              Lihat Detail Fasilitas <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Daftar PPDB Sekarang
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
