import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFileLocal } from "@/lib/storage/local";

/**
 * GET /api/files/[...path]
 * Serves files from local storage with authentication check.
 * URL format: /api/files/category/owner_id/filename
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await props.params;

        if (!pathSegments || pathSegments.length < 2) {
            console.error("[File-API] ❌ Invalid path segments:", pathSegments);
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        const relativePath = pathSegments.join("/");
        console.log(`\n[File-API] 🔍 Requesting file: ${relativePath}`);

        // 1. Auth Check - Files in storage are protected
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            console.error("[File-API] ❌ Unauthorized: No session cookie");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let session: any;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch (e) {
            console.error("[File-API] ❌ Error parsing session cookie:", e);
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }
        const userRole = session.role;
        const userId = session.id;

        // 2. Permission Check
        const isAdmin = ["admin_berkas", "admin_keuangan", "admin_super", "admin", "head_of_it", "tim_it"].includes(userRole);
        const isOwner = relativePath.includes(userId);

        if (!isAdmin && !isOwner) {
            console.error(`[File-API] ❌ Forbidden: User ${userId} (${userRole}) is not authorized for ${relativePath}`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Get File
        console.log(`[File Serve] Requesting: ${relativePath}`);
        const fileData = getFileLocal(relativePath);

        if (!fileData) {
            console.error(`[File Serve] Not Found: ${relativePath}`);
            // Logs from getFileLocal should help, but let's log here too if needed
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // 4. Return File
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(fileData.buffer as any, {
            headers: {
                "Content-Type": fileData.mimeType,
                "Cache-Control": "private, max-age=3600",
            },
        });

    } catch (error) {
        console.error("File serve error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
