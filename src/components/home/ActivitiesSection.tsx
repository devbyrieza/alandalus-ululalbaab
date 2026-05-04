"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Users, Trophy, Shield, Target, Monitor, Zap,
    TreePine, Waves, FileText, PenTool, Dumbbell,
    Play, Palette, Sparkles, ArrowRight,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────
type ActivityColor = 'blue' | 'yellow' | 'gold';

interface Activity {
    name: string;
    description: string;
    image: string;
    badge: string;
}

interface ExtraActivity {
    name: string;
    icon: React.ElementType;
    color: ActivityColor;
}

// ─── Data ────────────────────────────────────────────
const ACTIVITIES: Activity[] = [
    {
        name: "Pembelajaran Aktif",
        badge: "Akademik",
        description: "Metode interaktif yang memadukan teori dan praktik syar'i guna mengoptimalkan potensi akademik santri secara mendalam.",
        image: "/images/pembelajaran-kitab-turotz.webp",
    },
    {
        name: "Kegiatan Rutin Harian",
        badge: "Spiritual",
        description: "Pembiasaan ibadah melalui sholat berjamaah tepat waktu dan halaqah tahfidz Al-Qur'an setiap hari secara konsisten.",
        image: "/images/tahfidz.webp",
    },
    {
        name: "Ekstrakurikuler Unggulan",
        badge: "15+ Pilihan",
        description: "Tersedia 15+ pilihan kegiatan mulai dari beladiri hingga Desain Grafis untuk mengasah minat dan bakat santri.",
        image: "/images/extra-karate.webp",
    },
    {
        name: "Kemandirian & Skill",
        badge: "Life Skills",
        description: "Program pelatihan entrepreneurship dan keterampilan hidup mandiri guna mencetak santri yang siap berdikari di masa depan.",
        image: "/images/luar-kelas.webp",
    },
];

const EXTRA_ACTIVITIES: ExtraActivity[] = [
    { name: "Karate", icon: Trophy, color: "blue" },
    { name: "Pramuka", icon: Shield, color: "yellow" },
    { name: "Panahan", icon: Target, color: "blue" },
    { name: "Futsal", icon: Trophy, color: "gold" },
    { name: "Volly", icon: Trophy, color: "blue" },
    { name: "Komputer", icon: Monitor, color: "yellow" },
    { name: "Design Grafis", icon: Palette, color: "blue" },
    { name: "Kaligrafi", icon: PenTool, color: "gold" },
    { name: "Jurnalistik", icon: FileText, color: "blue" },
    { name: "Konten Kreator", icon: Play, color: "yellow" },
    { name: "Basket", icon: Dumbbell, color: "blue" },
    { name: "Bulutangkis", icon: Zap, color: "gold" },
    { name: "Pertanian", icon: TreePine, color: "yellow" },
    { name: "Periklanan", icon: Waves, color: "blue" },
    { name: "Web Programming", icon: Sparkles, color: "gold" },
];

