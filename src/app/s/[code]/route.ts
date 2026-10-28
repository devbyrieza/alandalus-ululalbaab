import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken } from "@/lib/utils/magic-link";
import { createHmac } from "crypto";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  let baseOrigin = "";
  if (host && !host.startsWith("0.0.0.0") && !host.startsWith("127.0.0.1") && !host.startsWith("localhost")) {
    baseOrigin = `${proto}://${host}`;
  } else {
    baseOrigin = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
  }
  if (!baseOrigin) {
    try {
      baseOrigin = new URL(req.url).origin;
    } catch {
      baseOrigin = "https://spmb.pesantren-ululalbaab.com";
    }
  }

  try {
    const { code } = await params;
    
    if (!code || !code.includes("-")) {
      return NextResponse.redirect(new URL("/login?error=Link_tidak_valid", baseOrigin));
    }

    const [nomor_pendaftaran, hash] = code.split("-");

    // Reconstruct the expected hash
    const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
      .update(nomor_pendaftaran)
      .digest("hex")
      .slice(0, 8);

    if (hash !== expectedHash) {
      return NextResponse.redirect(new URL("/login?error=Link_tidak_valid", baseOrigin));
    }

    // Hash is valid, let's find the pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran },
      select: { id: true, user_id: true, nama_lengkap: true }
    });

    if (!pendaftar) {
      return NextResponse.redirect(new URL("/login?error=Pendaftar_tidak_ditemukan", baseOrigin));
    }

    const authId = pendaftar.user_id || pendaftar.id;

    // Determine redirect target based on query param, default to seragam
    const url = new URL(req.url, baseOrigin);
    const targetQuery = url.searchParams.get("t");
    let redirectPath = "/dashboard/pendaftar/seragam";
    
    if (targetQuery === "jadwal") {
      redirectPath = "/dashboard/pendaftar/jadwal";
    }
    // Add more types here in the future if needed

    // Generate the actual magic token (valid for 48 hours)
    const token = generateMagicToken(
      authId,
      "pendaftar",
      pendaftar.nama_lengkap,
      48,
      redirectPath
    );

    // Redirect to the internal magic auth handler
    return NextResponse.redirect(new URL(`/api/auth/magic?token=${token}`, baseOrigin));
  } catch (error) {
    console.error("Short Link Error:", error);
    return NextResponse.redirect(new URL("/login?error=Terjadi_kesalahan", baseOrigin));
  }
}
