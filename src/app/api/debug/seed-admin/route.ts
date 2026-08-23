import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = "admin@ululalbaab.com";
    const password = "Super26!";
    
    // Check if exists
    let profile = await prisma.profile.findFirst({
      where: { email }
    });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const wahabPassword = await bcrypt.hash("2026#@", 10);
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email,
          username: "admin_super",
          password_hash: hashedPassword,
          role: "admin_super",
          full_name: "Super Admin Rescue",
          phone: "081234567890",
          updated_at: new Date() }
      });
    } else {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { password_hash: hashedPassword, role: "admin_super" }
      });
    }

    // Seed wahabrajasam
    let wahab = await prisma.profile.findFirst({ where: { username: "wahabrajasam" } });
    if (!wahab) {
      await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email: "wahabrajasam@pesantren-alandalus.com",
          username: "wahabrajasam",
          password_hash: wahabPassword,
          plain_password: "2026#@",
          role: "admin_super",
          full_name: "Ustadz Wahab Rajasam",
          phone: "081234567888",
          updated_at: new Date() }
      });
    } else {
      await prisma.profile.update({
        where: { id: wahab.id },
        data: { password_hash: wahabPassword, plain_password: "2026#@" }
      });
    }

    return NextResponse.json({ message: "Admin and Wahab created successfully", admin: { email, password }, wahab: { username: "wahabrajasam", password: "2026#@" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
