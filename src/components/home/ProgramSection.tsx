"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  type LucideIcon,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

const EASE = [0.16, 1, 0.3, 1] as const;

type ProgramVariant = "blue" | "amber" | "indigo";

interface ProgramItem {
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  quotaLabel: string;
  badge: string;
  href: string;
  icon: LucideIcon;
  variant: ProgramVariant;
}

const PROGRAMS: ProgramItem[] = [
  {
    title: "Madrasah Tsanawiyah (MTs)",
    subtitle: "Tingkat Menengah · Setara SMP",
    desc: "Memadukan tahfizh Al-Qur'an 12 Juz mutqin, kurikulum pendidikan nasional, kurikulum khas Andalus berbasis Kitab Turots, dan entrepreneurship.",
    features: [
      "Target Hafalan Al-Qur'an Minimal 12 Juz Mutqin",
      "Kajian Kitab Turots & Ilmu Syar'i",
      "Bahasa Arab Aktif sebagai Bahasa Pengantar",
      "Perpaduan Kurikulum Nasional & Khas Andalus",
      "Islamic Entrepreneurship (TICE)",
    ],
    quotaLabel: "Putra 48",
    badge: "Jalur Reguler",
    href: "/program#mts",
    icon: School,
    variant: "blue",
  },
  {
    title: "I'dad Lughowi (IL)",
    subtitle: "Persiapan Bahasa Arab · Menuju SMA",
    desc: "Program intensif persiapan Bahasa Arab dan ilmu syar'i bagi santri lulusan SMP/MTs umum menuju jenjang Aliyah berbasis pesantren.",
    features: [
      "Target Hafalan Al-Qur'an Minimal 16 Juz",
      "Pendalaman Bahasa Arab Intensif (Nahwu, Sharaf, Muhadatsah)",
      "Kajian Kitab Turots Lanjutan & Fiqih",
      "Kaderisasi Kepemimpinan & Entrepreneurship",
      "Persiapan Masuk PTN & Universitas Timur Tengah",
    ],
    quotaLabel: "Putra 24",
    badge: "Akselerasi 1 Tahun",
    href: "/program#idad",
    icon: BookOpen,
    variant: "amber",
  },
  {
    title: "SMA Langsung (Tanpa IL)",
    subtitle: "Tingkat Menengah Atas · 3 Tahun Langsung",
    desc: "Program SMA 3 tahun langsung tanpa IL bagi santri lulusan SMP/MTs yang telah lancar berbahasa Arab aktif dan memiliki hafalan Al-Qur'an mutqin.",
    features: [
      "Hafalan Al-Qur'an Mutqin & Bersanad",
      "Pendalaman Kitab Turots Tingkat Lanjut",
      "Persiapan UTBK PTN & Beasiswa Timur Tengah",
      "Bahasa Arab & Inggris Aktif Harian",
      "Kepemimpinan & Entrepreneurship Islami",
    ],
    quotaLabel: "Putra 24",
    badge: "Jalur Langsung",
    href: "/program#sma",
    icon: GraduationCap,
    variant: "indigo",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

function getTokens(variant: ProgramVariant) {
  switch (variant) {
    case "blue":
      return {
        accentBar: "bg-gradient-to-r from-blue-600 via-sky-500 to-blue-400",
        ambientGlow: "bg-blue-100/50",
        iconBox:
          "bg-gradient-to-br from-blue-600 to-sky-500 shadow-blue-500/25 ring-4 ring-blue-50",
        levelBadge: "bg-blue-50 text-blue-700 border border-blue-200/60",
        subBadge: "bg-blue-50 text-blue-700 border border-blue-200/60",
        checkContainer:
          "bg-blue-50/80 border-blue-200/80 text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:border-blue-600",
      };
    case "amber":
      return {
        accentBar: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400",
        ambientGlow: "bg-amber-100/50",
        iconBox:
          "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25 ring-4 ring-amber-50",
        levelBadge: "bg-amber-50 text-amber-800 border border-amber-200/60",
        subBadge: "bg-amber-100 text-amber-800 border border-amber-200/80",
        checkContainer:
          "bg-amber-50/80 border-amber-200/80 text-amber-600 group-hover/item:bg-amber-500 group-hover/item:text-white group-hover/item:border-amber-500",
      };
    case "indigo":
      return {
        accentBar: "bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600",
        ambientGlow: "bg-sky-100/50",
        iconBox: "bg-gradient-to-br from-sky-500 to-blue-700 shadow-sky-500/25 ring-4 ring-sky-50",
        levelBadge: "bg-sky-50 text-sky-800 border border-sky-200/60",
        subBadge: "bg-sky-50 text-sky-700 border border-sky-200/60",
        checkContainer:
          "bg-sky-50/80 border-sky-200/80 text-sky-600 group-hover/item:bg-sky-600 group-hover/item:text-white group-hover/item:border-sky-600",
      };
    default:
      return {
        accentBar: "",
        ambientGlow: "",
        iconBox: "",
        levelBadge: "",
        subBadge: "",
        checkContainer: "",
      };
  }
}

export default function ProgramSection() {
  return (
    <section className="section-alt relative overflow-hidden border-y border-slate-100 py-20 lg:py-28">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full bg-blue-100/40 blur-[110px]" />
        <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-amber-100/40 blur-[100px]" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-primary-700 text-xs font-bold uppercase tracking-wider shadow-xs mb-4"
          >
            <GraduationCap className="w-3.5 h-3.5 text-primary-600" />
            <span>Pilihan Jenjang Pendidikan • Khusus Putra</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight mb-4"
          >
            Program Studi{" "}
            <span className="bg-gradient-to-r from-primary-600 via-sky-600 to-blue-700 bg-clip-text text-transparent">
              Unggulan Khusus Putra
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.14 }}
            className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            Pendidikan terpadu memadukan hafalan Al-Qur'an mutqin, penguasaan bahasa Arab aktif,
            kajian kitab turots Sunnah, dan keunggulan akademik berkarakter mulia.
          </motion.p>
        </div>

        {/* 3 Program Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          {PROGRAMS.map((program: ProgramItem) => {
            const tokens = getTokens(program.variant);
            return (
              <motion.div key={program.title} variants={cardVariants} className="group h-full flex">
                <div className="relative w-full flex flex-col justify-between bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-7 lg:p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-500/12 hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Subtle Top Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${tokens.accentBar}`} />

                  {/* Ambient Header Glow on Hover */}
                  <div
                    className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100 ${tokens.ambientGlow}`}
                  />

                  {/* Card Content Area */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top Bar: Icon + Quota / Badge */}
                    <div className="flex items-start justify-between gap-3 mb-6">
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2 ${tokens.iconBox}`}
                      >
                        <program.icon className="w-6 h-6" strokeWidth={2} />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-semibold shadow-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span className="flex items-center gap-1 tracking-wide">
                            <Users className="w-3 h-3 text-slate-300" />
                            {program.quotaLabel}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tokens.subBadge}`}
                        >
                          {program.badge}
                        </span>
                      </div>
                    </div>

                    {/* Level Pill, Title, & Description */}
                    <div className="mb-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase mb-3 ${tokens.levelBadge}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{program.subtitle}</span>
                      </span>

                      <h3 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-snug group-hover:text-primary-600 transition-colors duration-200">
                        {program.title}
                      </h3>

                      <p className="text-slate-600 text-[13px] sm:text-sm leading-relaxed mt-2.5 font-normal">
                        {program.desc}
                      </p>
                    </div>

                    {/* Focus / Target & Kurikulum */}
                    <div className="pt-4 border-t border-slate-100 grow flex flex-col">
                      <div className="flex items-center gap-2.5 mb-3.5">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Target & Kurikulum Unggulan
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                      </div>

                      <ul className="space-y-2.5">
                        {program.features.map((feature: string) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50/80 transition-colors group/item"
                          >
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs transition-colors duration-200 ${tokens.checkContainer}`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="text-[12.5px] sm:text-[13px] font-medium text-slate-700 leading-snug group-hover/item:text-slate-950 transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <Link href={program.href} className="mt-7 block pt-4 border-t border-slate-100">
                      <div className="w-full py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-primary-600 border border-slate-200/90 hover:border-primary-600 text-slate-700 hover:text-white font-bold text-xs flex items-center justify-between group/btn shadow-xs hover:shadow-lg hover:shadow-primary-600/20 transition-all duration-300">
                        <span className="tracking-wide">Jelajahi Kurikulum Lengkap</span>
                        <div className="w-7 h-7 rounded-lg bg-white group-hover/btn:bg-white/20 flex items-center justify-center text-slate-600 group-hover/btn:text-white shadow-2xs transition-transform duration-300 group-hover/btn:translate-x-1">
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
