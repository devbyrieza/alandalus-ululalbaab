import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ProgressBarProvider from "@/components/providers/ProgressBarProvider";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FONT CONFIGURATIONS - Harisenin & Watzap Style
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Plus_Jakarta_Sans, Inter, Amiri } from "next/font/google";
import { BRANDING } from "@/config/branding";
import SplashScreen from "@/components/ui/SplashScreen";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta" });

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter" });

// Font Arab (dipakai lewat --font-arabic di globals.css)
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri" });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEWPORT (menggantikan <meta name="viewport"> manual)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRANDING.primaryColor,
  colorScheme: "light" };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// METADATA CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const metadata: Metadata = {
  metadataBase: new URL(BRANDING.websiteUrl),

  title: {
    default: `${BRANDING.schoolName} | SPMB 2027/2028`,
    template: `%s | ${BRANDING.schoolName}` },
  description: `Pendaftaran Santri Baru ${BRANDING.schoolName}. Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih.`,
  keywords: [
    BRANDING.schoolName,
    "pesantren sukabumi",
    "ppdb 2027",
    "pendaftaran santri",
    "pesantren salafi",
    "tahfidz quran",
    "pendidikan islam",
  ],

  authors: [{ name: BRANDING.schoolName }],
  creator: BRANDING.schoolName,
  publisher: BRANDING.schoolName,

  formatDetection: {
    email: false,
    address: false,
    telephone: false },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1 } },

  icons: {
    icon: BRANDING.faviconPath,
    apple: "/apple-touch-icon.png",
    shortcut: BRANDING.faviconPath },

  openGraph: {
    title: `${BRANDING.schoolName} | SPMB 2027/2028`,
    description:
      "Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih. Daftar sekarang untuk tahun ajaran 2027/2028.",
    url: BRANDING.websiteUrl,
    siteName: BRANDING.schoolName,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: BRANDING.schoolName },
    ],
    locale: "id_ID",
    type: "website" },

  twitter: {
    card: "summary_large_image",
    title: `${BRANDING.schoolName} | SPMB 2027/2028`,
    description:
      "Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih.",
    images: ["/twitter-image.jpg"],
    creator: "@alandalus_ppdb" },

  // Kode verifikasi Google Search Console: isi lewat env, jangan pakai placeholder.
  // NEXT_PUBLIC_GOOGLE_VERIFICATION=xxxxxxxx
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,

  alternates: {
    canonical: BRANDING.websiteUrl,
    languages: {
      "id-ID": BRANDING.websiteUrl } },

  category: "education",
  classification: "Islamic Education" };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT LAYOUT COMPONENT
// Navbar & Footer dirender di dalam LayoutWrapper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function RootLayout({
  children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" translate="no" className="notranslate" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta
          name="msapplication-navbutton-color"
          content={BRANDING.primaryColor}
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --brand-primary: ${BRANDING.primaryColor};
            --brand-secondary: ${BRANDING.secondaryColor};
          }
        ` }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${amiri.variable} font-sans antialiased bg-white text-ink-900 overflow-x-clip transition-colors duration-500`}
        suppressHydrationWarning
      >
        <SplashScreen />
        <ProgressBarProvider>
          <SmoothScrollProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <LayoutWrapper>{children}</LayoutWrapper>
            </ThemeProvider>
          </SmoothScrollProvider>
        </ProgressBarProvider>
      </body>
    </html>
  );
}