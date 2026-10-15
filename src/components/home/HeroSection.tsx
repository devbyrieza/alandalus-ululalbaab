"use client";

// src/components/home/HeroSection.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BRANDING } from "@/config/branding";

// Jadwal pendaftaran: satu sumber agar label dan countdown selalu sinkron
const REG_CLOSE_ISO = "2026-12-28T23:59:59+07:00";
const REG_PERIOD_LABEL = "5 Sep - 28 Des 2026";

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ready: false,
    closed: false,
  });
  useEffect(() => {
    const target = new Date(targetDate).getTime();
    function tick() {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ready: true,
        closed: diff === 0,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Animasi masuk: tampil dari bawah secara berurutan (dimatikan jika pengguna memilih reduced motion)
const enter = "animate-slide-up motion-reduce:animate-none";
const delay = (ms: number) => ({ animationDelay: `${ms}ms`, animationFillMode: "both" as const });

export default function HeroSection() {
  const [session, setSession] = useState<any>(null);
  const countdown = useCountdown(REG_CLOSE_ISO);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.session) setSession(data.session);
      })
      .catch(() => {});
  }, []);

  const units = [
    { value: countdown.days, label: "Hari" },
    { value: countdown.hours, label: "Jam" },
    { value: countdown.minutes, label: "Menit" },
    { value: countdown.seconds, label: "Detik" },
  ];

  return (
    // id="beranda" ada di pembungkus <section> pada page.tsx, jadi tidak diulang di sini
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f9ff] via-[#F8FAFC] to-white pt-6 sm:pt-8 lg:pt-3 xl:pt-6 pb-12 sm:pb-16 lg:pb-20">
      {/* Background micro grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      {/* Ambient glow — pakai token brand */}
      <div className="glow-blob glow-blob-primary w-[420px] h-[420px] -top-32 -right-24" aria-hidden="true" />
      <div className="glow-blob glow-blob-secondary w-[320px] h-[320px] bottom-0 -left-20" aria-hidden="true" />

      <Container className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* ═════════ LEFT COLUMN ═════════ */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 lg:space-y-4 xl:space-y-6 text-center lg:text-left">
            {/* Eyebrow pill */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-300 shadow-xs shadow-blue-500/20 ${enter}`}
              style={delay(0)}
            >
              <span className="w-2 h-2 rounded-full bg-primary motion-safe:animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Portal Resmi PPDB Tahun Ajaran {BRANDING.academicYear}
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`text-3xl sm:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] ${enter}`}
              style={delay(80)}
            >
              Kaderisasi Ummat <br />
              <span className="text-primary">Rabbani, Cendekia, &amp; Mandiri</span>
            </h1>

            {/* Description */}
            <p
              className={`text-slate-600 text-sm sm:text-base lg:text-[0.95rem] xl:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal ${enter}`}
              style={delay(160)}
            >
              Pesantren Khusus Putra — bukan sekadar tempat belajar, namun sebuah ekosistem pendidikan yang{" "}
              <strong className="font-semibold text-slate-900">
                berorientasi pada pembentukan Hamalatul Qur&apos;an dan karakter entrepreneur muslim yang mandiri
              </strong>
              , memadukan Tahfidz Al-Qur&apos;an, Ilmu Syar&apos;i, Sains Akademik, dan Islamic Entrepreneurship berbasis TICE.
            </p>

            {/* Tagline */}
            <div
              className={`flex items-center gap-3 justify-center lg:justify-start max-w-xl mx-auto lg:mx-0 py-1 ${enter}`}
              style={delay(220)}
            >
              <div className="h-px w-8 bg-secondary" />
              <p className="text-xs sm:text-sm font-semibold italic text-primary">&ldquo;{BRANDING.schoolTagline}&rdquo;</p>
              <div className="h-px w-8 bg-secondary" />
            </div>

            {/* Trust checklist */}
            <ul
              className={`flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start ${enter}`}
              style={delay(280)}
            >
              {["MTs & IL Putra", "Kurikulum TICE Terpadu", "Boarding Asrama Representatif"].map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-1.5 w-full ${enter}`}
              style={delay(340)}
            >
              {session ? (
                <Link href="/dashboard" className="btn-primary w-full sm:w-auto shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2">
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link href="/ppdb" className="btn-primary w-full sm:w-auto shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2">
                  <span>Daftar PPDB 2027</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}

              <Link href="/program" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
                <span>Lihat Program</span>
              </Link>
            </div>

            {/* Live Countdown Card */}
            <div className={`pt-2 sm:pt-2.5 max-w-lg mx-auto lg:mx-0 ${enter}`} style={delay(400)}>
              <div className="bg-white border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2.5 sm:mb-3">
                  <span>Pendaftaran Dibuka: {REG_PERIOD_LABEL}</span>
                  {countdown.closed ? (
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Status: Ditutup
                    </span>
                  ) : (
                    <span className="text-primary font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Status: Aktif
                    </span>
                  )}
                </div>
                <div
                  className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center"
                  role="timer"
                  aria-label="Hitung mundur penutupan pendaftaran"
                >
                  {units.map((unit) => (
                    <div key={unit.label} className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 sm:p-3">
                      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary tabular-nums">
                        {countdown.ready ? pad(unit.value) : "--"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-1">{unit.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═════════ RIGHT COLUMN: PHOTO + FLOATING BADGES ═════════ */}
          <div className={`lg:col-span-5 relative ${enter}`} style={delay(200)}>
            {/* Bingkai dekoratif di belakang foto */}
            <div
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-200/60 via-transparent to-amber-200/60 blur-sm"
              aria-hidden="true"
            />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-600/30 border-4 border-white group bg-white/60 backdrop-blur-sm aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-h-[500px] xl:max-h-[560px]">
              <Image
                src="/images/talent-santri.png"
                alt="Santri Putra Pesantren Ulul Albaab"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
              />

              {/* Gradasi tipis di bawah agar badge tetap terbaca di atas foto */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/30 to-transparent pointer-events-none" aria-hidden="true" />

              {/* Top-Left Floating Badge */}
              <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 shadow-xl flex items-center gap-3">
                <div className="icon-box icon-box-secondary w-10 h-10">
                  <Award className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Standar Mutu</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Al Andalus IIBS</p>
                </div>
              </div>

              {/* Bottom-Right Floating Badge */}
              <div className="absolute bottom-4 right-4 bg-white/85 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 shadow-xl flex items-center gap-3">
                <div className="icon-box icon-box-primary w-10 h-10">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Tahfidz Mutqin</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Tajwid &amp; Bersanad</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════ 3 FEATURE CARDS ═════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-12 lg:mt-16">
          <div className={`app-card p-6 hover:border-secondary ${enter}`} style={delay(460)}>
            <div className="icon-box icon-box-secondary w-12 h-12 mb-4">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Fokus Utama</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Bahasa Arab &amp; Syar&apos;i</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Penguasaan bahasa Arab intensif harian, tahfidz Al-Qur&apos;an mutqin, dan pendalaman kitab turots sesuai
              bimbingan Sunnah.
            </p>
          </div>

          <div className={`app-card p-6 hover:border-primary/40 ${enter}`} style={delay(540)}>
            <div className="icon-box icon-box-primary w-12 h-12 mb-4">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Karakter &amp; Kemandirian</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Sains &amp; Leadership</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Pelajaran umum dan sains tetap pintar berdaya saing, berpadu dengan penempaan jiwa kepemimpinan dan
              Islamic Entrepreneurship.
            </p>
          </div>

          <div className={`app-card p-6 hover:border-emerald-300 ${enter}`} style={delay(620)}>
            <div className="icon-box w-12 h-12 mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Pola Pengasuhan</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Mendidik Tanpa Luka</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Keteladanan asatidz 24 jam tanpa kekerasan fisik, lingkungan aman terlindungi dari rokok, perundungan, dan
              penyimpangan.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}