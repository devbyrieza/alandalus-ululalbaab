import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const confirm = searchParams.get("confirm");

    if (confirm !== "true") {
      return NextResponse.json({ 
        message: "This will restore ALL soft-deleted students. Please add ?confirm=true to the URL to execute." 
      });
    }

    const result = await prisma.pendaftar.updateMany({
      where: {
        NOT: { deleted_at: null }
      },
      data: {
        deleted_at: null
      }
    });

    return NextResponse.json({
      message: `Success! Restored ${result.count} students.`,
      count: result.count
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
