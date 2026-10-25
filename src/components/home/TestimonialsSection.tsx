"use client";

import { MessageCircle, Star, Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    no: "001",
    name: "Dr. Hendra Gunawan, S.T., M.Kom.",
    role: "Wali Santri MTs Ulul Albaab",
    city: "Jakarta Selatan",
    initial: "H",
    date: "Angkatan 3",
    quote:
      "Tujuan kami menyekolahkan ananda ke Pesantren Ulul Albaab adalah agar memiliki aqidah kokoh, adab islami, dan tahfidz mutqin tanpa melupakan sains. Pendekatan mendidik tanpa luka pengasuhan terbukti membuat anak betah di asrama dan semakin disiplin shalat berjamaah." },
  {
    no: "002",
    name: "Ibu Rina Marlina, S.Farm., Apt.",
    role: "Wali Santri I'dad Lughowi",
    city: "Bandung, Jawa Barat",
    initial: "R",
    date: "Angkatan 4",
    quote:
      "Awalnya sempat khawatir melepas anak laki-laki kami mukim. Namun bimbingan asatidz 24 jam sangat intensif dan ramah. Dalam hitungan bulan, perkembangan bahasa Arab aktif dan tartil hafalan Qur'an ananda menunjukkan lompatan yang sangat membanggakan." },
  {
    no: "003",
    name: "Bpk. Ir. H. Bambang Sudaryanto",
    role: "Wali Santri MTs Ulul Albaab",
    city: "Bekasi, Jawa Barat",
    initial: "B",
    date: "Angkatan 3",
    quote:
      "Kurikulum terpadu TICE yang memadukan Tahfidz, Islamic Studies, Sains, dan Entrepreneurship benar-benar terasa dampaknya. Anak tidak hanya cerdas agama, tetapi juga matang logika sains dan kemandirian hidupnya. Sangat recommended bagi orang tua." },
  {
    no: "004",
    name: "Faisal Ahmad, S.H.",
    role: "Alumni Pesantren Jaringan Al-Andalus",
    city: "Sukabumi, Jawa Barat",
    initial: "F",
    date: "Alumni",
    quote:
      "Fondasi bahasa Arab aktif harian dan hafalan Al-Qur'an mutqin yang ditanamkan sejak pondok menjadi modal berharga saat saya kuliah di Timur Tengah. Pola pembinaan asrama yang mengedepankan keteladanan membentuk integritas karakter saya hingga hari ini." },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function TestimonialCard({
  no,
  name,
  role,
  city,
  initial,
  date,
  quote,
  idx }: (typeof TESTIMONIALS)[number] & { idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ delay: idx * 0.08, duration: 0.6, ease: EASE }}
      whileHover={{ y: -4 }}
      className="group relative bg-white/80 backdrop-blur-sm flex flex-col h-full rounded-3xl border border-blue-100 shadow-xl hover:shadow-xl hover: hover:border-primary-200 overflow-hidden transition-all duration-400"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full p-6 md:p-7">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 border border-primary-100 text-[0.6rem] font-black text-primary-900 tracking-wide shadow-xs group-hover:bg-primary-100 transition-all duration-300 whitespace-nowrap shrink-0">
            #{no}
          </span>
          <Quote
            className="w-8 h-8 text-primary-50 -rotate-12 transition-colors duration-400 group-hover:text-primary-100"
            aria-hidden
          />
        </div>

        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5 text-secondary-500 fill-secondary-500"
              aria-hidden
            />
          ))}
        </div>

        <p className="text-[0.8125rem] md:text-[0.875rem] text-ink-700 leading-relaxed font-[450] italic grow mb-6">
          &ldquo;{quote}&rdquo;
        </p>

        <div className="border-t border-primary-50 pt-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shrink-0 text-white font-black text-sm shadow-xs group-hover:-rotate-3 transition-all duration-400">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-bold text-ink-900 leading-tight truncate">
                {name}
              </p>
              <p className="text-[0.6rem] font-bold text-primary-600 uppercase tracking-[0.1em] leading-tight mt-0.5">
                {role}
              </p>
            </div>
            <span className="text-[0.575rem] font-black text-primary-900 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-full border border-primary-100 shadow-xs whitespace-nowrap">
              {date}
            </span>
          </div>
          <p className="text-[0.6rem] text-ink-400 font-medium mt-3 tracking-wide">
            {city}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="section-alt relative border-y border-primary-100 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230369C7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />
      <div
        className="absolute -top-48 -left-48 w-[500px] h-[500px] pointer-events-none max-w-full"
        style={{
          background:
            "radial-gradient(circle, rgba(220,237,255,0.5) 0%, transparent 65%)" }}
      />

      <Container className="relative z-10">
        <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-primary-100 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <MessageCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>Pengalaman Otentik Wali Santri</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="section-title mb-4"
          >
            Cerita Pengalaman{" "}
            <span className="text-gradient-primary">Wali Santri &amp; Alumni</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="section-subtitle max-w-xl mx-auto mb-6"
          >
            Kepercayaan para orang tua yang telah mengamanahkan pendidikan karakter, tahfidz, dan masa depan ananda di Pesantren Ulul Albaab (Managed by Al Andalus IIBS).
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22, duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-800 px-4 py-2 rounded-full border border-blue-200 font-bold text-[0.8125rem] shadow-sm"
          >
            <span className="text-secondary-500">✦</span> Reputasi Global
            yang Teruji
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12">
          {TESTIMONIALS.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} idx={idx} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-[0.6rem] text-ink-400 font-semibold uppercase tracking-[0.12em]"
        >
          Testimoni asli dari wali santri &amp; alumni · Nama ditampilkan dengan
          persetujuan
        </motion.p>
      </Container>
    </section>
  );
}
