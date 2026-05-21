import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.whatsappLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 10,
    select: {
      id: true,
      phone: true,
      jenis_notif: true,
      status: true,
      attempt_count: true,
      error_message: true,
      failed_at: true,
      created_at: true,
      scheduled_at: true
    }
  });

  return NextResponse.json(logs);
}
