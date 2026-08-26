"use client";

import { Users, User } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import Image from "next/image";

const BOARD_MEMBERS = [
  {
    name: "Ustadz Dr. Muhammad Arifin Badri, Lc., MA",
    image: "/images/muhammad-arifin-badri.webp",
  },
  {
    name: "Ustadz Dr. Nurdin Apud Sarbini, Lc., M.Pd",
    image: "/images/nurdin-apud-sabrini.webp",
  },
  {
    name: "H. Tarmen Tascha, SE",
    image: "/images/tarmen-tascha.webp",
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
    name: "Ustadz Dwi Wahyu Iskandar",
    image: "",
  },
] as const;

// ─── Animation ───────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Member Card ─────────────────────────────────────
function MemberCard({
  name,
  image,
  index,
}: {
  name: string;
  image: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: EASE }}
      className="group flex items-center gap-4 md:gap-5 p-4 md:p-5 bg-white rounded-2xl border border-primary-100 shadow-xs hover:shadow-md hover:border-primary-300 transition-all duration-300"
    >
      {/* Avatar */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-primary-50 border border-primary-100 shadow-xs transition-transform duration-500 group-hover:scale-105">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="80px"
            priority={index < 4}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50 group-hover:bg-primary-100 transition-colors">
            <User className="w-8 h-8 text-primary-400" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-1">
          Dewan Pembina
        </span>
        <h4 className="font-bold text-sm md:text-base text-slate-900 leading-snug tracking-tight group-hover:text-primary-700 transition-colors">
          {name}
        </h4>
        <div className="mt-2 h-0.5 w-6 rounded-full bg-primary-200 group-hover:w-12 group-hover:bg-primary-600 transition-all duration-300" />
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function BoardSection() {
  return (
    <section id="pembina" className="py-20 md:py-28 bg-surface-50 relative overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,237,255,0.5) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[360px] h-[360px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(254,243,199,0.4) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-xs"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Struktur Organisasi</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4"
          >
            Dewan <span className="text-primary-700">Pembina</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Dibimbing langsung oleh para asatidz dan tokoh yang berpengalaman luas dalam membangun peradaban Islam melalui jalur dakwah dan pendidikan berkualitas.
          </motion.p>
        </div>

        {/* ── Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {BOARD_MEMBERS.map((member, idx) => (
            <MemberCard
              key={idx}
              name={member.name}
              image={member.image}
              index={idx}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
