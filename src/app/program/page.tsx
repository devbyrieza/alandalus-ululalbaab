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
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Program Data with Refined Info
const PROGRAMS = [
  {
    id: "mts",
    name: "Madrasah Tsanawiyah",
    buttonLabel: "Daftar MTs",
    fullName: "Program Madrasah Tsanawiyah (SMP)",
    description:
      "Memadukan tahfizh Al-Qur'an, kurikulum pendidikan nasional, kurikulum khas pesantren berbasis Kitab Turots, dan entrepreneurship. Semua dengan bahasa pengantar Bahasa Arab.",
    stats: [
      { label: "Durasi", value: "3 Tahun", icon: Clock },
      { label: "Kuota Putra", value: "32", icon: Users },
      { label: "Kuota Putri", value: "30", icon: Users },
    ],
    curriculum: [
      "Target Hafalan Al-Qur'an 30 Juz",
      "Kitab Turots & Ilmu Syar'i",
      "Bahasa Arab Aktif sebagai Pengantar",
      "Kurikulum Nasional (Diknas)",
      "Islamic Entrepreneurship",
    ],
    image: "/images/mts.webp",
    theme: "blue",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "il",
    name: "I'dad Lughowi",
    buttonLabel: "Daftar IL",
    fullName: "Program I'dad Lughowi (Persiapan SMA)",
    description:
      "Program persiapan intensif Bahasa Arab selama 1 tahun bagi lulusan SMP/MTs, yang kemudian dilanjutkan ke jenjang SMA Pesantren Al Andalus selama 3 tahun. Total durasi pendidikan adalah 4 tahun.",
    stats: [
      { label: "Total Durasi", value: "4 Tahun", icon: Clock },
      { label: "Kuota Putra", value: "32", icon: Users },
      { label: "Kuota Putri", value: "30", icon: Users },
    ],
    curriculum: [
      "Tahun 1 (I'dad): Bahasa Arab Intensif Aktif & Formal",
      "Tahun 2-4 (SMA): Kajian Kitab Turots & Ilmu Syar'i",
      "Tahfizh Al-Qur'an sepanjang program",
      "Persiapan PTN & Universitas Timur Tengah",
      "Islamic Entrepreneurship",
    ],
    image: "/images/il.webp",
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
      {/* 1. Hero Section - Airy & Clean */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Jenjang Pendidikan</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-10 tracking-tight leading-[0.9] text-ink-950"
          >
            Program <br />
            <span className="text-gradient-blue">Terbaik Kita</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-ink-600 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Kurikulum terintegrasi komprehensif yang menyelaraskan standar
            Nasional dengan kekhasan Pesantren.
          </motion.p>
        </Container>
      </section>

      {/* 2. Navigation Tabs (Sticky) - Refined */}
      <div className="sticky top-[72px] z-40 bg-white/60 backdrop-blur-xl border-y border-surface-100 py-4">
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
                className={`px-8 py-3 rounded-pill font-black text-sm transition-all border shadow-sm
                                ${
                                  activeSection === program.id
                                    ? program.theme === "blue"
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : program.theme === "teal"
                                        ? "bg-teal-600 text-white border-teal-600"
                                        : "bg-amber-500 text-white border-amber-500"
                                    : "bg-white text-ink-500 border-blue-100 hover:border-blue-300 hover:text-blue-700"
                                }`}
              >
                {program.name}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* 3. Program Content Sections */}
      <div className="py-12">
        {PROGRAMS.map((program, idx) => (
          <section
            key={program.id}
            id={program.id}
            className="py-24 md:py-32 scroll-mt-32 overflow-hidden"
          >
            <Container>
              <div
                className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${idx % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Image Side */}
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative ${idx % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="aspect-4/5 rounded-[3.5rem] overflow-hidden shadow-lg relative z-10 p-3 bg-white border border-blue-100">
                    <div className="relative w-full h-full rounded-[2.8rem] overflow-hidden">
                      <Image
                        src={program.image}
                        alt={program.fullName}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 hover:scale-110 bg-surface-200 animate-pulse"
                        onLoad={(e) =>
                          e.currentTarget.classList.remove("animate-pulse")
                        }
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute bottom-10 left-10 right-10 z-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest mb-3">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Program Unggulan</span>
                        </div>
                        <h3 className="text-3 font-display font-black text-white text-4xl leading-none">
                          Pengalaman Terbaik
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Blob */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[120px] -z-10 opacity-30
                                        ${program.theme === "blue" ? "bg-blue-200" : "bg-amber-200"}
                                    `}
                  />
                </motion.div>

                {/* Content Side */}
                <div className={idx % 2 === 1 ? "lg:col-start-1" : ""}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center lg:text-left"
                  >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-ink-950 leading-[0.95] mb-8">
                      {program.fullName}
                    </h2>
                    <p className="text-xl text-ink-600 font-medium leading-relaxed mb-10 text-center lg:text-left">
                      {program.description}
                    </p>
                  </motion.div>

                  {/* Stats Grid - Modern Design */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {program.stats.map((stat, sIdx) => (
                      <div
                        key={sIdx}
                        className={`app-card bg-white p-5 rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-md transition-all text-center group`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110 border border-blue-100
                                                    ${program.theme === "blue" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-700"}
                                                `}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-ink-400 font-black uppercase tracking-widest mb-1">
                          {stat.label}
                        </p>
                        <p
                          className={`font-black text-ink-950 ${stat.value.length > 20 ? "text-sm leading-tight" : "text-lg"}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Curriculum Card - Refined */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`app-card rounded-[3rem] p-10 mb-10 border ${program.bg} border-blue-100 shadow-sm relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BookOpen className="w-32 h-32 text-blue-900" />
                    </div>

                    <h3 className="text-2xl font-black text-ink-950 mb-8 flex items-center gap-3">
                      <div
                        className={`w-3 h-10 rounded-full ${program.theme === "blue" ? "bg-blue-600" : "bg-amber-500"}`}
                      />
                      Kurikulum & Fokus
                    </h3>

                    <ul className="space-y-5 relative z-10">
                      {program.curriculum.map((item, cIdx) => (
                        <li
                          key={cIdx}
                          className="flex items-start gap-4 group/item"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm
                                                        ${program.theme === "blue" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}
                                                    `}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-ink-800 font-bold text-lg leading-tight tracking-tight group-hover/item:text-ink-950 transition-colors">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/daftar?program=${program.id}`}>
                      <button
                        className={`w-full sm:w-auto px-14 py-5 rounded-pill font-black text-white text-lg shadow-md transition-all hover:-translate-y-1
                                                ${
                                                  program.theme === "blue"
                                                    ? "bg-blue-700 hover:bg-blue-800"
                                                    : program.theme === "teal"
                                                      ? "bg-teal-600 hover:bg-teal-700"
                                                      : "bg-amber-600 hover:bg-amber-700"
                                                }
                                            `}
                      >
                        Daftarkan Sekarang
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>

      {/* Bottom CTA - Impactful */}
      <section className="py-16 md:py-24 lg:py-32 bg-surface-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-900 bg-linear-to-br from-blue-800 to-blue-950 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-16 lg:p-24 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-black mb-4 sm:mb-6 md:mb-8 text-white leading-tight">
                Mulai Perjalanan <br />{" "}
                <span className="text-amber-400">Terbaik</span> Mereka
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-50 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium px-2">
                Konsultasikan rencana pendidikan putra-putri Anda dengan tim
                kami untuk mendapatkan pilihan program yang paling tepat.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4">
                <Link href="/daftar">
                  <button className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white text-blue-900 font-black text-sm sm:text-base md:text-lg hover:bg-blue-50 shadow-md transition-all min-h-[48px] sm:min-h-[52px]">
                    Pendaftaran Online
                  </button>
                </Link>
                <Link href="/kontak">
                  <button className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px]">
                    Hubungi Admissions
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
