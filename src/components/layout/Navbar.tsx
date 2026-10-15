"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  BookOpen,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { scrollToTop, navigateToDetail } from "@/lib/navigation-scroll";
import { BRANDING } from "@/config/branding";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

/* ─────────────────────────── Konfigurasi ─────────────────────────── */

// Satu sumber teks supaya desktop & mobile tidak berbeda.
// TODO: pindahkan ke BRANDING (mis. BRANDING.managedBy) bila sudah ada.
const MANAGED_BY = "Managed by Al Andalus IIBS";
const REGISTER_LABEL = "Daftar SPMB";
const REGISTER_HREF = "/ppdb";

// Subdomain pendaftaran yang harus diarahkan balik ke domain utama.
const REGISTRATION_SUBDOMAINS = ["ppdb.", "spmb."];

type SubItem = {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  tone: "primary" | "secondary";
};

type NavLink = {
  href: string;
  label: string;
  /** Section pada halaman beranda untuk scroll-navigasi */
  section?: string;
  children?: SubItem[];
};

const TONE_CLASS: Record<SubItem["tone"], string> = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
};

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang", section: "#about" },
  {
    href: "/program",
    label: "Program",
    section: "#program",
    children: [
      {
        href: "/program#mts",
        label: "MTs (Setara SMP)",
        desc: "Program menengah pertama berfokus pada tahfidz dan adab dasar.",
        icon: BookOpen,
        tone: "primary",
      },
      {
        href: "/program#il",
        label: "I'dad Lughowi (IL)",
        desc: "Program pemantapan bahasa Arab sebelum jenjang Aliyah.",
        icon: Star,
        tone: "secondary",
      },
    ],
  },
  { href: "/fasilitas", label: "Fasilitas", section: "#fasilitas" },
  { href: "/kegiatan", label: "Kegiatan", section: "#kegiatan" },
  { href: "/galeri", label: "Galeri", section: "#gallery" },
  { href: "/kontak", label: "Kontak", section: "#kontak" },
];

/* ─────────────────────────── Helper ─────────────────────────── */

/** Mengembalikan domain utama bila sedang berada di subdomain pendaftaran. */
function getMainDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const prefix = REGISTRATION_SUBDOMAINS.find((p) => host.startsWith(p));
  return prefix ? host.slice(prefix.length) : null;
}

/** True bila perangkat punya pointer hover (mouse/trackpad); false untuk layar sentuh. */
function canHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches
  );
}

const desktopLinkClass = (active: boolean) =>
  `px-3 py-2 text-sm font-bold rounded-full transition-all duration-300 min-h-[40px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
    active
      ? "bg-primary-50 text-primary-900 font-extrabold shadow-sm"
      : "text-ink-600 hover:text-primary-900 hover:bg-primary-50/50"
  }`;

