import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try { return JSON.parse(sessionCookie.value); } catch { return null; }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { photo_url, target_id } = body;

    if (!photo_url) {
      return NextResponse.json({ error: "URL foto wajib diisi" }, { status: 400 });
    }

    // Validate it's a base64 image or a valid URL
    const isBase64 = photo_url.startsWith("data:image/");
    const isUrl = photo_url.startsWith("http://") || photo_url.startsWith("https://");
    if (!isBase64 && !isUrl) {
      return NextResponse.json({ error: "Format foto tidak valid" }, { status: 400 });
    }

    // Determine target profile
    let profileId = session.id;
    if (target_id && target_id !== session.id) {
      if (session.role !== "admin_super") {
        return NextResponse.json({ error: "Hanya Admin Super yang dapat mengubah foto akun lain" }, { status: 403 });
      }
      profileId = target_id;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { photo_url, updated_at: new Date() } });

    // Update session cookie if own profile
    if (profileId === session.id) {
      const newSession = { ...session, photo_url: updatedProfile.photo_url };
      const cookieStore = await cookies();
      cookieStore.set("al_session", JSON.stringify(newSession), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
        maxAge: 60 * 60 * 24 * 90 });
    }

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil diperbarui.",
      photo_url: updatedProfile.photo_url });
  } catch (error: any) {
    console.error("POST profile/photo error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui foto profil" },
      { status: 500 },
    );
  }
}
