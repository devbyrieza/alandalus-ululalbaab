import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
    getDigestRecipientSetting,
    setDigestRecipientSetting,
    resolveDigestRecipient,
} from "@/lib/services/daily-digest-service";

export const dynamic = "force-dynamic";

const STAFF_ADMIN_ROLES = [
    "admin",
    "admin_super",
    "admin_keuangan",
    "admin_berkas",
    "head_of_it",
    "superadmin",
];

function isStaffAdmin(session: any): boolean {
    if (!session) return false;
    const roles = [session.role, ...(session.secondary_roles || []), ...(session.roles || [])]
        .filter(Boolean)
        .map((r: string) => String(r).toLowerCase());
    return roles.some((r) => STAFF_ADMIN_ROLES.some((ar) => r.includes(ar)));
}

function isSuperAdmin(session: any): boolean {
    if (!session) return false;
    const roles = [session.role, ...(session.secondary_roles || []), ...(session.roles || [])]
        .filter(Boolean)
        .map((r: string) => String(r).toLowerCase());
    return roles.some((r) => r.includes("admin_super") || r.includes("superadmin") || r.includes("head_of_it"));
}

/**
 * Konfigurasi penerima digest jadwal seleksi harian (06.45 WIB).
 * GET  → status untuk banner dashboard: { setting, adminSuperPhone, configured }
 * POST → admin super menetapkan nomor penerima { phone }
 * DELETE → admin super menghapus nomor penerima (kembali ke fallback)
 */
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session || !isStaffAdmin(session)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const setting = await getDigestRecipientSetting();
        let adminSuperPhone: string | null = null;
        try {
            const adminSuper = await prisma.profile.findFirst({
                where: {
                    OR: [
                        { role: "admin_super" },
                        { secondary_roles: { has: "admin_super" } },
                    ],
                    phone: { notIn: ["", "-"] },
                },
                select: { phone: true },
            });
            adminSuperPhone = adminSuper?.phone || null;
        } catch {
            adminSuperPhone = null;
        }

        const isConfigured = Boolean(setting && setting.trim() && setting.trim() !== "-") ||
            Boolean(adminSuperPhone && adminSuperPhone.trim() && adminSuperPhone.trim() !== "-");

        return NextResponse.json({
            setting,
            adminSuperPhone,
            configured: isConfigured,
        });
    } catch (error: any) {
        console.error("❌ digest-recipient GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session || !isSuperAdmin(session)) {
            return NextResponse.json({ error: "Hanya Admin Super yang dapat mengatur nomor penerima." }, { status: 403 });
        }

        const body = await request.json();
        const phone = (body?.phone || "").trim();
        if (!phone || !/^[0-9+\-\s]{8,20}$/.test(phone)) {
            return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
        }

        await setDigestRecipientSetting(phone);
        return NextResponse.json({ success: true, phone });
    } catch (error: any) {
        console.error("❌ digest-recipient POST error:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan. Pastikan tabel app_settings sudah dibuat di database." },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession();
        if (!session || !isSuperAdmin(session)) {
            return NextResponse.json({ error: "Hanya Admin Super yang dapat mengubah konfigurasi." }, { status: 403 });
        }

        await setDigestRecipientSetting(null);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ digest-recipient DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
