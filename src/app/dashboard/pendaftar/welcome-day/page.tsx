"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft, ShieldAlert } from "lucide-react";

export default function WelcomeDayPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-stone-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 border border-amber-100 shadow-sm">
          <Clock className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/60 text-amber-800 rounded-full text-xs font-bold mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Tahapan Belum Dibuka
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-3 tracking-tight">
          Informasi Welcome Day & Kedatangan Santri
        </h2>
        <p className="text-stone-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed mb-8">
          Jadwal kedatangan, alur registrasi asrama, dan rangkaian kegiatan Welcome Day akan diumumkan secara resmi oleh panitia mendekati waktu tahun ajaran baru. Mohon pantau pengumuman resmi berkala di dashboard akun Anda.
        </p>
        <Link
          href="/dashboard/pendaftar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Utama
        </Link>
      </div>
    </div>
  );
}
