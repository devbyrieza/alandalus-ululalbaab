import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Search for all records containing "Fakhira" (including deleted ones)
        // Note: Prisma doesn't show soft-deleted by default if using middleware, 
        // but our Prisma might not have the middleware or we can query directly.
        
        const results = await prisma.pendaftar.findMany({
            where: {
                nama_lengkap: {
                    contains: "Fakhira",
                    mode: "insensitive"
                }
            }
        });

        return NextResponse.json({
            count: results.length,
            results: results.map(r => ({
                id: r.id,
                nama: r.nama_lengkap,
                nomor: r.nomor_pendaftaran,
                deleted_at: (r as any).deleted_at || null,
                status: r.status_pendaftaran
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
