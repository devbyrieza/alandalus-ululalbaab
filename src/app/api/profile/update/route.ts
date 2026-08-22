import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, phone, username, target_id, email } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi" },
        { status: 400 },
      );
    }

    // Determine which profile to update:
    // - admin_super can update ANY profile by providing target_id
    // - other roles can only update themselves
    let profileId = session.id;
    if (target_id && target_id !== session.id) {
      if (session.role !== "admin_super") {
        return NextResponse.json(
          { error: "Hanya Admin Super yang dapat mengubah data akun lain" },
          { status: 403 },
        );
      }
      profileId = target_id;
    }

    if (username) {
      if (username.length < 4) {
        return NextResponse.json(
          { error: "Username minimal 4 karakter" },
          { status: 400 },
        );
      }
      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username hanya boleh berisi huruf, angka, titik, atau underscore" },
          { status: 400 },
        );
      }
      const existing = await prisma.profile.findFirst({
        where: { username, id: { not: profileId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Username sudah digunakan" },
          { status: 400 },
        );
      }
    }

    // Build update data
    const updateData: any = {
      full_name,
      phone: phone || "-",
      username: username || null,
    };

    // Allow email update with duplicate check
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const emailExists = await prisma.profile.findFirst({
        where: { email: cleanEmail, id: { not: profileId } },
      });
      if (emailExists) {
        return NextResponse.json({ error: "Email sudah digunakan akun lain" }, { status: 400 });
      }
      updateData.email = cleanEmail;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: updateData,
    });

    // Only update session cookie if editing own profile
    if (profileId === session.id) {
      const newSession = {
        ...session,
        full_name: updatedProfile.full_name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        username: updatedProfile.username,
      };

      const cookieStore = await cookies();
      cookieStore.set("al_session", JSON.stringify(newSession), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
        maxAge: 60 * 60 * 24 * 90,
      });
    }

    return NextResponse.json({
      success: true,
      message: profileId === session.id
        ? "Profil Anda berhasil diperbarui."
        : `Profil ${updatedProfile.full_name} berhasil diperbarui.`,
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("POST profile/update error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui profil" },
      { status: 500 },
    );
  }
}

