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
import { navigateToDetail } from "@/lib/navigation-scroll";

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        desc: "Memadukan tahfizh Al-Qur'an, kurikulum pendidikan nasional, kurikulum khas pesantren berbasis Kitab Turots, dan entrepreneurship. Bahasa pengantar Bahasa Arab.",
        features: [
            "Target Hafalan Al-Qur'an 30 Juz",
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
            "Tahfizh Al-Qur'an",
        ],
        quotaLabel: "Putra 32 · Putri 30",
        icon: BookOpen,
        variant: "yellow",
    },
    {
        title: "SMA",
        subtitle: "Menengah Atas · Langsung 3 Tahun",
        desc: "Untuk santri yang sudah hafal min. 5 juz mutqin dan lancar berbahasa Arab. Masuk langsung ke jenjang SMA pesantren selama 3 tahun tanpa tahun persiapan bahasa.",
        features: [
            "Syarat: Hafal 5 Juz Mutqin",
            "Syarat: Lancar Berbahasa Arab",
            "Langsung 3 Tahun (Tanpa Persiapan)",
            "Kajian Kitab Turots Mendalam",
            "Persiapan PTN & Universitas Timur Tengah",
        ],
        quotaLabel: null,
        icon: GraduationCap,
        variant: "teal",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "tween", duration: 0.65, ease: SPRING },
    },
};

const featureVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "tween", duration: 0.4, ease: SPRING },
    },
};

// Helper: token warna per variant
function getTokens(variant: ProgramVariant) {
    switch (variant) {
        case "blue":
            return {
                accentBar: "bg-gradient-to-r from-brand-blue-700 via-brand-blue-500 to-brand-blue-300",
                corner: "bg-brand-blue-50",
                icon: "bg-brand-blue-600 text-white",
                subtitleText: "text-brand-blue-500",
                dividerLine: "bg-brand-blue-200",
                checkBg: "bg-brand-blue-50 border-brand-blue-200",
                checkHover: "group-hover/item:bg-brand-blue-600 group-hover/item:border-brand-blue-600",
                checkIcon: "text-brand-blue-600 group-hover/item:text-white",
                ctaBtn:
                    "bg-white border-brand-blue-200 text-brand-blue-800 hover:bg-brand-blue-700 hover:border-brand-blue-700 hover:text-white",
            };
        case "yellow":
            return {
                accentBar: "bg-gradient-to-r from-brand-yellow-500 via-brand-yellow-400 to-brand-yellow-200",
                corner: "bg-brand-yellow-50",
                icon: "bg-brand-yellow-400 text-brand-blue-950",
                subtitleText: "text-brand-yellow-600",
                dividerLine: "bg-brand-yellow-300",
                checkBg: "bg-brand-yellow-50 border-brand-yellow-200",
                checkHover: "group-hover/item:bg-brand-yellow-500 group-hover/item:border-brand-yellow-500",
                checkIcon: "text-brand-yellow-600 group-hover/item:text-white",
                ctaBtn:
                    "bg-white border-brand-yellow-300 text-brand-blue-800 hover:bg-brand-yellow-400 hover:border-brand-yellow-400 hover:text-brand-blue-950",
            };
        case "teal":
            return {
                accentBar: "bg-gradient-to-r from-brand-blue-400 via-brand-yellow-400 to-brand-blue-300",
                corner: "bg-brand-blue-50",
                icon: "bg-brand-blue-800 text-brand-yellow-300",
                subtitleText: "text-brand-blue-400",
                dividerLine: "bg-brand-blue-200",
                checkBg: "bg-brand-blue-50 border-brand-blue-200",
                checkHover: "group-hover/item:bg-brand-blue-800 group-hover/item:border-brand-blue-800",
                checkIcon: "text-brand-blue-600 group-hover/item:text-brand-yellow-300",
                ctaBtn:
                    "bg-white border-brand-blue-200 text-brand-blue-800 hover:bg-brand-blue-800 hover:border-brand-blue-800 hover:text-white",
            };
    }
}

