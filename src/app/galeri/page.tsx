"use client";
import { useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { Camera, Images, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const GALLERY_CATEGORIES = [
  {
    title: "Fasilitas Pesantren",
    items: [
      { src: "/images/masjid.webp", label: "Masjid Jami' Ulul Albaab" },
      { src: "/images/asrama.webp", label: "Kompleks Asrama Santri" },
      {
        src: "/images/gedung-utama-dan-lapangan-basket.webp",
        label: "Gedung Utama & Lapangan Basket"
      },
      { src: "/images/kelas-dari-dalam.webp", label: "Ruang Kelas Pembelajaran" },
      { src: "/images/depot-galon-gratis.webp", label: "Fasilitas Air Minum Bersih Santri" },
    ]
  },
  {
    title: "Kegiatan & Suasana Santri",
    items: [
      { src: "/images/tahfidz.webp", label: "Halaqoh Tahfidz Al-Qur'an" },
      { src: "/images/extra-karate.webp", label: "Ekstrakurikuler Karate & Bela Diri" },
      {
        src: "/images/welcome-selamat-datang.webp",
        label: "Kawasan Pesantren Ulul Albaab"
      },
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
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-10 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Dokumentasi Pesantren</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-8xl font-display font-black mb-10 tracking-tight leading-[0.9] text-ink-950"
          >
            Galeri <br />
            <span className="text-gradient-primary">Ulul Albaab</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Koleksi foto suasana, fasilitas utama, dan kegiatan santri di Pesantren Al-Andalus Ulul Albaab.
          </motion.p>
        </Container>
      </section>

      {/* Gallery Sections */}
      {GALLERY_CATEGORIES.map((category, catIdx) => (
        <section
          key={catIdx}
          className={`py-16 md:py-24 ${catIdx % 2 === 0 ? "bg-white" : "bg-surface-50/30"}`}
        >
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 border border-primary-100">
                  <Images className="w-5 h-5" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-ink-950 tracking-tight">
                  {category.title}
                </h2>
              </div>
              <div className="w-20 h-1.5 bg-secondary-400 rounded-pill" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {category.items.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-primary-100/50 shadow-md hover:shadow-lg transition-all"
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white font-bold text-sm leading-snug">
                      {img.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* CTA Bottom */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-900 to-primary-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <Container className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6 leading-tight">
            Ingin Melihat Langsung <br />
            <span className="text-secondary-300">Kampus Ulul Albaab?</span>
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10">
            Daftar sekarang secara online atau jadwalkan kunjungan langsung bersama panitia PSB.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/daftar"
              className="px-8 py-4 rounded-pill bg-white text-primary-900 font-bold hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-0.5"
            >
              Daftar Online Sekarang
            </Link>
            <Link
              href="/kontak"
              className="px-8 py-4 rounded-pill bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all"
            >
              Hubungi Panitia
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
