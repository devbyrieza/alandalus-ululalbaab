"use client";

import Link from "next/link";
import {
  CheckCircle,
  Target,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, Variants } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const misi = [
  {
    label: "Rabbani",
    text: "Membina generasi yang taat kepada Allah sesuai sunnah dengan pemahaman salafushalih.",
  },
  {
    label: "Cendekia",
    text: "Menjadikan santri pribadi yang cerdas, cepat mengerti situasi, dan pandai mencari solusi.",
  },
  {
    label: "Mandiri",
    text: "Mendidik pribadi yang mampu mengambil keputusan dan menyelesaikan tugas secara mandiri.",
  },
  {
    label: "TICE",
    text: "Menyelenggarakan pendidikan berbasis Tahfizh, Islamic Curriculum, dan Entrepreneurship.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.55,
      ease: SPRING,
    },
  },
};

export default function AboutSection() {
  const handleNavigateToDetail = () => {
    navigateToDetail("/tentang", "#about");
  };

  return (
    <section id="about" className="section-alt relative overflow-hidden">
      {/* Ambient background blobs — biru & kuning sesuai branding Ulul Albaab */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-brand-blue-100/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-brand-yellow-100/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-blue-50/30 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────── */}
          <motion.div
            className="text-center mb-16 lg:mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-blue-100 text-brand-blue-700 text-[11px] font-bold uppercase tracking-[0.12em] shadow-xs">
                <Sparkles className="w-3 h-3" />
                Profil Pesantren 🏫
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="section-title mb-5 text-balance"
            >
              Mengedepankan{" "}
              <span className="text-gradient-blue">
                Pendidikan Qur&apos;ani &amp; Entrepreneurship ✨
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="section-subtitle text-justify md:text-center"
            >
              <span className="font-semibold text-brand-blue-800">
                Pesantren Ulul Albaab Sukabumi.
              </span>{" "}
              Lembaga pendidikan Islam berbasis pesantren modern yang mengusung
              visi Kaderisasi Ummat Rabbani, Cendekia, dan Mandiri — terafiliasi
              dengan Pesantren Islam Internasional Al Andalus.
            </motion.p>
          </motion.div>

          {/* ── Visi & Misi Grid ─────────────────── */}
          <div className="grid gap-5 lg:gap-6 mb-16 lg:mb-20">

            {/* Visi — Full Width, Statement Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "tween", duration: 0.6, ease: SPRING }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-brand-blue-100 bg-white shadow-premium-sm group">
                {/* Card top accent bar — biru ke kuning */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue-600 via-brand-blue-400 to-brand-yellow-400 rounded-t-2xl" />

                <div className="flex flex-col items-center text-center px-8 py-12 md:px-16 md:py-16">
                  {/* Icon */}
                  <div className="mb-7 w-14 h-14 rounded-xl bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center shadow-xs group-hover:shadow-sm transition-shadow duration-300">
                    <Target
                      className="w-6 h-6 text-brand-blue-600"
                      strokeWidth={1.75}
                    />
                  </div>

                  <span className="badge badge-brand-blue mb-5 text-[11px] tracking-wider uppercase">
                    Visi Utama 🎯
                  </span>

                  <blockquote className="max-w-2xl mx-auto">
                    <p className="font-display font-black text-2xl md:text-[2.15rem] leading-[1.2] tracking-tight text-brand-blue-900 italic">
                      &ldquo;Kaderisasi Ummat Rabbani, Cendekia, dan
                      Mandiri&rdquo;
                    </p>
                  </blockquote>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-brand-blue-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow-400" />
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-brand-blue-200" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Misi — Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                type: "tween",
                duration: 0.6,
                ease: SPRING,
                delay: 0.08,
              }}
            >
              <div className="rounded-2xl border border-brand-blue-100 bg-white shadow-premium-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 px-8 py-7 md:px-10 border-b border-brand-blue-50">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center shrink-0">
                    <Rocket
                      className="w-5 h-5 text-brand-blue-600"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-brand-blue-900 tracking-tight leading-tight">
                      Misi Kami 🚀
                    </h3>
                    <p className="text-[13px] text-ink-400 mt-0.5">
                      Empat pilar pendidikan unggulan
                    </p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <span className="badge badge-brand-yellow text-[11px] tracking-wider uppercase">
                      Langkah Strategis
                    </span>
                  </div>
                </div>

                {/* Misi list */}
                <motion.ul
                  className="grid md:grid-cols-2 divide-y divide-brand-blue-50 md:divide-y-0 md:divide-x md:divide-brand-blue-50"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={containerVariants}
                >
                  {misi.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex gap-4 items-start p-6 md:p-8 group/item hover:bg-brand-blue-50/50 transition-colors duration-200"
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center group-hover/item:bg-brand-blue-100 transition-colors duration-200">
                          <CheckCircle
                            className="w-3.5 h-3.5 text-brand-blue-600"
                            strokeWidth={2.25}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-brand-blue-500 mb-1.5">
                          {item.label}
                        </span>
                        <p className="text-[14.5px] text-ink-600 leading-relaxed font-[450]">
                          {item.text}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </div>

          {/* ── CTA ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "tween",
              duration: 0.5,
              ease: SPRING,
              delay: 0.1,
            }}
            className="flex flex-col items-center"
          >
            <Link
              href="/tentang"
              onClick={handleNavigateToDetail}
              className="w-full sm:w-auto"
            >
              <button className="btn-secondary w-full px-10 py-3.5 group">
                Lanjut Baca Profil 🚀
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}