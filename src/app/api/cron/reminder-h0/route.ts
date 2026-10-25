/**
 * Cron endpoint for H-0 reminders (1 hour before exam).
 * Delegates to checkAndSendH0Reminders in schedule-reminder-service.
 */

import { NextResponse } from "next/server";
import { checkAndSendH0Reminders } from "@/lib/services/schedule-reminder-service";

const CRON_SECRET = process.env.CRON_SECRET || "ppdb-alimam-cron-2026";

export async function GET(request: Request) {
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

    const result = await checkAndSendH0Reminders(fullAppUrl);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ Cron H-0 Reminder error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
