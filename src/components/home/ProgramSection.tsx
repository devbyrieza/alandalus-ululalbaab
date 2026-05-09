"use client";

import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  ArrowRight,
  School,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type ProgramVariant = "blue" | "yellow" | "teal";

interface ProgramItem {
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  quotaLabel: string | null;
  icon: LucideIcon;
  variant: ProgramVariant;
}

const PROGRAMS: ProgramItem[] = [
  {
    title: "Madrasah Tsanawiyah (MTs)",
    subtitle: "Tingkat Menengah · Setara SMP",
    desc: "Memadukan tahfizh Al-Qur'an, kurikulum pendidikan nasional, kurikulum khas Al Andalus berbasis Kitab Turots, dan entrepreneurship. Bahasa pengantar Bahasa Arab.",
    features: [
      "Target Hafalan Al-Qur'an minimal 12 Juz",
      "Kitab Turots & Ilmu Syar'i",
      "Bahasa Arab Aktif sebagai Pengantar",
      "Kurikulum Nasional (Diknas)",
      "Islamic Entrepreneurship",
    ],
    quotaLabel: "Putra 32 · Putri 30",
    icon: School,
    variant: "blue",
  },
  {
    title: "I'dad Lughowi (IL)",
    subtitle: "Persiapan + Menengah Atas · Total 4 Tahun",
    desc: "Untuk santri yang belum lancar berbahasa Arab. Tahun pertama: persiapan Bahasa Arab intensif. Dilanjutkan 3 tahun SMA berbasis pesantren. Total durasi pendidikan: 4 tahun.",
    features: [
      "1 Tahun Persiapan Bahasa Arab Intensif",
      "3 Tahun SMA Pesantren (Setelah IL)",
      "Total: 4 Tahun Pendidikan",
      "Persiapan PTN & Universitas Timur Tengah",
      "Target Hafalan Al-Qur'an minimal 16 Juz",
    ],
    quotaLabel: "Putra 32 · Putri 30",
    icon: BookOpen,
    variant: "yellow",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

function getTokens(variant: ProgramVariant) {
  switch (variant) {
    case "blue":
      return {
        accentBar:
          "bg-gradient-to-r from-brand-blue-700 via-brand-blue-500 to-brand-blue-300",
        corner: "bg-brand-blue-50",
        icon: "bg-brand-blue-600 text-white ring-1 ring-brand-blue-200",
        subtitleText: "text-brand-blue-500",
        dividerLine: "bg-brand-blue-200",
        checkBg: "bg-brand-blue-50 border-brand-blue-200",
        checkHover:
          "group-hover/item:bg-brand-blue-600 group-hover/item:border-brand-blue-600",
        checkIcon: "text-brand-blue-600 group-hover/item:text-white",
        ctaBtn:
          "bg-white border-brand-blue-200 text-brand-blue-800 hover:bg-brand-blue-700 hover:border-brand-blue-700 hover:text-white shadow-sm hover:shadow-md",
      };
    case "yellow":
      return {
        accentBar:
          "bg-gradient-to-r from-brand-yellow-500 via-brand-yellow-400 to-brand-yellow-200",
        corner: "bg-brand-yellow-50",
        icon: "bg-brand-yellow-400 text-brand-blue-950 ring-1 ring-brand-yellow-200",
        subtitleText: "text-brand-yellow-600",
        dividerLine: "bg-brand-yellow-300",
        checkBg: "bg-brand-yellow-50 border-brand-yellow-200",
        checkHover:
          "group-hover/item:bg-brand-yellow-500 group-hover/item:border-brand-yellow-500",
        checkIcon: "text-brand-yellow-600 group-hover/item:text-white",
        ctaBtn:
          "bg-white border-brand-yellow-300 text-brand-blue-800 hover:bg-brand-yellow-400 hover:border-brand-yellow-400 hover:text-brand-blue-950 shadow-sm hover:shadow-md",
      };
    case "teal":
      return {
        accentBar:
          "bg-gradient-to-r from-brand-blue-400 via-brand-yellow-400 to-brand-blue-300",
        corner: "bg-brand-blue-50",
        icon: "bg-brand-blue-800 text-brand-yellow-300 ring-1 ring-brand-blue-200",
        subtitleText: "text-brand-blue-400",
        dividerLine: "bg-brand-blue-200",
        checkBg: "bg-brand-blue-50 border-brand-blue-200",
        checkHover:
          "group-hover/item:bg-brand-blue-800 group-hover/item:border-brand-blue-800",
        checkIcon: "text-brand-blue-600 group-hover/item:text-brand-yellow-300",
        ctaBtn:
          "bg-white border-brand-blue-200 text-brand-blue-800 hover:bg-brand-blue-800 hover:border-brand-blue-800 hover:text-white shadow-sm hover:shadow-md",
      };
  }
}

export default function ProgramSection() {
  return (
    <section
      id="program"
      className="section-alt relative overflow-hidden border-y border-brand-blue-100"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-blue-50/70 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-brand-yellow-100/40 blur-[80px]" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-yellow-200 text-brand-blue-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] shadow-xs mb-5"
          >
            <GraduationCap className="w-3 h-3" strokeWidth={2} />
            <span>Jenjang Pendidikan</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            className="section-title mb-4"
          >
            Program Studi{" "}
            <span className="text-gradient-blue">Unggulan</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.14 }}
            className="section-subtitle mx-auto"
          >
            Pendidikan berkualitas tinggi yang menggabungkan keunggulan
            spiritual, intelektual, dan karakter dalam satu sistem terpadu.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-5 lg:gap-8 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          {PROGRAMS.map((program: ProgramItem, idx: number) => {
            const tokens = getTokens(program.variant);
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.3, ease: EASE },
                }}
                className="group h-full"
              >
                <div className="relative h-full flex flex-col bg-white rounded-[1.5rem] border border-brand-blue-100 overflow-hidden shadow-premium-sm group-hover:shadow-premium-md group-hover:border-brand-blue-200 transition-all duration-400">
                  <div
                    className={`absolute top-0 left-0 right-0 h-[3px] ${tokens.accentBar}`}
                  />
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] opacity-50 ${tokens.corner}`}
                  />

                  <div className="relative z-10 flex flex-col h-full p-8 lg:p-9">
                    <div className="flex items-start justify-between mb-8">
                      <div
                        className={`w-12 h-12 rounded-[14px] flex items-center justify-center shadow-xs transition-transform duration-400 group-hover:scale-105 group-hover:-rotate-3 ${tokens.icon}`}
                      >
                        <program.icon className="w-5 h-5" strokeWidth={2} />
                      </div>

                      {program.quotaLabel ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[0.6rem] font-bold text-ink-400 uppercase tracking-[0.15em]">
                            Kapasitas
                          </span>
                          <div className="flex items-center gap-1.5 bg-ink-950 text-white px-2.5 py-1 rounded-[8px] shadow-sm">
                            <Users className="w-3 h-3 opacity-70" />
                            <span className="text-[0.65rem] font-black">
                              {program.quotaLabel}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[0.6rem] font-bold text-ink-400 uppercase tracking-[0.15em]">
                            Syarat Khusus
                          </span>
                          <div className="flex items-center gap-1.5 bg-brand-yellow-400 text-brand-blue-950 px-2.5 py-1 rounded-[8px] shadow-sm">
                            <span className="text-[0.65rem] font-black">
                              Seleksi
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-7">
                      <h3 className="font-display font-black text-[1.35rem] text-ink-950 tracking-tight leading-[1.1] mb-2 group-hover:text-brand-blue-800 transition-colors duration-300">
                        {program.title}
                      </h3>
                      <p
                        className={`text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-4 ${tokens.subtitleText}`}
                      >
                        {program.subtitle}
                      </p>
                      <p className="text-[0.875rem] text-ink-600 leading-relaxed font-[450]">
                        {program.desc}
                      </p>
                    </div>

                    <div className="mb-8 grow">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className={`h-px w-6 ${tokens.dividerLine}`} />
                        <span className="text-[0.6rem] font-black text-ink-400 uppercase tracking-[0.15em]">
                          Target & Kurikulum
                        </span>
                      </div>

                      <motion.ul
                        className="grid grid-cols-1 gap-y-3"
                        variants={containerVariants}
                      >
                        {program.features.map(
                          (feature: string, fIdx: number) => (
                            <motion.li
                              key={fIdx}
                              variants={featureVariants}
                              className="flex items-start gap-3 group/item"
                            >
                              <div
                                className={`mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${tokens.checkBg} ${tokens.checkHover}`}
                              >
                                <CheckCircle
                                  className={`w-2.5 h-2.5 transition-colors duration-300 ${tokens.checkIcon}`}
                                  strokeWidth={3}
                                />
                              </div>
                              <span className="text-[0.8125rem] font-semibold text-ink-700 leading-snug group-hover/item:text-ink-950 transition-colors duration-300">
                                {feature}
                              </span>
                            </motion.li>
                          ),
                        )}
                      </motion.ul>
                    </div>

                    <Link href="/program" className="block mt-auto">
                      <button
                        className={`w-full py-3 px-6 rounded-[12px] font-bold text-[0.8125rem] flex items-center justify-center gap-2 border transition-all duration-300 group/btn ${tokens.ctaBtn}`}
                      >
                        Jelajahi Kurikulum Selengkapnya
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </button>
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
