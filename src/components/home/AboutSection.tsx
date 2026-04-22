"use client";

import Link from "next/link";
import {
  CheckCircle,
  Target,
  Rocket,
  ArrowRight
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

export default function AboutSection() {

  const handleNavigateToDetail = () => {
    navigateToDetail('/tentang', '#about');
  };
  return (
    <section id="about" className="section-alt">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container>
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Profil Pesantren</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title mb-6"
            >
              Mengedepankan <br /><span className="text-gradient-maroon">Pendidikan Qur'ani &amp; Entrepreneurship</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="section-subtitle text-justify md:text-center"
            >
              <span className="font-bold text-maroon-900">Pesantren Ulul Albaab Sukabumi.</span> Lembaga pendidikan Islam berbasis pesantren modern yang mengusung visi Kaderisasi Ummat Rabbani, Cendekia, dan Mandiri — terafiliasi dengan Pesantren Islam Internasional Al Andalus.
            </motion.p>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8 mb-16 lg:mb-20">
            {/* Card Visi - Full Width Centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="app-card bg-white p-8 md:p-12 relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-cream-100/50 flex items-center justify-center mb-6 shadow-sm">
                  <Target className="w-8 h-8 text-maroon-700" />
                </div>

                <div className="badge badge-maroon mb-4">Visi Utama</div>

                <h3 className="text-2xl md:text-3xl font-display font-bold text-ink-950 mb-6 tracking-tight">Visi Kami</h3>

                <blockquote className="relative max-w-3xl mx-auto">
                  <p className="text-maroon-900 leading-snug font-black text-2xl md:text-4xl italic">
                    "Kaderisasi Ummat Rabbani, Cendekia, dan Mandiri"
                  </p>
                  <div className="mt-8 w-12 h-1.5 bg-cream-300 rounded-full mx-auto" />
                </blockquote>
              </div>
            </motion.div>

            {/* Card Misi - Full Width Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="app-card bg-white p-8 md:p-12 relative z-10 flex flex-col">
                <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-maroon-50 flex items-center justify-center shadow-sm shrink-0">
                      <Rocket className="w-8 h-8 text-maroon-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold text-ink-950 tracking-tight mb-2">Misi Kami</h3>
                      <div className="badge badge-cream">Langkah Strategis</div>
                    </div>
                  </div>
                </div>

                <ul className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    "Menyelenggarakan pendidikan berbasis TICE (Tahfizh, Islamic Curriculum, dan Entrepreneurship).",
                    "Mencetak Hamalatul Qur'an dengan bekal ilmu syar'i yang mumpuni.",
                    "Menanamkan Jiwa Entrepreneur Muslim yang berwawasan Global.",
                    "Pendidikan Islam berbasis Kitab Turots dengan Bahasa Pengantar Bahasa Arab."
                  ].map((misi, i) => (
                    <li key={i} className="flex gap-4 items-start p-4 rounded-xl bg-cream-50/50 border border-cream-100">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center shrink-0 text-maroon-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[15px] font-medium text-ink-700 leading-relaxed">
                        {misi}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center pt-4"
          >
            <Link href="/tentang" onClick={handleNavigateToDetail} className="w-full sm:w-auto">
              <button className="btn-secondary w-full px-12 py-4">
                Lanjut Baca Profil
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
