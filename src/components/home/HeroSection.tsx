"use client";

// src/components/home/HeroSection.tsx — Clean Centered Value Hero (Gaya Kuliah SUNI)
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Download,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Clock,
  Sparkles,
  Wallet,
  Building2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BRANDING } from "@/config/branding";

// Jadwal pendaftaran: satu sumber agar label dan countdown selalu sinkron
const REG_CLOSE_ISO = "2026-12-20T23:59:59+07:00";
const REG_PERIOD_LABEL = "16 Okt - 20 Des 2026";
const WA_CONSULT_URL =
  "https://wa.me/6281285300800?text=Halo%20Admin%20SPMB%20Pesantren%20Ulul%20Albaab%2C%20saya%20ingin%20konsultasi%20pendaftaran%20santri%20baru";

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

// Animasi masuk: tampil dari bawah secara berurutan
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
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f9ff] via-[#F8FAFC] to-white pt-8 sm:pt-12 lg:pt-16 pb-14 sm:pb-20 lg:pb-24">
      {/* Background micro grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      <Container className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        {/* ═════════ CENTERED HERO CONTENT ═════════ */}
        <div className="text-center space-y-6 sm:space-y-7 max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-300 shadow-xs ${enter}`}
            style={delay(0)}
          >
            <span className="w-2 h-2 rounded-full bg-primary motion-safe:animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              Portal Resmi SPMB TA {BRANDING.academicYear} • KHUSUS PUTRA
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] ${enter}`}
            style={delay(80)}
          >
            Kaderisasi Ummat <br />
            <span className="text-primary">Hanif, Kontributif, &amp; Adaptif</span>
          </h1>

          {/* Description */}
          <p
            className={`text-slate-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-normal ${enter}`}
            style={delay(160)}
          >
            Bukan sekadar tempat belajar — pesantren khusus putra dengan ekosistem kaderisasi ummat yang hanif, kontributif, dan adaptif,{" "}
            <strong className="font-semibold text-slate-900">
              mendidik dengan keteladanan tanpa luka pengasuhan
            </strong>
            . Menyelaraskan penguasaan <strong className="font-semibold text-slate-900">Bahasa Arab intensif</strong>, Tahfidz
            Al-Qur&apos;an, pendalaman ilmu syar&apos;i, keunggulan sains akademik umum, serta penempaan{" "}
            <em>leadership</em> dan <em>agropreneur</em> — ilmu pertanian dan peternakan — berlandaskan
            Al-Qur&apos;an dan Sunnah.
          </p>

          {/* Tagline */}
          <div
            className={`flex items-center gap-3 justify-center max-w-xl mx-auto py-1 ${enter}`}
            style={delay(200)}
          >
            <div className="h-px w-8 bg-secondary" />
            <p className="text-xs sm:text-sm font-semibold italic text-primary">&ldquo;{BRANDING.schoolTagline}&rdquo;</p>
            <div className="h-px w-8 bg-secondary" />
          </div>

          {/* 3 Quick-Value Objection/Confidence Pills (Kuliah SUNI & Al-Ma'tuq Standard) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-1 ${enter}`}
            style={delay(240)}
          >
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-blue-100 shadow-xl backdrop-blur-xs text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Mendidik Tanpa Luka</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Nol kekerasan &amp; perundungan</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-blue-100 shadow-xl backdrop-blur-xs text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Bahasa Arab &amp; Tahfidz</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Sanad mutqin &amp; aktif harian</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-blue-100 shadow-xl backdrop-blur-xs text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Ijazah Formal Resmi</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">Kemenag &amp; Kemendikbud</div>
              </div>
            </div>
          </div>

          {/* Trust checklist */}
          <ul
            className={`flex flex-wrap gap-x-6 gap-y-2 justify-center ${enter}`}
            style={delay(280)}
          >
            {["MTs & IL Putra", "Kurikulum TICE Terpadu", "Boarding Asrama 24 Jam Representatif"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full ${enter}`}
            style={delay(320)}
          >
            {session ? (
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-xl hover: flex items-center justify-center gap-2">
                <span>Buka Dashboard</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/ppdb" className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-xl hover: flex items-center justify-center gap-2">
                <span>Daftar SPMB 2027</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            )}

            <a
              href={WA_CONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#25D366] text-ink-950 hover:bg-[#20ba59] shadow-lg hover: hover:-translate-y-0.5 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Konsultasi Panitia</span>
            </a>

            <Link href="/program" className="btn-secondary w-full sm:w-auto px-6 py-4 text-sm sm:text-base flex items-center justify-center gap-2">
              <span>Lihat Program</span>
            </Link>

            <a
              href="/documents/Brosur-SPMB-Ulul-Albaab-2027-2028.pdf"
              download="Brosur-SPMB-Pesantren-Ulul-Albaab-2027-2028.pdf"
              className="btn-cream w-full sm:w-auto px-6 py-4 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Unduh Brosur</span>
            </a>
          </div>

          {/* ═════════ 4 QUICK HIGHLIGHT STAT CARDS (Kuliah SUNI Standard) ═════════ */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 max-w-4xl mx-auto ${enter}`}
            style={delay(360)}
          >
            {/* Card 1: Uang Pangkal */}
            <div className="bg-white/90 border border-blue-100 rounded-2xl p-4 shadow-xl text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Uang Pangkal
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-primary">
                Rp 9,9 Juta
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">
                Bisa Dicicil 3x
              </p>
            </div>

            {/* Card 2: SPP Bulanan */}
            <div className="bg-white/90 border border-blue-100 rounded-2xl p-4 shadow-xl text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SPP Bulanan
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Rp 1,1 Juta
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                All-In Asrama &amp; Makan
              </p>
            </div>

            {/* Card 3: Gender */}
            <div className="bg-white/90 border border-blue-100 rounded-2xl p-4 shadow-xl text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Ekosistem
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-700">
                100% Putra
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Asrama &amp; pembinaan khusus putra
              </p>
            </div>

            {/* Card 4: Countdown Status */}
            <div className="bg-white/90 border border-blue-100 rounded-2xl p-4 shadow-xl text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Pendaftaran
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 tabular-nums">
                {countdown.ready ? `${countdown.days} Hari Lagi` : "--"}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {REG_PERIOD_LABEL}
              </p>
            </div>
          </div>
        </div>

        {/* ═════════ 3 FEATURE CARDS (Bottom Anchor) ═════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-14 lg:mt-20">
          <div className={`app-card p-6 sm:p-7 rounded-3xl hover:border-secondary transition-all duration-300 ${enter}`} style={delay(420)}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="icon-box icon-box-secondary w-12 h-12 shrink-0 rounded-2xl shadow-xs">
                <BookOpen className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Fokus Utama
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              Bahasa Arab &amp; Syar&apos;i
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Penguasaan bahasa Arab intensif harian, tahfidz Al-Qur&apos;an mutqin, dan pendalaman kitab turots sesuai bimbingan Sunnah.
            </p>
          </div>

          <div className={`app-card p-6 sm:p-7 rounded-3xl hover:border-primary/40 transition-all duration-300 ${enter}`} style={delay(480)}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="icon-box icon-box-primary w-12 h-12 shrink-0 rounded-2xl shadow-xs">
                <GraduationCap className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Karakter &amp; Kemandirian
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              Sains &amp; Leadership
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Pelajaran umum dan sains tetap pintar berdaya saing, berpadu dengan penempaan jiwa kepemimpinan dan Islamic Entrepreneurship.
            </p>
          </div>

          <div className={`app-card p-6 sm:p-7 rounded-3xl hover:border-emerald-300 transition-all duration-300 ${enter}`} style={delay(540)}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="icon-box w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                Pola Pengasuhan
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 leading-snug">
              Mendidik Tanpa Luka
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Keteladanan asatidz 24 jam tanpa kekerasan fisik, lingkungan aman terlindungi dari rokok, perundungan, dan penyimpangan.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}