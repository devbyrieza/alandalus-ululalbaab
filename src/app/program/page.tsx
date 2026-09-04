"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  CheckCircle,
  Users,
  Clock,
  Calendar,
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle2,
  Trophy,
  Globe,
  ShieldCheck,
  Building2,
  Briefcase
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

// Program Data with Accurate Ulul Albaab Curriculum
const PROGRAMS = [
  {
    id: "mts",
    name: "Madrasah Tsanawiyah",
    buttonLabel: "Daftar MTs",
    fullName: "Program Madrasah Tsanawiyah (MTs)",
    badge: "Tingkat Menengah (Setara SMP)",
    description:
      "Kami menerapkan Kurikulum Terpadu yang memadukan kurikulum Kementerian Agama/Nasional dengan kurikulum khas Andalus berbasis Kitab Turots, berfokus pada penguasaan Tahfidz Al-Qur'an 12 Juz Mutqin serta penanaman adab dan jiwa Entrepreneurship Islami sejak dini.",
    stats: [
      { label: "Tahfidz", value: "Target 12 Juz Mutqin", icon: BookOpen },
      { label: "Kurikulum Khas", value: "TICE System", icon: ShieldCheck },
      { label: "Bahasa Pengantar", value: "Bahasa Arab Aktif", icon: Globe },
    ],
    curriculum: [
      "Target Hafalan 12 Juz Al-Qur'an Mutqin",
      "Pendidikan Berbasis TICE (Tahfidz, Islamic Curriculum, Entrepreneurship)",
      "Bahasa Arab & Inggris sebagai Bahasa Pengantar Yaumiyah",
      "Kajian Kitab Turots Dasar & Fiqih Ibadah",
      "Kurikulum Nasional Madrasah Tsanawiyah Lengkap",
      "Kuota: 48 Santri Putra · 24 Santriwati Putri",
    ],
    image: "/images/ruang-kelas.jpg",
    theme: "blue",
    accent: "text-primary-600",
    bg: "bg-primary-50",
  },
  {
    id: "il",
    name: "I'dad Lughowi",
    buttonLabel: "Daftar I'dad Lughowi",
    fullName: "Program I'dad Lughowi (IL)",
    badge: "Persiapan Bahasa Arab (1 Tahun)",
    description:
      "Program pendalaman dan pemantapan Bahasa Arab intensif selama 1 tahun bagi santri lulusan SMP/MTs umum sebelum melanjutkan ke jenjang Sekolah Menengah Atas (SMA) selama 3 tahun di pesantren. Program ini membekali santri agar mampu menggunakan bahasa Arab secara aktif sebagai bahasa pengantar di kelas maupun percakapan harian. Bagi calon santri yang sudah lancar berbahasa Arab aktif dan memiliki hafalan Al-Qur'an minimal 4 Juz mutqin, dapat langsung masuk jenjang SMA tanpa melalui kelas persiapan I'dad Lughowi.",
    stats: [
      { label: "Tahfidz", value: "Target 16 Juz", icon: BookOpen },
      { label: "Fokus Utama", value: "Bahasa Arab Aktif", icon: Globe },
      { label: "Masa Studi", value: "1 Th IL + 3 Th SMA", icon: Clock },
    ],
    curriculum: [
      "Pendalaman Bahasa Arab Intensif (Nahwu, Sharaf, Muhadatsah)",
      "Target Hafalan 16 Juz Al-Qur'an Mutqin",
      "Pondasi Kitab Turots Dasar & Fiqih Ibadah",
      "Pembiasaan Bahasa Arab Aktif di Kelas & Asrama",
      "Islamic Entrepreneurship & Kemandirian Santri",
      "Kuota: 24 Santri Putra · 24 Santriwati Putri",
    ],
    image: "/images/kelas-dari-dalam.webp",
    theme: "amber",
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export default function ProgramPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeSection, setActiveSection] = useState<string>("mts");

  useEffect(() => {
    const handleScroll = () => {
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      for (const program of PROGRAMS) {
        const element = document.getElementById(program.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            viewportMiddle >= offsetTop &&
            viewportMiddle < offsetTop + offsetHeight
          ) {
            setActiveSection(program.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Jenjang Pendidikan • Tahun Ajaran 2027/2028</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-tight text-slate-900"
          >
            Program Pendidikan <br />
            <span className="text-primary-700">Unggulan Kami</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Pendidikan berbasis TICE (Tahfidz, Islamic Curriculum, & Entrepreneurship) yang menyelaraskan kurikulum nasional dengan kurikulum khas Andalus.
          </motion.p>
        </Container>
      </section>

      {/* 2. Navigation Tabs (Sticky) */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md border-y border-slate-200 py-4 shadow-xs">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {PROGRAMS.map((program) => (
              <button
                key={program.id}
                onClick={() => {
                  document
                    .getElementById(program.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-sm transition-all border shadow-xs ${
                  activeSection === program.id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {program.name}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* 3. Program Sections Detail */}
      <div className="space-y-16 md:space-y-28 py-16 md:py-24">
        {PROGRAMS.map((program, idx) => (
          <section
            key={program.id}
            id={program.id}
            className="scroll-mt-36 relative overflow-hidden"
          >
            <Container>
              <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                {/* Image Side */}
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`relative ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}
                >
                  <div className="aspect-[4/3] w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-200 relative group bg-slate-900">
                    <Image
                      src={program.image}
                      alt={program.fullName}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                      <span className="inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/20">
                        {program.badge}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black">
                        {program.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>

                {/* Content Side */}
                <div className={idx % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest block mb-2">
                      {program.badge}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                      {program.fullName}
                    </h2>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8">
                      {program.description}
                    </p>
                  </motion.div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
                    {program.stats.map((stat, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-2">
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                          {stat.label}
                        </p>
                        <p className="font-bold text-slate-900 text-sm">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Curriculum Card */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-slate-200 shadow-xs">
                    <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2.5">
                      <div className="w-2 h-6 rounded-full bg-primary-600" />
                      Fokus &amp; Kurikulum Unggulan
                    </h4>

                    <ul className="space-y-3">
                      {program.curriculum.map((item, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/daftar?program=${program.id}`}>
                    <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-white text-base bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {program.buttonLabel}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Konsultasi &amp; Pendaftaran Santri Baru
          </h2>
          <p className="text-primary-200/80 max-w-xl mx-auto mb-8 text-base md:text-lg">
            Daftarkan putra-putri Anda sekarang untuk Tahun Ajaran 2027/2028 di Pesantren Islam Internasional Al-Andalus Ulul Albaab.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5"
            >
              Daftar PPDB Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Hubungi Admissions
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

