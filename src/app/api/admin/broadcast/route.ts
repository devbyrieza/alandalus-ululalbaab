import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";
import { formatPhoneNumber } from "@/lib/wablas";
import { getServerSession } from "@/lib/session";

interface RecipientItem {
  id: string;
  type: "pendaftar" | "profile" | "custom";
  name: string;
  phone: string;
  nomor_pendaftaran?: string;
  jenjang?: string;
  tahun_ajaran?: string;
  roleLabel?: string;
}

export function resolveTahunAjaran(p: {
  nomor_pendaftaran: string;
  created_at?: Date | null;
  tahun_ajaran?: { nama: string } | null;
}): string {
  const no = p.nomor_pendaftaran || "";
  const m4 = no.match(/20(\d{2})/);
  if (m4) {
    const c = parseInt(m4[1], 10);
    return `20${c}/20${c + 1}`;
  }
  const m2 = no.match(/^[A-Za-z]+(\d{2})/);
  if (m2) {
    const c = parseInt(m2[1], 10);
    if (c >= 20 && c <= 35) {
      return `20${c}/20${c + 1}`;
    }
  }
  if (p.tahun_ajaran?.nama && p.tahun_ajaran.nama.includes("/")) {
    return p.tahun_ajaran.nama;
  }
  if (p.created_at) {
    const yr = new Date(p.created_at).getFullYear();
    return `${yr}/${yr + 1}`;
  }
  return "2027/2028";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      !["admin", "admin_super", "head_of_it", "superadmin"].some((r) =>
        session.role?.toLowerCase().includes(r),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch All Active Pendaftar with Parent Phone fallback
    const rawPendaftar = await prisma.pendaftar.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true,
        status_pendaftaran: true,
        no_hp: true,
        created_at: true,
        tahun_ajaran: {
          select: {
            id: true,
            nama: true,
          },
        },
        orang_tua: {
          select: {
            no_hp_ayah: true,
            no_hp_ibu: true,
            no_hp_wali: true,
            nama_ayah: true,
            nama_ibu: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const pendaftarList = rawPendaftar.map((p) => {
      // Prioritas pencarian nomor WA yang valid (minimal 10 digit):
      // 1. Santri -> 2. Ayah -> 3. Ibu -> 4. Wali
      let resolvedPhone = "";
      let phoneSource = "santri";

      const santriPhone = formatPhoneNumber(p.no_hp || "");
      if (santriPhone) {
        resolvedPhone = santriPhone;
        phoneSource = "santri";
      } else if (p.orang_tua) {
        const ayahPhone = formatPhoneNumber(p.orang_tua.no_hp_ayah || "");
        const ibuPhone = formatPhoneNumber(p.orang_tua.no_hp_ibu || "");
        const waliPhone = formatPhoneNumber(p.orang_tua.no_hp_wali || "");

        if (ayahPhone) {
          resolvedPhone = ayahPhone;
          phoneSource = "ayah";
        } else if (ibuPhone) {
          resolvedPhone = ibuPhone;
          phoneSource = "ibu";
        } else if (waliPhone) {
          resolvedPhone = waliPhone;
          phoneSource = "wali";
        }
      }

      const formatted = resolvedPhone;
      const ta = resolveTahunAjaran(p);

      return {
        id: p.id,
        nomor_pendaftaran: p.nomor_pendaftaran,
        nama_lengkap: p.nama_lengkap,
        jenjang: p.jenjang,
        status_pendaftaran: p.status_pendaftaran,
        tahun_ajaran: ta,
        raw_phone: resolvedPhone,
        phone: formatted,
        phone_source: phoneSource,
        has_phone: Boolean(formatted),
      };
    });

    // 2. Fetch All Staff Profiles
    const rawProfiles = await prisma.profile.findMany({
      where: {
        role: { not: "pendaftar" },
      },
      select: {
        id: true,
        full_name: true,
        username: true,
        role: true,
        secondary_roles: true,
        phone: true,
      },
      orderBy: { full_name: "asc" },
    });

    const staffList = rawProfiles.map((s) => {
      const allRoles = [s.role, ...(s.secondary_roles || [])].map((r) =>
        r.toLowerCase(),
      );

      const isPengujiQuran =
        allRoles.includes("penguji") ||
        allRoles.includes("penguji_quran") ||
        allRoles.includes("penguji_tahfidz");

      const isPengujiArab =
        allRoles.includes("penguji_bahasa_arab") ||
        allRoles.includes("penguji_arab");

      const isPewawancaraCalsan =
        allRoles.includes("pewawancara_calsan") ||
        allRoles.includes("pewawancara");
      const isPewawancaraCawalsan =
        allRoles.includes("pewawancara_cawalsan") ||
        allRoles.includes("pewawancara");

      const isPenguji = isPengujiQuran || isPengujiArab;
      const isPewawancara = isPewawancaraCalsan || isPewawancaraCawalsan;

      // Primary role label for display
      const roleLabels: string[] = [];
      if (isPengujiQuran) roleLabels.push("Penguji Tes Al-Qur'an");
      if (isPengujiArab) roleLabels.push("Penguji Tes Lisan Bahasa Arab");
      if (allRoles.includes("pewawancara_calsan")) roleLabels.push("Pewawancara Calsan");
      if (allRoles.includes("pewawancara_cawalsan")) roleLabels.push("Pewawancara Cawalsan");
      if (allRoles.includes("pewawancara") && !allRoles.includes("pewawancara_calsan") && !allRoles.includes("pewawancara_cawalsan")) {
        roleLabels.push("Pewawancara");
      }
      if (roleLabels.length === 0) {
        roleLabels.push(s.role.replace(/_/g, " ").toUpperCase());
      }

      const formatted = formatPhoneNumber(s.phone);

      return {
        id: s.id,
        full_name: s.full_name,
        username: s.username,
        role: s.role,
        secondary_roles: s.secondary_roles,
        roleLabel: roleLabels.join(" & "),
        phone: formatted,
        raw_phone: s.phone,
        has_phone: Boolean(formatted),
        is_penguji_quran: isPengujiQuran,
        is_penguji_arab: isPengujiArab,
        is_penguji: isPenguji,
        is_pewawancara_calsan: isPewawancaraCalsan,
        is_pewawancara_cawalsan: isPewawancaraCawalsan,
        is_pewawancara: isPewawancara,
        is_all_staff: isPenguji || isPewawancara || s.role.includes("admin") || s.role !== "pendaftar",
      };
    });

    const pengujiQuranList = staffList.filter((s) => s.is_penguji_quran);
    const pengujiArabList = staffList.filter((s) => s.is_penguji_arab);
    const allPengujiList = staffList.filter((s) => s.is_penguji);

    const pewawancaraCalsanList = staffList.filter(
      (s) => s.is_pewawancara_calsan,
    );
    const pewawancaraCawalsanList = staffList.filter(
      (s) => s.is_pewawancara_cawalsan,
    );
    const allPewawancaraList = staffList.filter((s) => s.is_pewawancara);

    const allStaffList = staffList.filter((s) => s.is_all_staff);

    // Dynamic Academic Years (Tahun Ajaran) List & Stats
    const tahunAjaranSet = new Set<string>();
    pendaftarList.forEach((p) => {
      if (p.tahun_ajaran) tahunAjaranSet.add(p.tahun_ajaran);
    });
    if (tahunAjaranSet.size === 0) {
      ["2027/2028", "2026/2027", "2025/2026"].forEach((t) => tahunAjaranSet.add(t));
    }
    const tahunAjaranList = Array.from(tahunAjaranSet).sort().reverse();
    const activeTahunAjaran = tahunAjaranList[0] || "2027/2028";
    const pendaftarActiveYearCount = pendaftarList.filter(
      (p) => p.tahun_ajaran === activeTahunAjaran,
    ).length;

    return NextResponse.json({
      success: true,
      counts: {
        pendaftar: pendaftarList.length,
        pendaftar_active_year: pendaftarActiveYearCount,
        active_tahun_ajaran: activeTahunAjaran,
        pendaftar_valid_phone: pendaftarList.filter((p) => p.has_phone).length,
        penguji_quran: pengujiQuranList.length,
        penguji_arab: pengujiArabList.length,
        all_penguji: allPengujiList.length,
        pewawancara_calsan: pewawancaraCalsanList.length,
        pewawancara_cawalsan: pewawancaraCawalsanList.length,
        all_pewawancara: allPewawancaraList.length,
        all_staff: allStaffList.length,
      },
      tahun_ajaran_list: tahunAjaranList,
      data: {
        pendaftar: pendaftarList,
        penguji_quran: pengujiQuranList,
        penguji_arab: pengujiArabList,
        all_penguji: allPengujiList,
        pewawancara_calsan: pewawancaraCalsanList,
        pewawancara_cawalsan: pewawancaraCawalsanList,
        all_pewawancara: allPewawancaraList,
        all_staff: allStaffList,
      },
    });
  } catch (error: any) {
    console.error("Fetch recipients error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      !["admin", "admin_super", "head_of_it", "superadmin"].some((r) =>
        session.role?.toLowerCase().includes(r),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetCategory,
      selectedIds,
      customRecipients,
      recipientsChunk,
      delayMode = "safe",
      message,
      header,
      footer,
      includeName,
      jenjangFilter,
      statusFilter,
      tahunAjaranFilter,
    } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Pesan broadcast wajib diisi" },
        { status: 400 },
      );
    }

    const candidateRecipients: RecipientItem[] = [];

    // Category 0: Direct chunk of recipients passed by frontend batch runner
    if (
      Array.isArray(recipientsChunk) &&
      recipientsChunk.length > 0
    ) {
      for (const item of recipientsChunk) {
        candidateRecipients.push({
          id: item.id || `chunk-${Date.now()}-${Math.random()}`,
          type: item.type || "pendaftar",
          name: item.name,
          phone: formatPhoneNumber(item.phone),
          nomor_pendaftaran: item.nomor_pendaftaran || "-",
          jenjang: item.jenjang || "-",
          tahun_ajaran: item.tahun_ajaran || "-",
          roleLabel: item.roleLabel || "Penerima",
        });
      }
    }

    // Helper to resolve pendaftar phone with full validation
    const resolvePendaftarPhone = (p: any): string => {
      const santriPhone = formatPhoneNumber(p.no_hp || "");
      if (santriPhone) return santriPhone;

      if (p.orang_tua) {
        const ayahPhone = formatPhoneNumber(p.orang_tua.no_hp_ayah || "");
        if (ayahPhone) return ayahPhone;
        const ibuPhone = formatPhoneNumber(p.orang_tua.no_hp_ibu || "");
        if (ibuPhone) return ibuPhone;
        const waliPhone = formatPhoneNumber(p.orang_tua.no_hp_wali || "");
        if (waliPhone) return waliPhone;
      }
      return "";
    };

    // Category 1: Pendaftar
    if (candidateRecipients.length > 0) {
      // Already populated via recipientsChunk
    } else if (
      targetCategory === "all_pendaftar" ||
      targetCategory === "selected_pendaftar" ||
      body.ids // backwards compatibility
    ) {
      const whereClause: any = { deleted_at: null };
      if (targetCategory === "selected_pendaftar" && selectedIds?.length > 0) {
        whereClause.id = { in: selectedIds };
      } else if (body.ids && Array.isArray(body.ids)) {
        whereClause.id = { in: body.ids };
      }

      if (jenjangFilter && jenjangFilter !== "ALL") {
        whereClause.jenjang = { equals: jenjangFilter, mode: "insensitive" };
      }
      if (statusFilter && statusFilter !== "ALL") {
        whereClause.status_pendaftaran = statusFilter;
      }

      const pendaftarList = await prisma.pendaftar.findMany({
        where: whereClause,
        select: {
          id: true,
          nomor_pendaftaran: true,
          nama_lengkap: true,
          jenjang: true,
          no_hp: true,
          created_at: true,
          tahun_ajaran: {
            select: {
              id: true,
              nama: true,
            },
          },
          orang_tua: {
            select: {
              no_hp_ayah: true,
              no_hp_ibu: true,
              no_hp_wali: true,
            },
          },
        },
      });

      for (const p of pendaftarList) {
        const ta = resolveTahunAjaran(p);
        if (
          tahunAjaranFilter &&
          tahunAjaranFilter !== "ALL" &&
          ta !== tahunAjaranFilter
        ) {
          continue;
        }

        const ph = resolvePendaftarPhone(p);
        candidateRecipients.push({
          id: p.id,
          type: "pendaftar",
          name: p.nama_lengkap,
          phone: ph,
          nomor_pendaftaran: p.nomor_pendaftaran,
          jenjang: p.jenjang,
          tahun_ajaran: ta,
          roleLabel: "Calon Santri",
        });
      }
    }
    // Category 2: Staff Profiles (Examiners / Interviewers)
    else if (
      [
        "all_penguji_quran",
        "selected_penguji_quran",
        "all_penguji_arab",
        "selected_penguji_arab",
        "all_penguji",
        "selected_penguji",
        "all_pewawancara_calsan",
        "selected_pewawancara_calsan",
        "all_pewawancara_cawalsan",
        "selected_pewawancara_cawalsan",
        "all_pewawancara",
        "selected_pewawancara",
        "all_staff",
        "selected_staff",
      ].includes(targetCategory)
    ) {
      const whereClause: any = { role: { not: "pendaftar" } };
      if (targetCategory.startsWith("selected_") && selectedIds?.length > 0) {
        whereClause.id = { in: selectedIds };
      }

      const staffList = await prisma.profile.findMany({
        where: whereClause,
        select: {
          id: true,
          full_name: true,
          role: true,
          secondary_roles: true,
          phone: true,
        },
      });

      for (const s of staffList) {
        const allRoles = [s.role, ...(s.secondary_roles || [])].map((r) =>
          r.toLowerCase(),
        );

        const isPengujiQuran =
          allRoles.includes("penguji") ||
          allRoles.includes("penguji_quran") ||
          allRoles.includes("penguji_tahfidz");

        const isPengujiArab =
          allRoles.includes("penguji_bahasa_arab") ||
          allRoles.includes("penguji_arab");

        const isPewawancaraCalsan =
          allRoles.includes("pewawancara_calsan") ||
          allRoles.includes("pewawancara");
        const isPewawancaraCawalsan =
          allRoles.includes("pewawancara_cawalsan") ||
          allRoles.includes("pewawancara");

        // Filter based on requested target
        let match = false;
        let roleName = "Penguji/Pewawancara";

        if (
          targetCategory === "all_penguji_quran" ||
          targetCategory === "selected_penguji_quran"
        ) {
          match = isPengujiQuran;
          roleName = "Penguji Tes Al-Qur'an";
        } else if (
          targetCategory === "all_penguji_arab" ||
          targetCategory === "selected_penguji_arab"
        ) {
          match = isPengujiArab;
          roleName = "Penguji Bahasa Arab";
        } else if (
          targetCategory === "all_penguji" ||
          targetCategory === "selected_penguji"
        ) {
          match = isPengujiQuran || isPengujiArab;
          roleName = isPengujiQuran ? "Penguji Tes Al-Qur'an" : "Penguji Tes Lisan Bahasa Arab";
        } else if (
          targetCategory === "all_pewawancara_calsan" ||
          targetCategory === "selected_pewawancara_calsan"
        ) {
          match = isPewawancaraCalsan;
          roleName = "Pewawancara Santri (Calsan)";
        } else if (
          targetCategory === "all_pewawancara_cawalsan" ||
          targetCategory === "selected_pewawancara_cawalsan"
        ) {
          match = isPewawancaraCawalsan;
          roleName = "Pewawancara Orang Tua (Cawalsan)";
        } else if (
          targetCategory === "all_pewawancara" ||
          targetCategory === "selected_pewawancara"
        ) {
          match = isPewawancaraCalsan || isPewawancaraCawalsan;
          roleName = isPewawancaraCalsan
            ? "Pewawancara Calsan"
            : "Pewawancara Cawalsan";
        } else if (
          targetCategory === "all_staff" ||
          targetCategory === "selected_staff"
        ) {
          match =
            isPengujiQuran ||
            isPengujiArab ||
            isPewawancaraCalsan ||
            isPewawancaraCawalsan ||
            s.role.includes("admin") ||
            s.role !== "pendaftar";
          roleName = "Tim Penguji & Pewawancara";
        }

        if (match) {
          candidateRecipients.push({
            id: s.id,
            type: "profile",
            name: s.full_name,
            phone: formatPhoneNumber(s.phone),
            roleLabel: roleName,
          });
        }
      }
    }
    // Category 3: Custom List
    else if (
      targetCategory === "custom" &&
      Array.isArray(customRecipients) &&
      customRecipients.length > 0
    ) {
      for (const cr of customRecipients) {
        candidateRecipients.push({
          id: cr.id || `custom-${Date.now()}-${Math.random()}`,
          type: "custom",
          name: cr.name,
          phone: formatPhoneNumber(cr.phone),
          roleLabel: cr.roleLabel || "Penerima",
          nomor_pendaftaran: cr.nomor_pendaftaran || "-",
          jenjang: cr.jenjang || "-",
        });
      }
    }

    if (candidateRecipients.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada penerima yang ditemukan untuk target ini." },
        { status: 400 },
      );
    }

    // Deduplicate recipients by unique recipient ID (memastikan tidak ada santri tertinggal meskipun saudara kandung berbagi nomor WA orang tua yang sama)
    const seenIds = new Set<string>();
    const uniqueRecipients: RecipientItem[] = [];

    for (const r of candidateRecipients) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        uniqueRecipients.push(r);
      }
    }

    const formattedHeader =
      header && header.trim() ? `${header.trim()}\n\n` : "";
    const formattedFooter =
      footer && footer.trim() ? `\n\n${footer.trim()}` : "";

    const results: Array<{
      id: string;
      name: string;
      phone: string;
      status: "success" | "failed";
      error?: string;
    }> = [];

    // Dispatch messages sequentially with polite pacing
    for (const recipient of uniqueRecipients) {
      if (!recipient.phone || recipient.phone.length < 10) {
        results.push({
          id: recipient.id,
          name: recipient.name,
          phone: recipient.phone || "-",
          status: "failed",
          error:
            "Nomor WhatsApp kosong atau tidak valid (kurang dari 10 digit)",
        });
        continue;
      }

      // Variable Replacement Engine
      let personalized = message
        .replace(/{nama}/gi, recipient.name)
        .replace(/{nomor_pendaftaran}/gi, recipient.nomor_pendaftaran || "-")
        .replace(/{jenjang}/gi, recipient.jenjang || "-")
        .replace(/{tahun_ajaran}/gi, recipient.tahun_ajaran || "-")
        .replace(/{role}/gi, recipient.roleLabel || "Penerima")
        .replace(/{kontak}/gi, recipient.phone);

      const salutation = includeName ? `${recipient.name},\n\n` : "";
      const finalMessage = `${formattedHeader}${salutation}${personalized}${formattedFooter}`;

      try {
        const enqueueRes = await enqueueWhatsapp({
          pendaftarId: recipient.type === "pendaftar" ? recipient.id : null,
          phone: recipient.phone,
          jenisNotif: "broadcast",
          messageContent: finalMessage,
          force: true, // Force send: never drop as duplicate
          sendNow: true,
        });

        if (enqueueRes.queued) {
          results.push({
            id: recipient.id,
            name: recipient.name,
            phone: recipient.phone,
            status: "success",
          });
        } else {
          results.push({
            id: recipient.id,
            name: recipient.name,
            phone: recipient.phone,
            status: "failed",
            error: enqueueRes.reason || "Ditolak oleh gateway WhatsApp",
          });
        }
      } catch (error: any) {
        results.push({
          id: recipient.id,
          name: recipient.name,
          phone: recipient.phone,
          status: "failed",
          error: error.message || "Kesalahan jaringan",
        });
      }

      // Human-like Anti-Ban Pacing Delay with Random Jitter
      let pacingMs = 3500;
      if (delayMode === "safe") {
        // Safe Mode: 3000ms - 6000ms (Average ~4.5s) to mimic human typing & bypass bot detection
        pacingMs = Math.floor(Math.random() * 3000) + 3000;
      } else if (delayMode === "normal") {
        // Normal Mode: 1500ms - 3000ms
        pacingMs = Math.floor(Math.random() * 1500) + 1500;
      } else if (delayMode === "fast") {
        // Fast Mode: 800ms - 1200ms
        pacingMs = Math.floor(Math.random() * 400) + 800;
      }

      await new Promise((resolve) => setTimeout(resolve, pacingMs));
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      total: uniqueRecipients.length,
      sent: successCount,
      failed: failedCount,
      details: results,
    });
  } catch (error: any) {
    console.error("Broadcast POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
