"use client";
import { useEffect } from "react";

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
  ShieldCheck,
  Building2,
  GraduationCap,
  User,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

const BOARD_MEMBERS = [
  {
    name: "Ustadz Dr. Nurdin Apud Sarbini, Lc., M.Pd",
    image: "/images/nurdin-apud-sabrini.webp",
  },
  {
    name: "Ustadz Dr. Muhammad Arifin Badri, Lc., MA",
    image: "/images/muhammad-arifin-badri.webp",
  },
  {
    name: "Ustadz Wahab Rajasam, M.Pd",
    image: "/images/wahab-rajasam.webp",
  },
  {
    name: "K.H Dudun Abdul Gofar",
    image: "",
  },
  {
    name: "Bpk. Tarmen Tascha, S.E",
    image: "/images/tarmen-tascha.webp",
  },
  {
    name: "Ustadz Dwi Wahyu Iskandar",
    image: "",
  },
];

export default function TentangPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="section-std pb-0! relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-100/60 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mengenal Al Andalus Ulul Albaab • Managed by Al Andalus IIBS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-tight text-slate-900"
          >
            Babak Baru <br />
            <span className="text-primary-700 pb-2 block sm:inline">
              Pendidikan Qur'ani
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12 px-4"
          >
            Pesantren Islam Internasional Al-Andalus Ulul Albaab Sukabumi, cabang resmi Managed by Al Andalus IIBS.
            Memadukan intensitas Tahfidz Al-Qur'an dengan keunggulan akademik, sains, dan entrepreneurship islami untuk
            mencetak kader ummat Rabbani, Cendekia, dan Mandiri.
          </motion.p>
        </Container>
      </section>

      {/* 2. Welcome Banner - Single High-Res Drone Photo */}
      <section className="py-10 md:py-16 bg-white overflow-hidden">
        <Container>
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 text-primary-700 mb-3"
            >
              <div className="w-8 h-0.5 bg-primary-600/30 rounded-full" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary-700">
                Ahlan Wa Sahlan
              </span>
              <div className="w-8 h-0.5 bg-primary-600/30 rounded-full" />
            </motion.div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Masa Depan Qur'ani <br className="hidden md:block" />
              Dimulai dari{" "}
              <span className="text-primary-700 underline decoration-primary-500/30 underline-offset-4 md:underline-offset-8">
                Sini
              </span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video md:aspect-[21/9] max-h-[520px] w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-200 group bg-slate-950"
          >
            <Image
              src="/images/drone-campus.jpg"
              alt="Kawasan Pesantren Al-Andalus Ulul Albaab"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </motion.div>
        </Container>
      </section>

      {/* 3. History & Profile */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200/60">
        <Container>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Sejarah & Profil Pesantren
              </h2>
              <div className="w-20 h-1.5 bg-primary-600 rounded-full mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-5 text-base md:text-lg text-slate-700 leading-relaxed text-justify bg-white p-6 md:p-10 rounded-2xl border border-slate-200/80 shadow-xs"
            >
              <p>
                <span className="text-slate-900 font-bold">
                  Pesantren Islam Internasional Al-Andalus Ulul Albaab
                </span>{" "}
                hadir sebagai babak baru dalam dunia pendidikan Islam di Sukabumi. Sebagai bagian resmi dari jaringan{" "}
                <span className="text-primary-700 font-bold">
                  Managed by Al Andalus IIBS
                </span>
                , kami menerapkan standar mutu operasional, kurikulum terpadu, dan sistem pengasuhan unggul yang identik dengan kampus pusat.
              </p>
              <p>
                Kami berkomitmen mencetak kader ulama rabbani yang beraqidah lurus berdasarkan Al-Qur'an dan As-Sunnah, berakhlak mulia, dan berwawasan sains modern dengan dukungan fasilitas representatif serta barisan asatidzah yang kompeten di bidangnya.
              </p>
              <p>
                Menyongsong Tahun Ajaran 2027/2028, Pesantren Al-Andalus Ulul Albaab membuka Penerimaan Santri Baru (PSB) untuk jenjang Madrasah Tsanawiyah (MTs) dan I'dad Lughowi (IL) dengan fokus kurikulum berbasis TICE (Tahfidz, Islamic Curriculum, & Entrepreneurship).
              </p>
              <p className="font-bold text-primary-800 bg-primary-50 p-5 rounded-xl border border-primary-100 italic text-center text-base md:text-lg mt-6">
                "Kaderisasi Ummat Rabbani, Cendekia & Mandiri"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-8"
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-1">Fasilitas Representatif</h4>
                <p className="text-xs text-slate-500">Masjid luas, asrama nyaman, lab komputer, & sarana olahraga lengkap.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-1">Jaringan Al-Andalus</h4>
                <p className="text-xs text-slate-500">Sistem manajemen dan standar mutu teruji dari Al-Andalus IIBS.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center group hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-1">Tahfidz & TICE</h4>
                <p className="text-xs text-slate-500">Tahfidz bersanad, kurikulum Islam terpadu, dan entrepreneurship.</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 4. Vision & Mission (Official PUAS) */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary-100/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary-700 font-bold tracking-[0.2em] uppercase text-xs mb-3 block"
            >
              Landasan Dasar
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-black text-slate-900 mb-4"
            >
              Visi & Misi
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-base md:text-lg"
            >
              Arah dan komitmen luhur Pesantren Islam Internasional Al-Andalus Ulul Albaab.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Visi */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Visi Pesantren</h3>
                <p className="text-slate-800 font-bold text-xl leading-relaxed bg-white p-6 rounded-xl border border-slate-200">
                  "KADERISASI UMMAT RABBANI, CENDEKIA &amp; MANDIRI"
                </p>
              </div>
            </motion.div>

            {/* Misi */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Misi Pesantren</h3>
                <ul className="space-y-4 text-slate-700 text-sm md:text-base">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span><strong>Menyelenggarakan Pendidikan Berbasis TICE</strong> (Tahfidz, Islamic Curriculum, &amp; Entrepreneurship).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span><strong>Mencetak HAMALATUL QUR'AN</strong> dengan bekal ilmu syar'i yang mumpuni.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span><strong>Menanamkan jiwa Entrepreneur Muslim</strong> yang berwawasan global dan mandiri.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 5. Dewan Pembina Section */}
      <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/60">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">
              Struktur Kepemimpinan
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Dewan Pembina
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Dibimbing langsung oleh para asatidz dan tokoh yang berpengalaman luas di dunia pendidikan Islam dan dakwah.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {BOARD_MEMBERS.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-primary-300 hover:shadow-md transition-all duration-300"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-primary-50 border border-primary-100 flex items-center justify-center">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-1">
                    Dewan Pembina
                  </span>
                  <h4 className="font-bold text-sm md:text-base text-slate-900 leading-snug">
                    {member.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. CTA Footer */}
      <section className="py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Mari Bergabung Bersama Kami
          </h2>
          <p className="text-primary-200/80 max-w-xl mx-auto mb-8 text-base md:text-lg">
            Daftarkan putra-putri Anda sekarang untuk Tahun Ajaran 2027/2028 di Pesantren Al-Andalus Ulul Albaab.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5"
            >
              Daftar PPDB Sekarang <Send className="w-4 h-4" />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Hubungi Panitia
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
