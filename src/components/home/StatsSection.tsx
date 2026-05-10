"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import {
  Calendar,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────
type StatColor = "blue" | "yellow";

interface Stat {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
  color: StatColor;
  suffix: string;
  sublabel: string;
  description: string;
}

// ─── Data ────────────────────────────────────────────
const STATS: Stat[] = [
  {
    id: "batch",
    label: "Angkatan Ke-4",
    value: 4,
    icon: Calendar,
    color: "blue",
    suffix: "",
    sublabel: "Managed by Al Andalus",
    description: "Rekam jejak terbukti & terstruktur",
  },
  {
    id: "quality",
    label: "Standar Global",
    value: 100,
    icon: Award,
    color: "yellow",
    suffix: "%",
    sublabel: "Kurikulum Unggulan",
    description: "Kurikulum terintegrasi penuh",
  },
  {
    id: "levels",
    label: "Jenjang Tersedia",
    value: 3,
    icon: GraduationCap,
    color: "blue",
    suffix: "",
    sublabel: "MTs · IL · SMA",
    description: "Pendidikan menengah lengkap",
  },
  {
    id: "quota",
    label: "Kuota Tersedia",
    value: 124,
    icon: Users,
    color: "yellow",
    suffix: "",
    sublabel: "Santri Putra & Putri",
    description: "Terbuka untuk semua",
  },
];

const TRUST_BADGES = [
  { icon: null, label: "Pendaftaran Dibuka", pulse: true },
  { icon: ShieldCheck, label: "Resmi Kemendikdasmen", pulse: false },
  { icon: TrendingUp, label: "Kurikulum Terintegrasi", pulse: false },
];

// ─── Animated Counter ────────────────────────────────
function AnimatedCounter({
  value,
  trigger,
  delay = 0,
}: {
  value: number;
  trigger: boolean;
  delay?: number;
}) {
  const motionVal = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const controls = animate(motionVal, value, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.floor(v));
      },
    });
    return controls.stop;
  }, [trigger, value, delay, motionVal]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────
function StatCard({
  stat,
  index,
  trigger,
}: {
  stat: Stat;
  index: number;
  trigger: boolean;
}) {
  const Icon = stat.icon;
  const isBlue = stat.color === "blue";
  const isYellow = stat.color === "yellow";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative h-full"
    >
      <div className="relative flex flex-col items-center text-center px-6 py-8 md:px-8 md:py-10 bg-white rounded-2xl border border-brand-blue-100 shadow-premium-sm transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:shadow-premium-md hover:border-brand-blue-200 overflow-hidden h-full">
        {/* Hover radial bg — biru untuk blue, kuning untuk yellow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: isBlue
              ? "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(3,105,199,0.04) 0%, transparent 70%)"
              : "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(245,158,11,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <div
          className={[
            "relative mb-6 w-13 h-13 md:w-14 md:h-14 flex items-center justify-center rounded-xl shadow-xs",
            "transition-all duration-500 group-hover:scale-110",
            isBlue
              ? "bg-brand-blue-50 text-brand-blue-600 group-hover:bg-brand-blue-100"
              : "",
            isYellow
              ? "bg-brand-yellow-50 text-brand-yellow-600 group-hover:bg-brand-yellow-100"
              : "",
          ].join(" ")}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.75} />
          {/* Ring accent on hover */}
          <div
            className={[
              "absolute inset-0 rounded-xl ring-0 transition-all duration-500",
              isBlue
                ? "group-hover:ring-2 group-hover:ring-brand-blue-200"
                : "",
              isYellow
                ? "group-hover:ring-2 group-hover:ring-brand-yellow-300"
                : "",
            ].join(" ")}
          />
        </div>

        {/* Number */}
        <div className="flex items-baseline justify-center gap-0.5 mb-1">
          <span
            className={[
              "text-[2.625rem] md:text-[3.25rem] font-black leading-none tracking-[-0.04em]",
              isBlue ? "text-brand-blue-700" : "",
              isYellow ? "text-brand-yellow-700" : "",
            ].join(" ")}
          >
            <AnimatedCounter
              value={stat.value}
              trigger={trigger}
              delay={0.5 + index * 0.1}
            />
          </span>
          {stat.suffix && (
            <span
              className={[
                "text-2xl md:text-3xl font-black leading-none tracking-[-0.03em]",
                isBlue ? "text-brand-blue-500" : "",
                isYellow ? "text-brand-yellow-500" : "",
              ].join(" ")}
            >
              {stat.suffix}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-ink-500 uppercase tracking-[0.12em] mt-2">
          {stat.label}
        </p>

        {/* Sublabel */}
        <p
          className={[
            "text-[0.6rem] md:text-[0.65rem] font-semibold tracking-wide mt-0.5",
            isBlue ? "text-brand-blue-400" : "",
            isYellow ? "text-brand-yellow-500" : "",
          ].join(" ")}
        >
          {stat.sublabel}
        </p>

        {/* Description — hover reveal desktop */}
        <p className="hidden md:block text-[0.7rem] text-ink-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400 leading-relaxed max-w-[140px]">
          {stat.description}
        </p>

        {/* Bottom accent line */}
        <div
          className={[
            "mt-auto pt-5 h-[2px] w-6 rounded-full transition-all duration-500 group-hover:w-10",
            isBlue ? "bg-brand-blue-200 group-hover:bg-brand-blue-500" : "",
            isYellow
              ? "bg-brand-yellow-200 group-hover:bg-brand-yellow-500"
              : "",
          ].join(" ")}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────
export default function StatsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 bg-white border-b border-brand-blue-100 overflow-hidden"
    >
      {/* Background glows — biru kanan atas, kuning kiri bawah */}
      <div
        className="absolute -top-1/4 right-0 w-[600px] h-[600px] translate-x-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,237,255,0.65) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 left-0 w-[500px] h-[500px] -translate-x-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(254,243,199,0.5) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-12 md:space-y-14">
          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {STATS.map((stat, i) => (
              <StatCard key={stat.id} stat={stat} index={i} trigger={inView} />
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center items-center gap-2.5 md:gap-3"
          >
            {TRUST_BADGES.map(({ icon: BadgeIcon, label, pulse }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-50 rounded-full border border-brand-blue-100 hover:border-brand-blue-300 hover:bg-brand-blue-50 transition-all duration-300 cursor-default"
              >
                {pulse ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                ) : BadgeIcon ? (
                  <BadgeIcon
                    className="w-3 h-3 shrink-0 text-brand-blue-500"
                    strokeWidth={2}
                  />
                ) : null}
                <span className="text-[0.6rem] md:text-[0.65rem] font-bold text-ink-700 uppercase tracking-[0.1em] whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
