"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function FloatingCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tampilkan setelah scroll melewati 400px (hero section)
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-blue-200/80 shadow-2xl rounded-full p-2 flex items-center gap-2 pointer-events-auto">
            <Link
              href="/ppdb"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-sm text-white bg-primary hover:bg-primary-600 shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Daftar SPMB 2027</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/6281285300800?text=Halo%20Admin%20SPMB%20Pesantren%20Ulul%20Albaab%2C%20saya%20ingin%20konsultasi%20pendaftaran%20santri%20baru"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Konsultasi via WhatsApp"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-600 hover:text-white shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
