'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BRANDING } from '@/config/branding';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Jika sudah pernah muncul di sesi ini, langsung sembunyikan
    if (sessionStorage.getItem('splashShown')) {
      setShow(false);
      return;
    }

    // Hide splash screen after window loaded and a slight delay
    const hideSplash = () => {
      setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 800);
    };

    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
      return () => window.removeEventListener('load', hideSplash);
    }
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
            <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
            
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
             transition={{ delay: 0.3 }}
             className="mt-8 text-slate-500 font-medium text-sm tracking-widest uppercase"
          >
            Memuat Sistem...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
