import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/utils/magic-link";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=Token_hilang", request.url),
      );
    }

    // 1. Verify token mathematically (stateless)
    const verification = verifyMagicToken(token);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "/daftar";

    if (!verification.valid || !verification.data) {
      // Decode URI components for safe passage
      const errReason = encodeURIComponent(
        verification.reason || "Token_tidak_valid",
      );
      return NextResponse.redirect(
        new URL(`/login?error=${errReason}`, baseUrl),
      );
    }

    const { id, role, full_name, redirect } = verification.data;

    // 3. Check if user needs PIN (has phone number)
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.profile.findUnique({
      where: { id },
      select: { phone: true } });

    // If user has a valid phone number, they MUST verify PIN
    if (user && user.phone && user.phone !== "-" && user.phone.length > 5) {
      const pinUrl = new URL("/auth/verify-pin", baseUrl);
      pinUrl.searchParams.set("token", token);
      return NextResponse.redirect(pinUrl);
    }

    // 4. Fallback: Build secure cookie directly if no PIN protection is active
    const targetUrl = redirect || "/dashboard/penguji/input-nilai";

    // Use the robust base URL
    const response = NextResponse.redirect(new URL(targetUrl, baseUrl));

    response.cookies.set(
      "al_session",
      JSON.stringify({
        role: role,
        id: id,
        full_name: full_name }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
        maxAge: 60 * 60 * 24 * 90,
          expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000), // 90 Days Persistent Session
      },
    );

    return response;
  } catch (error) {
    console.error("Magic Link Error:", error);
    return NextResponse.redirect(
      new URL("/login?error=Terjadi_kesalahan_server", request.url),
    );
  }
}
