"use client";

import Link from "next/link";
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    ArrowRight,
    School
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const PROGRAMS = [
    {
        title: "Madrasah Tsanawiyah (MTs)",
        subtitle: "Tingkat Menengah (Setara SMP)",
        desc: "Memadukan tahfizh Al-Qur'an, kurikulum pendidikan nasional, kurikulum khas pesantren berbasis Kitab Turots, dan entrepreneurship. Bahasa pengantar Bahasa Arab.",
        features: [
            "Target Hafalan Al-Qur'an 30 Juz",
            "Kitab Turots & Ilmu Syar'i",
            "Bahasa Arab Aktif sebagai Pengantar",
            "Kurikulum Nasional (Diknas)",
            "Islamic Entrepreneurship"
        ],
        quotaLabel: "Kuota Putra 32 | Putri 30",
        icon: School,
        color: "brand-blue"
    },
    {
        title: "I'dad Lughowi (IL)",
        subtitle: "Persiapan + Menengah Atas — Total 4 Tahun",
        desc: "Untuk santri yang belum lancar berbahasa Arab. Tahun pertama: persiapan Bahasa Arab intensif. Dilanjutkan 3 tahun SMA berbasis pesantren. Total durasi pendidikan: 4 tahun.",
        features: [
            "1 Tahun Persiapan Bahasa Arab Intensif",
            "3 Tahun SMA Pesantren (Setelah IL)",
            "Total: 4 Tahun Pendidikan",
            "Persiapan PTN & Universitas Timur Tengah",
            "Tahfizh Al-Qur'an"
        ],
        quotaLabel: "Kuota Putra 32 | Putri 30",
        icon: BookOpen,
        color: "brand-yellow"
    },
    {
        title: "SMA",
        subtitle: "Menengah Atas — Langsung 3 Tahun",
        desc: "Untuk santri yang sudah hafal min. 5 juz mutqin dan lancar berbahasa Arab. Masuk langsung ke jenjang SMA pesantren selama 3 tahun tanpa tahun persiapan bahasa.",
        features: [
            "Syarat: Hafal 5 Juz Mutqin",
            "Syarat: Lancar Berbahasa Arab",
            "Langsung 3 Tahun (Tanpa Persiapan)",
            "Kajian Kitab Turots Mendalam",
            "Persiapan PTN & Universitas Timur Tengah"
        ],
        quotaLabel: null,
        icon: GraduationCap,
        color: "teal"
    },
];

export default function ProgramSection() {
    return (
        <section id="program" className="section-std">
            {/* Subtle Patterns */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

            <Container className="relative z-10">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-yellow-50 border border-brand-yellow-400 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Jenjang Pendidikan</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Program Studi <span className="text-gradient-maroon">Unggulan</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Kami berkomitmen memberikan pendidikan berkualitas tinggi yang menggabungkan keunggulan spiritual, intelektual, dan karakter.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {PROGRAMS.map((program, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="h-full"
                        >
                            <div className="app-card bg-white p-8 md:p-10 h-full flex flex-col group">
                                {/* Top Accents */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 ${
                                        program.color === 'brand-blue' ? 'bg-brand-blue-50 text-brand-blue-600' :
                                        program.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                                        'bg-brand-yellow-100 text-maroon-800'
                                        }`}>
                                        <program.icon className="w-7 h-7" />
                                    </div>
                                    <div className="status-pill status-pill-pending bg-brand-yellow-100 py-1.5 px-3">
                                        {program.quotaLabel ? `Kuota: ${program.quotaLabel}` : 'Segera Daftar'}
                                    </div>
                                </div>

                                <div className="grow">
                                    <h3 className="text-2xl font-bold text-ink-950 mb-2">{program.title}</h3>
                                    <p className="text-xs font-bold text-brand-blue-600/80 mb-6 tracking-wide uppercase">{program.subtitle}</p>
                                    <p className="text-[15px] text-ink-600 leading-relaxed mb-8 font-medium text-justify">
                                        {program.desc}
                                    </p>

                                    {/* Feature List */}
                                    <ul className="space-y-4 mb-10">
                                        {program.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-3">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-cream-100 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5 text-brand-blue-700" />
                                                </div>
                                                <span className="text-sm font-bold text-ink-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href="/program" onClick={() => navigateToDetail('/program', '#program')}>
                                    <button className="btn-secondary w-full py-3.5 justify-center mt-auto group-hover:bg-brand-yellow-50">
                                        Detail Program
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
