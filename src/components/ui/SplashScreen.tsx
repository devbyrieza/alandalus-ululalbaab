"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BRANDING } from '@/config/branding';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Jika sudah pernah muncul di sesi ini, langsung sembunyikan
    try {
      if (sessionStorage.getItem('splashShown')) {
        setShow(false);
        return;
      }
    } catch {
      // Ignore sessionStorage error in restricted environments
    }

    let timer: NodeJS.Timeout;

    // Sembunyikan splash screen
    const hideSplash = () => {
      timer = setTimeout(() => {
        setShow(false);
        try {
          sessionStorage.setItem('splashShown', 'true');
        } catch {}
      }, 400);
    };

    // Hard fallback: Maksimal 1.2 detik splash screen WAJIB hilang agar tidak pernah stuck loading
    const hardTimeout = setTimeout(hideSplash, 1200);

    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash, { once: true });
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(hardTimeout);
      window.removeEventListener('load', hideSplash);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center overscroll-contain"
        >
          <div className="relative flex items-center justify-center">
            {/* Spinning Ring */}
            <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-100 border-t-[#0369a1] animate-spin"></div>
            
            {/* Logo */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center p-2">
              <Image 
                src={BRANDING.logoPath} 
                alt="Logo" 
                fill 
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="mt-8 text-slate-500 font-medium text-sm tracking-widest uppercase"
          >
            Memuat Sistem...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
