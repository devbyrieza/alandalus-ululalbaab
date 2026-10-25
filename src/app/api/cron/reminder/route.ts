/**
 * Cron endpoint for Schedule Reminders (H-1 evening & H-0 1 hour before exam).
 * Can be called by external cron or Vercel cron as a redundant trigger.
 * Protected by CRON_SECRET.
 */

import { NextResponse } from "next/server";
import { processScheduleReminders } from "@/lib/services/schedule-reminder-service";

const CRON_SECRET = process.env.CRON_SECRET || "ppdb-alimam-cron-2026";

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const urlSecret = searchParams.get("secret");
    const secret = authHeader?.replace("Bearer ", "") || urlSecret;

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "spmb.pesantren-ululalbaab.com";
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const reqBaseUrl = `${protocol}://${host}`;
        const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || "";
        const fullAppUrl = appUrlEnv.startsWith("http") ? appUrlEnv : `${reqBaseUrl}${appUrlEnv}`;

        const forceH1 = searchParams.get("force_h1") === "true";

        const result = await processScheduleReminders({
            forceH1,
            appUrl: fullAppUrl
        });

        return NextResponse.json({
            success: true,
            result
        });
    } catch (error: any) {
        console.error("❌ Cron Reminder error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
