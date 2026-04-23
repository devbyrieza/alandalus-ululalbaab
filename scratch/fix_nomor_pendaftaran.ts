import { prisma } from "../src/lib/prisma";

async function migrateNomorPendaftaran() {
  console.log("Starting migration of nomor_pendaftaran...");

  // Mapping old prefixes to new prefixes is complex because they swapped.
  // Better to just recalculate based on jenjang and jenis_kelamin.
  
  const pendaftars = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nomor_pendaftaran: true,
      jenjang: true,
      jenis_kelamin: true,
      nama_lengkap: true
    }
  });

  console.log(`Found ${pendaftars.length} records.`);

  for (const p of pendaftars) {
    if (!p.nomor_pendaftaran || !p.jenjang || !p.jenis_kelamin) continue;

    let newPrefix = "";
    if (p.jenjang === "MTs" || p.jenjang === "MTS") {
      newPrefix = p.jenis_kelamin === "L" ? "MTA" : "MTI";
    } else if (p.jenjang === "IL") {
      newPrefix = p.jenis_kelamin === "L" ? "ILA" : "ILI";
    } else if (p.jenjang === "SMA" || p.jenjang === "MA") {
      newPrefix = p.jenis_kelamin === "L" ? "SMA" : "SMI";
    }

    if (!newPrefix) continue;

    // Extract the numeric part (usually 7 digits: 2 year + 5 sequence)
    // Or 2 digits year + 3 digits sequence etc.
    // Let's look for the first occurrence of digits after the prefix.
    const numericMatch = p.nomor_pendaftaran.match(/\d+/);
    if (!numericMatch) continue;
    
    let fullNumeric = numericMatch[0];
    
    // We want the last 7 digits if possible (YY + NNNNN)
    // If shorter, we'll pad or use as is.
    let finalNumeric = fullNumeric;
    if (fullNumeric.length > 7) {
        finalNumeric = fullNumeric.slice(-7);
    } else if (fullNumeric.length < 7 && fullNumeric.length >= 5) {
        // Probably year is missing or just 1 digit? 
        // Let's assume the last 5 are sequence and anything before is year.
        // If length is 5, year is missing. We use '26'.
        if (fullNumeric.length === 5) {
            finalNumeric = "26" + fullNumeric;
        } else {
            finalNumeric = fullNumeric.padStart(7, "26");
        }
    }

    const newNomor = `${newPrefix}${finalNumeric}`;

    if (newNomor !== p.nomor_pendaftaran) {
      console.log(`Updating ${p.nama_lengkap}: ${p.nomor_pendaftaran} -> ${newNomor}_TMP`);
      try {
        await prisma.pendaftar.update({
          where: { id: p.id },
          data: { nomor_pendaftaran: `${newNomor}_TMP` }
        });
      } catch (err) {
        console.error(`Failed to update ${p.nama_lengkap} (TMP): ${err.message}`);
      }
    }
  }

  // Second pass: remove _TMP
  console.log("Second pass: removing _TMP suffix...");
  const tmpPendaftars = await prisma.pendaftar.findMany({
    where: { nomor_pendaftaran: { endsWith: "_TMP" } }
  });

  for (const p of tmpPendaftars) {
    const finalNomor = p.nomor_pendaftaran!.replace("_TMP", "");
    try {
        await prisma.pendaftar.update({
          where: { id: p.id },
          data: { nomor_pendaftaran: finalNomor }
        });
    } catch (err) {
        console.error(`Failed to finalize ${p.nama_lengkap}: ${err.message}`);
    }
  }

  console.log("Migration finished.");
}

migrateNomorPendaftaran()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
