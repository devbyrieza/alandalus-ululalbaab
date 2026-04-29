import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generatePrefix(jenjang: string, jenis_kelamin: string): string {
  let prefix = "";

  if (jenjang === "MTs") {
    prefix = "MT";
  } else if (jenjang === "IL") {
    prefix = "IL";
  } else if (jenjang === "SMA" || jenjang === "MA") {
    prefix = "MA";
  } else {
    throw new Error(`Jenjang tidak valid: ${jenjang}`);
  }

  if (jenis_kelamin === "L") {
    prefix += "A"; // Putra
  } else if (jenis_kelamin === "P") {
    prefix += "I"; // Putri
  } else {
    throw new Error(`Jenis kelamin tidak valid: ${jenis_kelamin}`);
  }

  return prefix;
}

async function main() {
  console.log("Mulai rekalkulasi nomor pendaftaran...");

  // Ambil semua pendaftar, diurutkan berdasarkan jenjang, jenis kelamin, lalu nama lengkap (abjad)
  const pendaftars = await prisma.pendaftar.findMany({
    orderBy: [
      { jenjang: 'asc' },
      { jenis_kelamin: 'asc' },
      { nama_lengkap: 'asc' }
    ],
    include: {
      tahun_ajaran: true
    }
  });

  console.log(`Ditemukan ${pendaftars.length} pendaftar.`);

  // Dictionary untuk melacak urutan per (TahunAjaranId + Prefix)
  const counters: Record<string, number> = {};

  // Pass 1: Berikan nomor pendaftaran sementara untuk menghindari Unique Constraint Error
  console.log("Pass 1: Mengamankan nomor pendaftaran lama...");
  for (const p of pendaftars) {
    if (!p.jenjang || !p.jenis_kelamin) continue;
    await prisma.pendaftar.update({
      where: { id: p.id },
      data: { nomor_pendaftaran: `TMP_${p.id.substring(0, 8)}` }
    });
  }

  // Pass 2: Berikan nomor pendaftaran baru yang berurutan
  console.log("Pass 2: Membuat nomor pendaftaran baru yang urut...");
  for (const p of pendaftars) {
    const jenjang = p.jenjang;
    const jenis_kelamin = p.jenis_kelamin;

    if (!jenjang || !jenis_kelamin) continue;

    let prefix;
    try {
      prefix = generatePrefix(jenjang, jenis_kelamin);
    } catch (e: any) {
      console.warn(`[SKIP] Pendaftar ${p.nama_lengkap} (ID: ${p.id}): ${e.message}`);
      continue;
    }

    if (!p.tahun_ajaran) {
      console.warn(`[SKIP] Pendaftar ${p.nama_lengkap} tidak memiliki tahun ajaran.`);
      continue;
    }

    const tahun = String(p.tahun_ajaran.tahun_mulai).slice(-2);
    const counterKey = `${p.tahun_ajaran_id}_${prefix}`;
    
    // Inisialisasi counter jika belum ada
    if (!counters[counterKey]) {
      counters[counterKey] = 1;
    }

    // Generate nomor baru
    const sequence = counters[counterKey]++;
    const newNomor = `${prefix}${tahun}${String(sequence).padStart(5, "0")}`;

    console.log(`[${jenjang} - ${jenis_kelamin}] ${p.nama_lengkap}: -> ${newNomor}`);

    // Update ke database
    await prisma.pendaftar.update({
      where: { id: p.id },
      data: { nomor_pendaftaran: newNomor }
    });
  }

  console.log("Rekalkulasi selesai!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