// ─── Activity Card ────────────────────────────────────
function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{
                delay: index * 0.09,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="group flex flex-col bg-white rounded-2xl border border-brand-blue-100 shadow-premium-sm overflow-hidden transition-all duration-500 ease-spring hover:-translate-y-2 hover:shadow-premium-md hover:border-brand-blue-200"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden shrink-0 bg-brand-blue-50">
                <Image
                    src={activity.image}
                    alt={activity.name}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay — biru untuk ululalbaab */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-950/50 via-brand-blue-950/10 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[0.6rem] font-bold text-brand-blue-700 uppercase tracking-widest border border-brand-blue-100/50 shadow-sm">
                        {activity.badge}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col grow p-6 md:p-7">
                <h3 className="text-base md:text-lg font-bold text-ink-900 mb-2.5 tracking-tight leading-snug group-hover:text-brand-blue-700 transition-colors duration-300">
                    {activity.name}
                </h3>
                <p className="text-[0.8125rem] md:text-sm text-ink-500 leading-relaxed grow font-[450]">
                    {activity.description}
                </p>

                {/* Bottom accent — biru */}
                <div className="mt-5 pt-4 border-t border-brand-blue-50 flex items-center justify-between">
                    <div className="h-[2px] w-5 rounded-full bg-brand-blue-200 group-hover:w-10 group-hover:bg-brand-blue-500 transition-all duration-500" />
                    <span className="text-[0.65rem] font-bold text-brand-blue-300 uppercase tracking-widest group-hover:text-brand-blue-500 transition-colors duration-300">
                        Selengkapnya
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Extra Activity Chip ──────────────────────────────
function ExtraChip({ item, index }: { item: ExtraActivity; index: number }) {
    const Icon = item.icon;

    const colorMap = {
        blue: 'bg-brand-blue-50 text-brand-blue-600 group-hover:bg-brand-blue-100 ring-brand-blue-200',
        yellow: 'bg-brand-yellow-50 text-brand-yellow-600 group-hover:bg-brand-yellow-100 ring-brand-yellow-300',
        gold: 'bg-gold-50 text-gold-600 group-hover:bg-gold-100 ring-gold-200',
    };

    const textHoverMap = {
        blue: 'group-hover:text-brand-blue-800',
        yellow: 'group-hover:text-brand-yellow-700',
        gold: 'group-hover:text-gold-700',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{
                delay: index * 0.025,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="group flex flex-col items-center justify-center gap-3 p-5 md:p-6 bg-white rounded-2xl border border-brand-blue-100 hover:border-brand-blue-200 hover:shadow-premium-sm hover:bg-surface-50 transition-all duration-400 cursor-default"
        >
            <div className={[
                'w-12 h-12 md:w-13 md:h-13 rounded-xl flex items-center justify-center shadow-xs',
                'transition-all duration-400 group-hover:scale-110',
                'ring-1 ring-transparent group-hover:ring-2',
                colorMap[item.color],
            ].join(' ')}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.75} />
            </div>
            <p className={[
                'text-[0.6rem] md:text-[0.65rem] font-bold text-ink-700 uppercase tracking-widest leading-tight text-center transition-colors duration-300',
                textHoverMap[item.color],
            ].join(' ')}>
                {item.name}
            </p>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────
export default function ActivitiesSection() {
    return (
        <section id="kegiatan" className="section-alt relative border-y border-brand-blue-100/60">

            {/* Subtle background texture — biru */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.018]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230369C7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Ambient glow — biru di atas, kuning di bawah */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -translate-y-1/2 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, rgba(220,237,255,0.65) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] translate-y-1/2 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, rgba(254,243,199,0.4) 0%, transparent 70%)',
                }}
            />

            <Container className="relative z-10">

                {/* ── Section Header ── */}
                <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-blue-100 text-brand-blue-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-6 shadow-xs"
                    >
                        <Users className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span>Kegiatan Santri</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="section-title mb-5 text-balance"
                    >
                        Kegiatan{" "}
                        <span className="text-gradient-blue">Bervariasi & Edukatif</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="section-subtitle"
                    >
                        Berbagai kegiatan positif untuk mengembangkan potensi santri dalam bidang
                        akademik, spiritual, dan kemandirian sosial.
                    </motion.p>
                </div>

                {/* ── Main Activities Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-20 md:mb-24">
                    {ACTIVITIES.map((activity, idx) => (
                        <ActivityCard key={activity.name} activity={activity} index={idx} />
                    ))}
                </div>

                {/* ── Extracurriculars ── */}
                <div className="mb-16 md:mb-20">

                    {/* Sub-header */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-10 md:mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
                            <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>Minat & Bakat</span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-ink-900 tracking-tight mb-3">
                            Ekstrakurikuler{" "}
                            <span className="text-gradient-blue">Terpadu</span>
                        </h3>

                        <p className="text-sm md:text-[0.9375rem] text-ink-500 font-[450] max-w-xl mx-auto leading-relaxed">
                            Mengembangkan potensi santri secara holistik melalui berbagai pilihan
                            kegiatan yang mendukung kemandirian, kreativitas, dan fisik yang kuat.
                        </p>
                    </motion.div>

                    {/* Chips grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                        {EXTRA_ACTIVITIES.map((item, idx) => (
                            <ExtraChip key={item.name} item={item} index={idx} />
                        ))}
                    </div>
                </div>

                {/* ── CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center"
                >
                    <Link href="/kegiatan">
                        <button className="btn-secondary inline-flex items-center gap-2.5 px-10 group/btn">
                            <span>Lihat Semua Kegiatan</span>
                            <ArrowRight
                                className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                                strokeWidth={2}
                            />
                        </button>
                    </Link>
                </motion.div>

            </Container>
        </section>
    );
}