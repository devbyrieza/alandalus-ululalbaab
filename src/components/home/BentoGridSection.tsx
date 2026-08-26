"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ArrowRight, BookOpen, Home, Monitor, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BentoGridSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label section-label-teal mb-4">Fasilitas Ekosistem</span>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Lingkungan Belajar Ideal</h2>
          <p className="text-ink-600 text-lg">
            Semua fasilitas didesain khusus untuk mendukung perkembangan akademik, hafalan, dan karakter santri secara maksimal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[240px]">
          
          {/* Card 1: Masjid Jami' (Span 2 cols, 2 rows) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2 row-span-2 bento-card relative group overflow-hidden"
          >
            <Image 
              src="/images/masjid-1.jpg" 
              alt="Masjid Jami' Ulul Albaab" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-amber-300 border border-white/20 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Masjid Jami' Pusat Hafalan</h3>
              <p className="text-white/85 max-w-md text-sm md:text-base leading-relaxed">
                Pusat kegiatan ibadah, sholat berjamaah, dan halaqah tahfidz Al-Qur'an dengan suasana yang tenang dan kondusif.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Lab Komputer & Multimedia (Span 2 cols, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 lg:col-span-2 row-span-1 bento-card relative bg-slate-900 p-6 flex items-center gap-6 group overflow-hidden border border-slate-800"
          >
            <div className="flex-1 z-10">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sky-400 tracking-wider uppercase text-xs">Tech-Enabled</span>
              </div>
              <h3 className="text-xl font-black text-white mb-1.5 group-hover:text-sky-300 transition-colors">
                Lab Komputer & Multimedia
              </h3>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Fasilitas modern untuk praktikum IT, coding, dan ujian berbasis CBT santri.
              </p>
            </div>
            <div className="w-32 h-32 relative rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10">
              <Image 
                src="/images/lab-komputer-1.jpg" 
                alt="Lab Komputer Ulul Albaab" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </motion.div>

          {/* Card 3: Asrama Nyaman (1 col, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 bento-card relative group overflow-hidden"
          >
            <Image 
              src="/images/asrama.jpg" 
              alt="Gedung Asrama Santri" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shadow-sm">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-1">Asrama Nyaman</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Hunian asrama representatif, bersih, dan asri diawasi 24 jam.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Sarana Olahraga Terpadu (1 col, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 row-span-1 bento-card relative group overflow-hidden"
          >
            <Image 
              src="/images/lapangan-futsal.jpg" 
              alt="Sarana Lapangan Olahraga" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20 shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-1">Sarana Olahraga</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Lapangan futsal, badminton, voli, & basket lengkap.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/fasilitas" 
            className="inline-flex items-center gap-2 text-primary-700 font-bold hover:text-primary-800 hover:underline underline-offset-4 transition-all"
          >
            Lihat Semua Fasilitas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
