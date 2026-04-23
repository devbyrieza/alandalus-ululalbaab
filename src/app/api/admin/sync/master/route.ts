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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Read raw data to find headers
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    // Find header row (the one containing "Nama" or similar)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
      if (rawData[i].some(cell => String(cell).toLowerCase().includes("nama santri") || String(cell).toLowerCase().includes("nama lengkap"))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: "Could not find 'Nama Santri' column in Excel" }, { status: 400 });
    }

    const headers = rawData[headerRowIndex].map(h => String(h).trim());
    const dataRows = rawData.slice(headerRowIndex + 1);

    const colIdx = {
      nama: headers.findIndex(h => h.toLowerCase().includes("nama santri") || h.toLowerCase().includes("nama lengkap")),
      status: headers.findIndex(h => h.toLowerCase().includes("hasil tes") || h.toLowerCase().includes("status penerimaan")),
      bayar: headers.findIndex(h => h.toLowerCase().includes("status pembayaran") || h.toLowerCase().includes("lunas"))
    };

    // 1. Get Active TA
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    if (!activeTA) return NextResponse.json({ error: "No active TA" }, { status: 404 });

    const results = { updated: 0, notFound: 0, details: [] as string[] };

    const normalize = (name: string) => {
      if (!name) return "";
      return String(name).toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    };

    // 3. Fetch all active students
    const students = await prisma.pendaftar.findMany({
      where: { tahun_ajaran_id: activeTA.id, deleted_at: null },
      select: { id: true, nama_lengkap: true }
    });

    const studentMap = new Map();
    students.forEach(s => {
      studentMap.set(normalize(s.nama_lengkap), s.id);
    });

    const updatedIds = new Set<string>();

    // 4. Process Rows
    for (const row of dataRows) {
      const rawName = row[colIdx.nama];
      if (!rawName) continue;

      const normName = normalize(rawName);
      let studentId = studentMap.get(normName);

      // Fallback: Try partial match if not found exactly
      if (!studentId) {
        const bestMatch = students.find(s => {
          const dbNorm = normalize(s.nama_lengkap);
          return dbNorm.includes(normName) || normName.includes(dbNorm);
        });
        if (bestMatch) studentId = bestMatch.id;
      }

      if (studentId) {
        let newStatus = "draft";
        const statusPenerimaan = String(row[colIdx.status] || "").toLowerCase();
        const statusLunas = String(row[colIdx.bayar] || "").toLowerCase();

        if (statusLunas.includes("lunas") || statusLunas.includes("gratis")) {
          newStatus = "enrolled";
        } else if (statusPenerimaan.includes("diterima")) {
          newStatus = "accepted";
        } else if (statusPenerimaan.includes("cadangan")) {
          newStatus = "announced";
        }

        await prisma.pendaftar.update({
          where: { id: studentId },
          data: { status_pendaftaran: newStatus }
        });
        results.updated++;
        updatedIds.add(studentId);
      } else {
        results.notFound++;
        results.details.push(`Not Found: ${rawName}`);
      }
    }

    // 5. Cleanup (ONLY if we found at least 50% of the students, to be safe)
    let cleanedCount = 0;
    if (results.updated > dataRows.length * 0.5) {
      const toDelete = students.filter(s => !updatedIds.has(s.id));
      for (const s of toDelete) {
        await prisma.pendaftar.update({ where: { id: s.id }, data: { deleted_at: new Date() } });
      }
      cleanedCount = toDelete.length;
    }

    return NextResponse.json({
      message: "Sync complete",
      results: { ...results, cleaned: cleanedCount }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
