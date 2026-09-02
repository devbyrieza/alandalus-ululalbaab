"use client";

import Link from "next/link";
import {
  Youtube,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Twitter,
  Globe,
  ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { BRANDING } from "@/config/branding";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { Icon: Instagram, href: BRANDING.igUrl, label: "Instagram" },
    { Icon: Youtube, href: BRANDING.ytUrl, label: "YouTube" },
    { Icon: Facebook, href: BRANDING.fbUrl, label: "Facebook" },
    { Icon: Twitter, href: BRANDING.twitterUrl ?? "#", label: "Twitter / X" },
  ];

  const lembagaLinks = [
    { label: "Tentang Kami", href: "/tentang" },
    { label: "Program Studi", href: "/program" },
    { label: "Fasilitas", href: "/fasilitas" },
    { label: "Kegiatan Santri", href: "/kegiatan" },
  ];

  const infoLinks = [
    { label: "Pendaftaran PPDB", href: "/daftar" },
    { label: "Biaya Pendidikan", href: "/daftar#biaya" },
    { label: "Kalender Akademik", href: "/kalender" },
  ];

  return (
    <footer
      className="relative overflow-hidden pt-20 pb-28 md:pb-14"
      style={{
        background:
          "linear-gradient(160deg, var(--color-primary-900) 0%, var(--color-primary-950) 55%, #010E28 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* â”€â”€ Decorative orbs â€” blue + yellow (energik, dua warna) â”€â”€ */}
      {/* Orb utama: biru cerah kanan-atas */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"
        style={{
          background:
            "radial-gradient(circle, rgba(3,105,199,0.22) 0%, transparent 70%)" }}
      />
      {/* Orb aksen: kuning kiri-bawah â€” signature Ulul Albaab */}
      <div
        className="absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)" }}
      />
      {/* Orb kecil aksen tengah-kiri */}
      <div
        className="absolute top-1/2 left-1/4 w-[160px] h-[160px] rounded-full pointer-events-none -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(14,134,232,0.08) 0%, transparent 70%)" }}
      />
      {/* Topline shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.25) 50%, transparent 100%)" }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 mb-16">
          {/* â”€â”€ Brand Info â”€â”€ */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-secondary-200) 0%, var(--color-secondary-400) 100%)",
                  boxShadow: "0 4px 20px rgba(251,191,36,0.30)" }}
              >
                <Image
                  src={BRANDING.logoPath}
                  alt={`Logo ${BRANDING.schoolName}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                  {BRANDING.schoolLegalName}
                </h3>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mt-1.5"
                  style={{ color: "var(--color-secondary-400)" }}
                >
                  Pesantren Modern International
                </p>
              </div>
            </Link>

            <p
              className="font-medium leading-relaxed max-w-xs text-sm"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Membangun generasi Qur&apos;ani yang cerdas &amp; berakhlak mulia
              melalui sistem terintegrasi Al Andalus.
            </p>

            {/* Social Links */}
            <div className="flex gap-2.5">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "var(--color-secondary-400)";
                    el.style.borderColor = "var(--color-secondary-400)";
                    el.style.color = "var(--color-primary-950)";
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = "0 6px 16px rgba(251,191,36,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.06)";
                    el.style.borderColor = "rgba(255,255,255,0.10)";
                    el.style.color = "rgba(255,255,255,0.55)";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>

          {/* â”€â”€ Lembaga Links â”€â”€ */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Lembaga
            </h4>
            <ul className="space-y-3.5">
              {lembagaLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold flex items-center gap-1.5 group/link transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.80)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.80)";
                    }}
                  >
                    {item.label}
                    <ArrowUpRight
                      className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all duration-200 flex-shrink-0"
                      style={{ color: "var(--color-secondary-400)" }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* â”€â”€ Informasi Links â”€â”€ */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Informasi
            </h4>
            <ul className="space-y-3.5">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.80)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.80)";
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* â”€â”€ Kontak â”€â”€ */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.12em]"
              style={{ color: "var(--color-secondary-400)" }}
            >
              Kontak Kami
            </h4>
            <div className="space-y-4">
              {/* Alamat */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-secondary-400)" }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <p
                  className="text-sm font-medium leading-relaxed pt-1"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                  dangerouslySetInnerHTML={{
                    __html: BRANDING.address.replace(/,/g, ",<br />") }}
                />
              </div>

              {/* Telepon */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-secondary-400)" }}
                >
                  <Phone className="w-4 h-4" />
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-white">
                    {BRANDING.phone}
                  </p>
                  <p
                    className="text-[11px] font-medium tracking-wide mt-0.5"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    Layanan Pelanggan
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--color-secondary-400)" }}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-white break-all pt-1.5">
                  {BRANDING.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Bottom Bar â”€â”€ */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs font-medium order-2 md:order-1 text-center md:text-left"
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            &copy; {currentYear} {BRANDING.schoolLegalName}. Hak cipta dilindungi
            undang-undang.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-5 order-1 md:order-2">
            {["Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs font-semibold transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.85)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.65)";
                }}
              >
                {item}
              </Link>
            ))}

            {/* Language toggle â€” yellow accent */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.18)",
                color: "var(--color-secondary-400)" }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ID / AR</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}


