"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
    Users,
    Target,
    Award,
    BookOpen,
    Compass,
    Sparkles,
    CheckCircle2,
    Send,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function TentangPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* 1. Hero Section - Professional Airy Design */}
            <section className="section-std pb-0! relative overflow-hidden">
                {/* Sophisticated Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow-100/60 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

                <Container className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mengenal Ulul Albaab</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 md:mb-10 tracking-tight leading-[0.95] md:leading-[0.9] text-ink-950"
                    >
                        Bimbingan & <br />
                        <span className="text-gradient-blue pb-2 block sm:inline">Pengawasan Melekat</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12 px-4"
                    >
                        Bukan sekadar tempat belajar agama, tetapi sistem pembentukan karakter berbasis Lingkungan, Kebiasaan, Komunitas, dan Spiritualitas — untuk mencetak generasi yang memiliki pribadi Hanif, Kontributif, dan Adaptif.
                    </motion.p>
                </Container>
            </section>

            {/* 2. Welcome Banner - Refined Section */}
            <section className="py-12 md:py-20 lg:py-24 bg-white overflow-hidden border-t border-brand-blue-100/50">
                <Container>
                    <div className="mb-10 lg:mb-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 text-brand-blue-700 mb-4"
                        >
                            <div className="w-8 h-0.5 bg-brand-blue-600/30 rounded-full" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-brand-blue-700">Ahlan Wa Sahlan</span>
                            <div className="w-8 h-0.5 bg-brand-blue-600/30 rounded-full" />
                        </motion.div>
                        <h2 className="section-title text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-0">
                            Masa Depan Qur'ani <br className="hidden md:block" />
                            Dimulai dari <span className="text-brand-blue-700 underline decoration-brand-blue-500/30 underline-offset-4 md:underline-offset-8">Sini</span>
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative aspect-video md:aspect-21/9 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg border border-brand-blue-100 group"
                    >
                        <Image
                            src="/images/welcome-selamat-datang.webp"
                            alt="Selamat Datang di Al-Andalus Ulul Albaab"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-brand-blue-950/40 via-transparent to-transparent" />
                    </motion.div>
                </Container>
            </section>

            {/* 3. History & Profile - Enhanced Layout */}
            <section className="section-alt border-y border-brand-blue-100">
                <Container>
                    <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
                        {/* Image Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative order-2 lg:order-1"
                        >
                            <div className="aspect-4/5 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-xl relative z-10 bg-white p-3 border border-brand-blue-100">
                                <div className="relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                                    <Image
                                        src="/images/tentang.webp"
                                        alt="Pesantren Al-Andalus Ulul Albaab"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-brand-blue-950/50 via-transparent to-transparent" />
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="absolute -bottom-6 right-0 sm:-bottom-10 sm:-right-6 md:-bottom-12 md:-right-10 z-20 bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg border border-brand-blue-100 max-w-[85vw] sm:max-w-[90vw] md:max-w-none"
                            >
                                <div className="flex items-center gap-4 md:gap-5">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-brand-blue-600 to-brand-blue-800 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0">
                                        <Award className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <div>
                                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-ink-950 tracking-tight leading-none mb-1">2023</p>
                                        <p className="text-brand-blue-700 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mb-1.5 md:mb-2">Transformasi Baru</p>
                                        <div className="text-[9px] md:text-[10px] font-bold text-brand-blue-900 bg-brand-blue-50 px-2.5 py-1.5 rounded-lg border border-brand-blue-100 leading-tight">
                                            Mulai Pertengahan 2023 dikelola <br className="block sm:hidden" /> sepenuhnya oleh Al-Andalus
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative Grid */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none -z-10" />
                        </motion.div>

                        {/* Content Column */}
                        <div className="space-y-8 order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="section-title text-left lg:ml-0 mb-6">
                                    Sejarah & <br />
                                    <span className="text-gradient-blue">Profil Pesantren</span>
                                </h2>
                                <div className="w-20 h-1.5 bg-brand-blue-600 rounded-full mb-8 lg:mb-10" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="space-y-4 md:space-y-6 text-base md:text-[17px] text-ink-700 font-medium leading-[1.8] text-justify"
                            >
                                <p>
                                    <span className="text-ink-950 font-black">Pesantren Ulul Albaab Sukabumi</span> berlokasi di Cicantayan, Kabupaten Sukabumi, memiliki komitmen penuh untuk berkhidmah kepada umat melalui jalur pendidikan dan dakwah yang berbasis pesantren bermanhaj Salaf.
                                </p>
                                <p>
                                    Memasuki pertengahan tahun 2023 (sekitar bulan Juni-Agustus), Pesantren Ulul Albaab mamasuki tonggak sejarah baru ketika pengelolaannya secara resmi <strong>diambil alih dan dibina langsung oleh manajemen Pesantren Islam Internasional Al-Andalus</strong>.
                                </p>
                                <p>
                                    Di bawah naungan manajemen Al-Andalus, Ulul Albaab bertransformasi mencakup seluruh aspek kelembagaan secara terintegrasi; mulai dari hierarki yayasan, standarisasi SDM pengajar, peningkatan fasilitas, hingga penyelarasan sistem kurikulum pendidikan yang lebih modern dan unggul.
                                </p>
                                <p className="font-bold text-brand-blue-800 bg-brand-blue-50/50 p-4 rounded-xl border border-brand-blue-100 italic text-center text-lg mt-6">
                                    "Mondok disini ngerasa kaya keluarga sendiri"
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6"
                            >
                                <div className="app-card bg-white p-5 md:p-6 flex flex-col items-start group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-orange-600 group-hover:scale-110 transition-transform shadow-sm">
                                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h4 className="font-black text-ink-950 text-xl md:text-2xl mb-1">150+</h4>
                                    <p className="text-[9px] md:text-[10px] font-bold text-ink-500 uppercase tracking-widest">Santri Aktif</p>
                                </div>
                                <div className="app-card bg-white p-5 md:p-6 flex flex-col items-start group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 text-teal-600 group-hover:scale-110 transition-transform shadow-sm">
                                        <Award className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <h4 className="font-black text-ink-950 text-lg md:text-xl tracking-tighter mb-1">RESMI</h4>
                                    <p className="text-[9px] md:text-[10px] font-bold text-ink-500 uppercase tracking-widest">Akreditasi BAN-PDM</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 3. Vision Mission - Modern Cards */}
            <section className="section-std relative">
                 <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-yellow-100/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
                <Container className="relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-brand-blue-700 font-bold tracking-[0.2em] uppercase text-[10px] xl:text-xs mb-3 block"
                        >
                            Landasan Dasar
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="section-title mb-6"
                        >
                            Visi & Misi
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="section-subtitle"
                        >
                            Komitmen berkelanjutan kami dalam menjalankan misi pendidikan Islam yang unggul dan integratif.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                        {/* Visi */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="app-card bg-white p-8 md:p-10 flex flex-col group h-full hover:-translate-y-1 transition-transform duration-500 border border-brand-blue-100 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-brand-yellow-50 rounded-2xl flex items-center justify-center mb-6 text-brand-yellow-600 shadow-sm">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-ink-950 mb-5">Visi Kami</h3>
                            <p className="text-lg md:text-xl font-black text-brand-blue-900 italic leading-[1.5] md:leading-[1.4] flex-1">
                                "Kaderisasi Ummat yang Rabbani, Cendekia, Mandiri"
                            </p>
                        </motion.div>

                        {/* Misi */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2 lg:col-span-1 app-card bg-linear-to-br from-brand-blue-50 to-white p-8 md:p-10 flex flex-col group h-full hover:-translate-y-1 transition-transform duration-500 border border-brand-blue-100 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-brand-blue-600 shadow-sm border border-brand-blue-100">
                                <Compass className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-ink-950 mb-6">Misi Utama</h3>
                            <ul className="space-y-4 flex-1">
                                {[
                                    "Menyelenggarakan pendidikan Berbasis TICE (Tahfidz, Islamic Curriculum, dan Entrepreneurship)",
                                    "Mencetak Hamalatul Quran dengan bekal ilmu syar'i yang mumpuni",
                                    "Menanamkan Jiwa Entrepreneur Muslim yang berwawasan Global"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-4 items-start group/item">
                                        <div className="w-6 h-6 rounded-full bg-brand-yellow-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-brand-blue-950 font-bold text-[13px] md:text-sm tracking-tight leading-snug group-hover/item:text-brand-blue-700 transition-colors pt-0.5">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        
                        {/* Kenapa Harus Puas */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2 lg:col-span-2 app-card bg-brand-yellow-100/30 p-8 md:p-10 lg:p-12 mt-4 hover:-translate-y-1 transition-transform duration-500 group border border-brand-yellow-200/50 shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-yellow-600 shadow-sm border border-brand-yellow-100 shrink-0">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-ink-950 leading-tight">Kenapa Harus PUAS?</h3>
                                    <p className="text-brand-blue-600 font-bold text-sm tracking-widest uppercase mt-1">Keunggulan Ulul Albaab</p>
                                </div>
                            </div>

                            <ul className="grid md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">
                                {[
                                    "Pendidikan Islam berbasis Kitab Turots dengan Bahasa Pengantar Bahasa Arab",
                                    "Pembelajaran yang Aktif, Inovatif, Kreatif, dan Menyenangkan",
                                    "Guru yang Kompeten dan Ahli di Bidangnya",
                                    "Pembiasaan Ibadah Diniyah secara Sadar dan Ikhlas",
                                    "Fasilitas yang Lengkap & Memadai untuk menunjang kegiatan santri"
                                ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 items-start group/item bg-white p-5 rounded-2xl border border-brand-blue-50 shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-brand-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-ink-700 font-medium text-[13.5px] md:text-sm tracking-tight group-hover/item:text-brand-blue-800 transition-colors leading-normal">
                                        {item}
                                    </span>
                                </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Dewan Pembina Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-20 md:mt-24 max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-10">
                            <h2 className="section-title text-3xl mb-4">Dewan Pembina</h2>
                            <p className="text-ink-600 font-medium">Pengawasan kurikulum dan keilmuan langsung dibimbing oleh asatidzah yang kompeten.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5">
                            {[
                                "Ustadz Nurdin Apud Sabrini, Lc., M.Pd.",
                                "Ustadz Dr. Muhammad Arifin Badri, Lc., M.A.",
                                "Ustadz Wahab Rajasam, M.Pd.",
                                "K.H. Dudun Abdul Gofar",
                                "Bpk. Tarmen Tascha, S.E.",
                                "Ustadz Dwi Wahyu Iskandar, M.Pd."
                            ].map((nama, i) => (
                                <div key={i} className="bg-brand-blue-50 border border-brand-blue-100 px-5 py-3 rounded-full text-brand-blue-900 font-bold text-sm md:text-base hover:bg-brand-blue-600 hover:text-white transition-colors cursor-default shadow-sm text-center">
                                    {nama}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* 4. CTA Section - Direct and impactful */}
            <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white border-t border-brand-blue-100">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-brand-blue-900 bg-linear-to-br from-brand-blue-800 to-brand-blue-950 rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden text-center shadow-lg border border-brand-blue-700"
                    >
                        {/* Decorative background */}
                        <div className="hidden sm:block absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-brand-blue-50/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
 
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 text-white tracking-tight leading-[1.1]">
                                Mari Menjadi Bagian <br />
                                Keluarga <span className="text-brand-yellow-300">Ulul Albaab</span>
                            </h2>
                            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2">
                                Daftarkan putra Anda sekarang dan persiapkan masa depan gemilang bersama kami.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                                <Link href="/ppdb" className="w-full sm:w-auto">
                                    <button className="w-full px-8 py-4 sm:py-4.5 rounded-pill bg-white text-brand-blue-900 font-bold text-base md:text-lg shadow-md hover:bg-brand-yellow-100 hover:shadow-lg transition-all duration-300 min-h-[52px]">
                                        Daftar Sekarang
                                    </button>
                                </Link>
                                <Link href="/kontak" className="w-full sm:w-auto">
                                    <button className="w-full flex items-center justify-center gap-2 px-8 py-4 sm:py-4.5 rounded-pill bg-white/10 text-white font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 min-h-[52px] text-base md:text-lg">
                                        Hubungi Kami
                                        <Send className="w-4 h-4 ml-1" />
                                    </button>
                                </Link>
                            </div>

                            {/* Trust microcopy */}
                            <div className="mt-8 mb-4">
                                <span className="inline-block px-4 py-1.5 rounded-pill bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-widest">
                                    ✦ Pendaftaran Gratis • Proses Mudah • Langsung Konfirmasi
                                </span>
                            </div>

                            {/* Legalitas badges */}
                            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                                <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Terakreditasi</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                    <BookOpen className="w-4 h-4 text-yellow-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sejak 1995</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                    <Award className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Resmi Kemendikdasmen</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </main >
    );
}