export default function ProgramSection() {
    return (
        <section id="program" className="section-std relative overflow-hidden">
            {/* Ambient blobs — biru & kuning */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-blue-50/70 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-brand-yellow-100/40 blur-3xl" />
            </div>

            <Container className="relative z-10">

                {/* ── Header ─────────────────────────────── */}
                <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "tween", duration: 0.5, ease: SPRING }}
                        className="inline-flex mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-[11px] font-bold uppercase tracking-[0.12em] shadow-xs">
                            <GraduationCap className="w-3 h-3" />
                            Jenjang Pendidikan
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "tween", duration: 0.55, ease: SPRING, delay: 0.08 }}
                        className="section-title mb-5 text-balance"
                    >
                        Program Studi{" "}
                        <span className="text-gradient-blue">Unggulan</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "tween", duration: 0.55, ease: SPRING, delay: 0.14 }}
                        className="section-subtitle"
                    >
                        Pendidikan berkualitas tinggi yang menggabungkan keunggulan
                        spiritual, intelektual, dan karakter dalam satu sistem terpadu.
                    </motion.p>
                </div>

                {/* ── Cards Grid — 3 program, baris: 2 + 1 centered ── */}
                <motion.div
                    className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
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
                                whileHover={{ y: -6, transition: { type: "tween", duration: 0.3, ease: SPRING } }}
                                className={`group h-full ${idx === 2 ? "md:col-span-2 xl:col-span-1" : ""
                                    }`}
                            >
                                <div className="relative h-full flex flex-col bg-white rounded-2xl border border-brand-blue-100 overflow-hidden shadow-premium-sm group-hover:shadow-premium-lg group-hover:border-brand-blue-200 transition-all duration-500">

                                    {/* Top accent bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${tokens.accentBar}`} />

                                    {/* Decorative corner */}
                                    <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-[3rem] opacity-40 ${tokens.corner}`} />

                                    <div className="relative z-10 flex flex-col h-full p-8 md:p-10">

                                        {/* ── Card Header ── */}
                                        <div className="flex items-start justify-between mb-8">
                                            {/* Icon */}
                                            <div
                                                className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2 ${tokens.icon}`}
                                            >
                                                <program.icon className="w-6 h-6" strokeWidth={1.75} />
                                            </div>

                                            {/* Quota badge */}
                                            {program.quotaLabel ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.15em]">
                                                        Kapasitas
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-ink-950 text-white px-3 py-1.5 rounded-lg shadow-md">
                                                        <Users className="w-3 h-3 opacity-70" />
                                                        <span className="text-xs font-black">{program.quotaLabel}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.15em]">
                                                        Syarat Khusus
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-brand-yellow-400 text-brand-blue-950 px-3 py-1.5 rounded-lg shadow-md">
                                                        <span className="text-xs font-black">Seleksi</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Title Block ── */}
                                        <div className="mb-7">
                                            <h3 className="font-display font-black text-2xl md:text-[1.75rem] text-ink-950 tracking-tight leading-tight mb-2 group-hover:text-brand-blue-800 transition-colors duration-300">
                                                {program.title}
                                            </h3>
                                            <p className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-5 ${tokens.subtitleText}`}>
                                                {program.subtitle}
                                            </p>
                                            <p className="text-[14.5px] text-ink-600 leading-relaxed font-[450] text-justify md:text-left">
                                                {program.desc}
                                            </p>
                                        </div>

                                        {/* ── Feature List ── */}
                                        <div className="mb-8 grow">
                                            <div className="flex items-center gap-2.5 mb-5">
                                                <div className={`h-px w-6 ${tokens.dividerLine}`} />
                                                <span className="text-[10px] font-black text-ink-400 uppercase tracking-[0.15em]">
                                                    Target &amp; Kurikulum
                                                </span>
                                            </div>

                                            <motion.ul
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3"
                                                variants={containerVariants}
                                            >
                                                {program.features.map((feature: string, fIdx: number) => (
                                                    <motion.li
                                                        key={fIdx}
                                                        variants={featureVariants}
                                                        className="flex items-start gap-2.5 group/item"
                                                    >
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${tokens.checkBg} ${tokens.checkHover}`}>
                                                            <CheckCircle
                                                                className={`w-3 h-3 transition-colors duration-200 ${tokens.checkIcon}`}
                                                                strokeWidth={2.5}
                                                            />
                                                        </div>
                                                        <span className="text-[13px] font-semibold text-ink-700 leading-snug group-hover/item:text-ink-950 transition-colors duration-200">
                                                            {feature}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </motion.ul>
                                        </div>

                                        {/* ── CTA Button ── */}
                                        <Link
                                            href="/program"
                                            onClick={() => navigateToDetail("/program", "#program")}
                                            className="block"
                                        >
                                            <button className={`w-full py-3.5 px-6 rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2.5 border transition-all duration-300 group/btn ${tokens.ctaBtn}`}>
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