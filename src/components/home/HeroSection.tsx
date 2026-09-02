"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  CheckCircle2,
  Gift
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BRANDING } from "@/config/branding";

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function HeroSection() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setSession(data.session);
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };
    fetchSession();
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });
  const animate = inView ? "visible" : "hidden";

  return (
    <section
      ref={ref}
      aria-label="Hero â€” Beranda Ulul Albaab"
      className="relative pt-24 pb-16 lg:pt-12 xl:pt-16 lg:pb-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, var(--color-surface-50) 0%, var(--color-white) 55%, var(--color-primary-50) 100%)",
      }}
    >
      {/* Background Blobs */}
      <div className="glow-blob glow-blob-primary w-[60%] h-[70%] -top-[20%] -left-[10%] opacity-20" aria-hidden="true" />
      <div className="glow-blob glow-blob-primary w-[40%] h-[40%] bottom-[-10%] left-[20%] opacity-10" aria-hidden="true" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 xl:gap-20 items-center lg:items-start">
          {/* CONTENT SIDE */}
          <div className="flex flex-col gap-6 lg:gap-7 text-center lg:text-left items-center lg:items-start w-full">
            {/* Opening Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.1 }}
              className="flex justify-center lg:justify-start w-full"
            >
              <span className="section-label section-label-primary">
                Selamat Datang di {BRANDING.schoolShortName}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h1 className="leading-[1.1] tracking-[-0.03em] mx-auto lg:mx-0 max-w-2xl lg:max-w-none font-black text-center lg:text-left text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem]">
                <span className="text-ink-950 block mb-1">
                  Kaderisasi Ummat
                </span>
                <span className="gradient-text-blue">
                  Rabbani, Cendekia, dan Mandiri
                </span>
              </h1>
            </motion.div>

            {/* Body Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.3 }}
              className="text-base lg:text-[1.075rem] leading-[1.85] max-w-[42rem] mx-auto lg:mx-0 text-center lg:text-left text-pretty text-slate-600 font-medium"
            >
              Bukan sekadar tempat belajar â€” sebuah ekosistem pendidikan yang{" "}
              <strong className="font-bold text-primary-700">
                berorientasi pada pembentukan Hamalatul Qur'an dan karakter entrepreneur muslim yang mandiri
              </strong>, memadukan Intensitas Tahfidz Al-Qur'an, Ilmu Syar'i, Sains Akademik, dan Islamic Entrepreneurship berbasis TICE.
            </motion.p>

            {/* Tagline Divider */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-primary-200)" }}
              />
              <p className="text-sm font-semibold italic text-primary-700">
                &ldquo;{BRANDING.schoolTagline}&rdquo;
              </p>
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-primary-200)" }}
              />
            </motion.div>

            {/* CTA Group */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-4 items-center lg:items-start"
            >
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {session ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button
                      className="btn-primary w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all relative overflow-hidden group font-bold"
                      style={{ boxShadow: "var(--shadow-primary-lg)" }}
                    >
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                      </span>
                      <span>Lanjutkan Ke Dashboard</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/ppdb" className="w-full sm:w-auto">
                      <button
                        className="btn-primary shine-hover w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-2.5 group font-bold"
                        style={{ boxShadow: "var(--shadow-primary-lg)" }}
                      >
                        Daftar PPDB Sekarang
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </Link>
                    <Link href="/program" className="w-full sm:w-auto">
                      <button className="btn-secondary w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-2 group">
                        Lihat Program Kami
                        <ArrowRight className="w-4 h-4 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="flex -space-x-2.5">
                  {[
                    { bg: "var(--color-primary-200)" },
                    { bg: "var(--color-secondary-300)" },
                    { bg: "var(--color-primary-300)" },
                    { bg: "var(--color-secondary-200)" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 flex-shrink-0"
                      style={{
                        background: item.bg,
                        borderColor: "var(--color-white)",
                        boxShadow: "var(--shadow-xs)",
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: "var(--color-ink-500)" }}
                >
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: "var(--color-primary-700)" }}
                  >
                    Angkatan Ke-5
                  </span>
                  {" â€¢ "}Pesantren Ulul Albaab
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-1">
                {[
                  "MTs & IL Putra/Putri",
                  "Kurikulum TICE Terpadu",
                  "Boarding Asrama Representatif",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* IMAGE SIDE */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={animate}
            transition={{ delay: 0.25 }}
            className="relative w-full max-w-[480px] lg:max-w-none mx-auto"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/hero.jpg"
                alt="Pesantren Islam Internasional Al-Andalus Ulul Albaab"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