/* ─────────────────────────── Komponen ─────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const megaRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileProgramOpen, setMobileProgramOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* Scroll state */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Status sesi (dicek ulang tiap pindah halaman, mis. setelah login) */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setIsLoggedIn(Boolean(data?.session));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch session:", error);
        }
      }
    })();
    return () => controller.abort();
  }, [pathname]);

  /* Kunci scroll body saat menu mobile terbuka (kembalikan nilai awal) */
  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  /* Tutup semua menu saat pindah halaman */
  useEffect(() => {
    setIsMenuOpen(false);
    setMegaOpen(false);
    setMobileProgramOpen(false);
  }, [pathname]);

  /* Tutup dengan tombol Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setMegaOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Sentuh di luar mega menu menutupnya (layar sentuh tidak punya mouseleave) */
  useEffect(() => {
    if (!megaOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [megaOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  /* ── Navigasi ── */

  const handleBerandaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const mainDomain = getMainDomain();
    if (mainDomain) {
      window.location.href = `https://${mainDomain}/`;
      return;
    }

    if (pathname === "/") {
      scrollToTop();
    } else {
      sessionStorage.removeItem("scroll_to_section");
      sessionStorage.removeItem("scroll_to_position");
      window.location.href = "/";
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: { href: string; section?: string },
  ) => {
    if (link.href === "/") {
      handleBerandaClick(e);
      return;
    }

    const mainDomain = getMainDomain();
    if (mainDomain) {
      e.preventDefault();
      window.location.href = `https://${mainDomain}${link.href}`;
      return;
    }

    if (link.section) {
      e.preventDefault();
      navigateToDetail(link.href, link.section);
    }
  };

  const closeMobile = () => setIsMenuOpen(false);

  /* ── Tombol aksi (dipakai desktop & mobile) ── */

  const registerButtonDesktop = (
    <Link
      href={REGISTER_HREF}
      className="btn-primary flex items-center gap-1.5 group text-xs xl:text-sm font-black px-3.5 xl:px-5 py-2 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all glow-ring-primary"
    >
      <span>{REGISTER_LABEL}</span>
      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );

  const sheetTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, damping: 28, stiffness: 320 };

  return (
    <>
      <header
        id="main-header"
        className="fixed w-full top-0 left-0 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-3 z-50"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div
            className={`backdrop-blur-xl border border-white/40 rounded-full px-5 sm:px-6 flex items-center justify-between transition-all duration-300 ${
              isScrolled
                ? "bg-white/90 py-1.5 sm:py-2 shadow-xl shadow-blue-500/15"
                : "bg-white/80 py-2 sm:py-2.5 shadow-2xl shadow-blue-500/10"
            }`}
          >
            {/* ── Logo ── */}
            <Link
              href="/"
              onClick={handleBerandaClick}
              aria-label={`${BRANDING.schoolShortName} — Beranda`}
              className="flex items-center gap-2.5 sm:gap-3 group min-w-0 xl:shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center border overflow-hidden bg-white transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 ${
                    isScrolled
                      ? "border-primary/20 shadow-xl shadow-primary/10"
                      : "border-white/70 shadow-[0_2px_12px_rgba(3,105,199,0.12)]"
                  }`}
                >
                  <Image
                    src={BRANDING.logoPath}
                    alt={`Logo ${BRANDING.schoolName}`}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain p-0.5"
                    priority
                    sizes="44px"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--color-primary-600)] border-2 border-white rounded-full z-10 shadow-sm" />
              </div>

              <div className="min-w-0 xl:shrink-0">
                {/* <span>, bukan <h1>: judul utama halaman milik konten halaman */}
                <span className="block truncate text-sm sm:text-base font-black leading-tight tracking-tight text-[var(--color-ink-900)] xl:whitespace-normal xl:line-clamp-2 xl:max-w-[10rem] xl:leading-[1.15]">
                  {BRANDING.schoolShortName}
                </span>
                <span className="block truncate max-[359px]:hidden xl:max-w-[10rem] text-[8.5px] sm:text-[9.5px] font-bold text-[var(--color-ink-400)] uppercase tracking-wider mt-0.5 leading-none">
                  {MANAGED_BY}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav (xl+) ── */}
            <nav
              aria-label="Navigasi utama"
              className={`hidden xl:flex items-center gap-0.5 p-1.5 rounded-full border bg-white transition-all duration-300 ${
                isScrolled
                  ? "border-[var(--color-primary-100)] shadow-sm"
                  : "border-white/65 shadow-[0_2px_16px_rgba(3,105,199,0.10)]"
              }`}
            >
              {NAV_LINKS.map((link) => {
                if (!link.children) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={desktopLinkClass(isActive(link.href))}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={megaRef}
                    onMouseEnter={() => canHover() && setMegaOpen(true)}
                    onMouseLeave={() => canHover() && setMegaOpen(false)}
                    onFocus={() => canHover() && setMegaOpen(true)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setMegaOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      aria-haspopup="menu"
                      onClickCapture={(e) => {
                        if (!canHover() && !megaOpen) {
                          e.preventDefault();
                          e.stopPropagation();
                          setMegaOpen(true);
                        }
                      }}
                      aria-expanded={megaOpen}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={desktopLinkClass(isActive(link.href))}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          megaOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Link>

                    <AnimatePresence>
                      {megaOpen && (
                        <motion.div
                          initial={
                            reduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 10, scale: 0.95 }
                          }
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={
                            reduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 10, scale: 0.95 }
                          }
                          transition={{ duration: reduceMotion ? 0 : 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] z-50"
                        >
                          <div className="mega-menu-content p-6 grid grid-cols-2 gap-6 relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-surface-100" />

                            {link.children.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={(e) => {
                                    handleNavClick(e, { href: item.href });
                                    setMegaOpen(false);
                                  }}
                                  className="group/item relative p-3.5 rounded-2xl border border-transparent hover:bg-primary-50 hover:border-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 transition-colors"
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div
                                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110 ${TONE_CLASS[item.tone]}`}
                                    >
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-ink-900 group-hover/item:text-primary-700">
                                      {item.label}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-ink-500">
                                    {item.desc}
                                  </p>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* ── CTA (xl+) ── */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="text-xs xl:text-sm font-bold text-[var(--color-ink-700)] hover:text-[var(--color-primary-800)] px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span className="relative flex h-2 w-2 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Masuk ke Akun
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs xl:text-sm font-bold text-[var(--color-ink-600)] hover:text-[var(--color-primary-800)] transition-colors duration-200 px-3 py-2 rounded-full hover:bg-[var(--color-primary-50)]"
                >
                  Masuk
                </Link>
              )}
              {registerButtonDesktop}
            </div>

            {/* ── Hamburger (di bawah xl) ── */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className={`xl:hidden p-2 sm:p-2.5 rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                isScrolled
                  ? "bg-white border-[var(--color-primary-100)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] shadow-[var(--shadow-xs)]"
                  : "bg-white/85 border-white/70 text-[var(--color-ink-800)] hover:bg-white/95 shadow-[0_2px_12px_rgba(3,105,199,0.10)]"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  >
                    <Menu className="w-5 h-5 stroke-[2.5]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ── Menu Mobile — Bottom Sheet ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 xl:hidden overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--color-primary-950)]/40 backdrop-blur-[2px]"
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={sheetTransition}
              className="absolute bottom-0 inset-x-0 rounded-t-[2rem] overflow-hidden max-h-[88dvh] flex flex-col"
              style={{
                background:
                  "linear-gradient(180deg, var(--color-surface-50) 0%, #fff 100%)",
                borderTop: "1px solid var(--color-primary-100)",
                boxShadow: "0 -8px 40px rgba(3,105,199,0.10)",
              }}
            >
              {/* Handle */}
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Tutup menu"
                className="w-full flex justify-center pt-4 pb-2 flex-shrink-0"
              >
                <span className="w-10 h-1 bg-[var(--color-primary-200)] rounded-full" />
              </button>

              {/* Identitas sekolah */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-primary-50)] flex-shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex items-center justify-center overflow-hidden">
                  <Image
                    src={BRANDING.logoPath}
                    alt=""
                    width={36}
                    height={36}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[var(--color-ink-900)] leading-none">
                    {BRANDING.schoolShortName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/50 truncate mt-1">
                    {MANAGED_BY}
                  </p>
                </div>
              </div>

              {/* Navigasi */}
              <nav
                aria-label="Navigasi seluler"
                className="overflow-y-auto flex-1 px-4 py-4 pb-safe overscroll-contain custom-scrollbar"
              >
                <p className="text-[10px] font-black text-[var(--color-ink-400)] uppercase tracking-[0.12em] px-3 mb-3">
                  Navigasi
                </p>

                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => {
                    const active = isActive(link.href);
                    const rowClass = `flex-1 px-4 py-4 rounded-2xl text-base font-bold transition-all min-h-[56px] flex items-center justify-between ${
                      active
                        ? "bg-primary-50 text-primary-900 font-extrabold shadow-sm"
                        : "text-[var(--color-ink-800)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                    }`;

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : i * 0.04,
                          duration: reduceMotion ? 0 : 0.22,
                        }}
                      >
                        <div className="flex items-stretch gap-1">
                          <Link
                            href={link.href}
                            onClick={(e) => {
                              handleNavClick(e, link);
                              closeMobile();
                            }}
                            aria-current={active ? "page" : undefined}
                            className={rowClass}
                          >
                            <span>{link.label}</span>
                            {active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-300)]/70" />
                            )}
                          </Link>

                          {link.children && (
                            <button
                              type="button"
                              onClick={() => setMobileProgramOpen((v) => !v)}
                              aria-label={`Buka submenu ${link.label}`}
                              aria-expanded={mobileProgramOpen}
                              className="w-14 shrink-0 rounded-2xl flex items-center justify-center text-[var(--color-ink-600)] hover:bg-[var(--color-primary-50)] transition-colors"
                            >
                              <ChevronDown
                                className={`w-5 h-5 transition-transform duration-300 ${
                                  mobileProgramOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {link.children && (
                          <AnimatePresence initial={false}>
                            {mobileProgramOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: reduceMotion ? 0 : 0.22,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 pl-3 mt-1 mb-1 border-l-2 border-[var(--color-primary-100)] flex flex-col gap-1">
                                  {link.children.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={(e) => {
                                          handleNavClick(e, {
                                            href: item.href,
                                          });
                                          closeMobile();
                                        }}
                                        className="flex items-start gap-3 p-3 rounded-2xl hover:bg-[var(--color-primary-50)] transition-colors"
                                      >
                                        <span
                                          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${TONE_CLASS[item.tone]}`}
                                        >
                                          <Icon className="w-4 h-4" />
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block text-sm font-bold text-[var(--color-ink-900)]">
                                            {item.label}
                                          </span>
                                          <span className="block text-xs text-[var(--color-ink-500)] mt-0.5">
                                            {item.desc}
                                          </span>
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-primary-100)] to-transparent my-5" />

                <div className="flex flex-col gap-2.5">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/login"}
                    onClick={closeMobile}
                    className="w-full py-3 text-sm font-bold rounded-2xl border border-[var(--color-primary-100)] text-[var(--color-primary-800)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] text-center transition-all min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoggedIn ? (
                      <>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:animate-none" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span>Masuk ke Akun (Dashboard)</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <span>Masuk ke Akun</span>
                    )}
                  </Link>

                  <Link
                    href={REGISTER_HREF}
                    onClick={closeMobile}
                    className="btn-primary w-full justify-center gap-2 min-h-[48px]"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {REGISTER_LABEL} Online
                  </Link>
                </div>

                <div className="h-6" />
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}