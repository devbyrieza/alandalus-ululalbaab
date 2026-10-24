import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyExaminerInputCode } from "@/lib/utils/magic-link";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=Link_tidak_valid", req.url));
    }

    const verification = verifyExaminerInputCode(code);
    if (!verification.valid || !verification.profileId) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(verification.reason || "Link_tidak_valid")}`,
          req.url
        )
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { id: verification.profileId },
      select: {
        id: true,
        role: true,
        full_name: true,
        email: true,
        username: true,
        phone: true,
      },
    });

    if (!profile) {
      return NextResponse.redirect(
        new URL("/login?error=Akun_penguji_tidak_ditemukan", req.url)
      );
    }

    const nomorPendaftaran = verification.nomorPendaftaran;
    const targetPath =
      nomorPendaftaran && nomorPendaftaran !== "-"
        ? `/dashboard/penguji/input-nilai?search=${encodeURIComponent(nomorPendaftaran)}`
        : `/dashboard/penguji/input-nilai`;

    const redirectUrl = new URL(targetPath, req.url);
    const response = NextResponse.redirect(redirectUrl);

    const sessionData = {
      role: profile.role || "penguji",
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email || "",
      username: profile.username || "",
      phone: profile.phone || "",
    };

    response.cookies.set("al_session", JSON.stringify(sessionData), {
      path: "/",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" &&
        !req.headers.get("host")?.includes("localhost") &&
        !req.headers.get("host")?.includes("127.0.0.1"),
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000),
    });

    return response;
  } catch (error) {
    console.error("Examiner Direct Link Error:", error);
    return NextResponse.redirect(new URL("/login?error=Terjadi_kesalahan", req.url));
  }
}
