"use client";

import { Rocket, Shield, Target, Monitor, Zap, TreePine, Waves, FileText, PenTool, Trophy, Dumbbell, Play, Palette, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

interface ExtraItem {
    name: string;
    icon: any;
    accent: 'blue' | 'yellow' | 'sand';
}

const EXTRA_ACTIVITIES: ExtraItem[] = [
    { name: "Karate", icon: Trophy, accent: "blue" },
    { name: "Pramuka", icon: Shield, accent: "yellow" },
    { name: "Panahan", icon: Target, accent: "blue" },
    { name: "Futsal", icon: Trophy, accent: "yellow" },
    { name: "Volly", icon: Trophy, accent: "blue" },

    { name: "Komputer", icon: Monitor, accent: "yellow" },
    { name: "Design Grafis", icon: Palette, accent: "blue" },
    { name: "Kaligrafi", icon: PenTool, accent: "yellow" },
    { name: "Jurnalistik", icon: FileText, accent: "blue" },
    { name: "Konten Kreator", icon: Play, accent: "yellow" },

    { name: "Basket", icon: Dumbbell, accent: "blue" },
    { name: "Bulutangkis", icon: Zap, accent: "yellow" },
    { name: "Pertanian", icon: TreePine, accent: "yellow" },
    { name: "Periklanan", icon: Waves, accent: "blue" },
    { name: "Web Programming", icon: Rocket, accent: "yellow" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ExtraSection() {
    return (
        <section id="ekstrakurikuler" className="section-alt relative border-y border-brand-blue-100 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
            <div
                className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{ background: "radial-gradient(circle, rgba(254,243,199,0.3) 0%, transparent 60%)" }}
            />

            <Container className="relative z-10">
                <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-yellow-200 text-brand-blue-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
                    >
                        <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span>Minat & Bakat</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
                        className="section-title mb-4"
                    >
                        Ekstrakurikuler <span className="text-gradient-blue">Terpadu</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
                        className="section-subtitle mx-auto"
                    >
                        Mengembangkan potensi santri secara holistik melalui berbagai pilihan kegiatan yang mendukung kemandirian, kreativitas, dan fisik yang kuat.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {EXTRA_ACTIVITIES.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-20px" }}
                            transition={{ delay: idx * 0.04, duration: 0.5, ease: EASE }}
                            className="bg-white p-6 rounded-2xl border border-brand-blue-100 flex flex-col items-center justify-center text-center group hover:border-brand-blue-200 shadow-premium-sm hover:shadow-premium-md transition-all duration-400 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform duration-400 relative z-10 ${
                                item.accent === 'blue' ? 'bg-brand-blue-50 text-brand-blue-600' :
                                item.accent === 'yellow' ? 'bg-brand-yellow-50 text-brand-yellow-700' :
                                'bg-brand-blue-50/50 text-brand-blue-600'
                            }`}>
                                <item.icon className="w-6 h-6" strokeWidth={1.8} />
                            </div>
                            
                            <p className="text-[0.65rem] font-black tracking-[0.12em] text-ink-900 uppercase group-hover:text-brand-blue-800 transition-colors leading-tight relative z-10">
                                {item.name}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}