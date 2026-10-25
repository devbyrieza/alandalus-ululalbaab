import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Turbopack (default di Next 16) memakai CA sistem agar fetch Google Fonts
    // tidak gagal TLS saat build di Docker/CI.
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    unoptimized: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/pendaftar/ujian-online/:path*',
        destination: '/dashboard/pendaftar/ujian/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
