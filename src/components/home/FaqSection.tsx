"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, MessageCircleMore } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ────────────────────────────────────────────
const FAQS = [
  {
    question: "Kapan pendaftaran santri baru angkatan 2027/2028 dibuka?",
    answer:
      "Pendaftaran SPMB Tahun Ajaran 2027/2028 dibuka mulai tanggal 16 Oktober sampai dengan 20 Desember 2026. Namun, pendaftaran dapat ditutup lebih awal jika kuota santri baru sudah terpenuhi." },
  {
    question: "Apakah santri diwajibkan untuk tinggal di asrama?",
    answer:
      "Ya, seluruh santri di Pesantren Al Andalus Ulul Albaab wajib tinggal di asrama untuk mengikuti seluruh rangkaian kegiatan tarbiyah, halaqah tahfidz, dan pembelajaran kitab turots secara maksimal." },
  {
    question:
      "Kurikulum apa yang diterapkan di Pesantren Al Andalus Ulul Albaab?",
    answer:
      "Kami menerapkan Kurikulum Terpadu yang menggabungkan kurikulum Nasional dengan kurikulum khas Andalus yang berfokus pada penguasaan Bahasa Arab, Tahfidz Al-Qur'an, dan Kitab Turots." },
  {
    question: "Apa saja berkas persyaratan yang harus disiapkan?",
    answer:
      "Berkas utama yang diperlukan adalah Akta Kelahiran, Kartu Keluarga, Ijazah/Rapor terakhir, dan pas foto terbaru. Seluruh berkas diunggah secara digital melalui dashboard pendaftaran." },
  {
    question: "Bagaimana sistem seleksi yang diterapkan?",
    answer:
      "Sistem seleksi meliputi tes Al-Qur'an (Tahsin & Tahfidz), Kemampuan Dasar Akademik, Identifikasi Kepribadian, Tes Kesiapan & Kemandirian Santri, serta Wawancara Calon Santri dan Wali Santri." },
  {
    question: "Berapa rincian biaya masuk dan bagaimana skema cicilannya?",
    answer:
      "Biaya pendaftaran sebesar Rp 250.000. Uang Pangkal sebesar Rp 9.900.000 dapat dicicil 3x: cicilan pertama 50% (Rp 4.950.000) sepekan setelah menerima pengumuman hasil seleksi, dan sisanya boleh dicicil 2x dengan batas waktu hingga Mei 2027. SPP bulanan Rp 1.100.000 (Rp 13.200.000/tahun All-In sudah termasuk asrama, makan, dan seluruh kegiatan). Rekening resmi: Bank Syariah Indonesia (BSI) No. Rek. 7253701263 a/n Al Andalus Ulul Albaab 1." },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const WA_URL = "https://wa.me/6281285300800";

// ─── FAQ Item ─────────────────────────────────────────
function FaqItem({
  question,
  answer,
  isOpen,
  toggle,
  index }: {
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
    >
      <div
        className={[
          "rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
          isOpen
            ? "border-primary-200 shadow-premium-sm ring-1 ring-primary-100/60"
            : "border-primary-100 hover:border-primary-200 hover:shadow-xs",
        ].join(" ")}
      >
        <button
          onClick={toggle}
          className="w-full text-left flex items-center justify-between gap-4 px-6 py-5 md:px-7 md:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-2xl flex-wrap"
          aria-expanded={isOpen}
        >
          <span
            className={[
              "font-bold text-[0.9375rem] md:text-base leading-snug tracking-tight transition-colors duration-200 pr-3",
              isOpen ? "text-primary-700" : "text-ink-900",
            ].join(" ")}
          >
            {question}
          </span>

          <div
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
              isOpen
                ? "bg-primary-600 text-white rotate-180"
                : "bg-secondary-50 text-primary-500 hover:bg-primary-50",
            ].join(" ")}
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="px-6 pb-6 md:px-7 md:pb-7">
                <div className="h-px w-12 bg-primary-100 mb-5 whitespace-nowrap inline-block shrink-0" />
                <p className="text-[0.875rem] md:text-[0.9375rem] text-ink-600 font-[450] leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-std relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white py-20 lg:py-24">
      <div
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(254,243,199,0.5) 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-10 -right-20 w-[300px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,237,255,0.45) 0%, transparent 65%)" }}
      />

      <Container className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ═════════ LEFT COLUMN (Sticky Header & Helpdesk) ═════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span>Pusat Bantuan &amp; Tanya Jawab</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Pertanyaan yang <br />
                <span className="text-primary">Sering Ditanyakan</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3">
                Temukan jawaban cepat seputar pendaftaran santri baru, rincian biaya uang pangkal &amp; SPP, serta sistem pendidikan di Pesantren Ulul Albaab.
              </p>
            </div>

            {/* Persistent Helpdesk Card (Al-Ma'tuq & SUNI Standard) */}
            <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-blue-200 shadow-xl shadow-blue-500/10 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <MessageCircleMore className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    Butuh Bantuan Langsung?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Konsultasi Pendaftaran Santri Baru
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Panitia admisi siap membimbing Abi &amp; Ummi jika memiliki pertanyaan khusus mengenai kuota, cicilan pembiayaan, maupun janji temu survei kampus pesantren.
              </p>

              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20ba59] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current shrink-0"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>Chat WhatsApp Panitia</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-100 font-medium">
                <span>Hotline: +62 812-8530-0800</span>
                <span>08.00 - 17.00 WIB</span>
              </div>
            </div>
          </div>

          {/* ═════════ RIGHT COLUMN (Accordion Items) ═════════ */}
          <div className="lg:col-span-7 space-y-3.5">
            {FAQS.map((faq, idx) => (
              <FaqItem
                key={idx}
                index={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === idx}
                toggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}


