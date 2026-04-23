import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { cookies } from "next/headers";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (["admin_super", "admin"].includes(session.role)) {
      return session;
    }
  } catch { }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    // 1. Get Active TA
    const activeTA = await prisma.tahunAjaran.findFirst({
      where: { is_active: true }
    });

    if (!activeTA) {
      return NextResponse.json({ error: "No active Year of Study found" }, { status: 404 });
    }

    console.log(`🚀 Starting sync for TA: ${activeTA.nama}`);

    const results = {
      updated: 0,
      notFound: 0,
      errors: 0,
      details: [] as string[]
    };

    // 2. Normalization function
    const normalize = (name: string) => {
      if (!name) return "";
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
    };

    // 3. Fetch all active students for this TA to match efficiently
    const students = await prisma.pendaftar.findMany({
      where: { tahun_ajaran_id: activeTA.id, deleted_at: null },
      select: { id: true, nama_lengkap: true }
    });

    const studentMap = new Map();
    students.forEach(s => {
      studentMap.set(normalize(s.nama_lengkap), s.id);
    });

    // 4. Process Rows
    for (const row of data) {
      const rawName = row["NAMA LENGKAP"] || row["Nama Lengkap"] || row["NAMA"];
      const statusPenerimaan = row["STATUS PENERIMAAN"] || row["Status"];
      const statusLunas = row["LUNAS"] || row["Status Pembayaran"];

      if (!rawName) continue;

      const normName = normalize(rawName);
      const studentId = studentMap.get(normName);

      if (studentId) {
        let newStatus = "draft";
        
        // Logic: Enrolled (Lunas) > Accepted (Diterima)
        if (String(statusLunas).toLowerCase().includes("lunas")) {
          newStatus = "enrolled";
        } else if (String(statusPenerimaan).toLowerCase().includes("diterima")) {
          newStatus = "accepted";
        } else if (String(statusPenerimaan).toLowerCase().includes("cadangan")) {
          newStatus = "announced";
        }

        if (newStatus !== "draft") {
          await prisma.pendaftar.update({
            where: { id: studentId },
            data: { status_pendaftaran: newStatus }
          });
          results.updated++;
        }
      } else {
        results.notFound++;
        results.details.push(`Not Found: ${rawName}`);
      }
    }

    return NextResponse.json({
      message: "Synchronization completed",
      results
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
