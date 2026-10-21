const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD_ULUL = "PUAS2026!";

async function main() {
  console.log("=== RESET SESSIONS CREATED TODAY IN ULUL ALBAAB ===");
  const deleted = await prisma.examSession.deleteMany({
    where: {
      notes: { contains: "Jadwal Penguji:" }
    }
  });
  console.log(`Deleted ${deleted.count} previously generated sessions.`);

  // Restore the original profile for Ust. Ahmad Penguji Qur'an and Muhammad Irsyad
  await prisma.profile.updateMany({
    where: { id: "b5f7e925-9b8e-4086-ad3b-fc9f67a44e55" },
    data: {
      full_name: "Ust. Ahmad Penguji Qur'an",
      username: "penguji.ulul",
      role: "penguji",
      secondary_roles: [],
    }
  });

  await prisma.profile.updateMany({
    where: { id: "40310667-8170-4597-9bdd-74f7083d0146" },
    data: {
      full_name: "Muhammad Irsyad Adhya Putra",
      username: "irsyad.adhya",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300811",
      jenis_kelamin: "L",
    }
  });

  console.log("\n=== STEP 1: UPSERT EXACT PROFILES FOR ULUL ALBAAB ===");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD_ULUL, 10);

  const profilesData = [
    {
      full_name: "Ade Vio Sulaiman",
      username: "ade.vio",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300810",
      jenis_kelamin: "L",
    },
    {
      full_name: "Muhammad Irsyad Adhya Putra",
      username: "irsyad.adhya",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300811",
      jenis_kelamin: "L",
    },
    {
      full_name: "Agus Cahyono",
      username: "agus.cahyono",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300801",
      jenis_kelamin: "L",
    },
    {
      full_name: "Azzam Aghnia Ilman Azzauhari",
      username: "azzam.aghnia",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300803",
      jenis_kelamin: "L",
    },
    {
      full_name: "Zeidhan Ahmad Maulana",
      username: "zeidhan.ahmad",
      role: "penguji",
      secondary_roles: [],
      phone: "081285300802",
      jenis_kelamin: "L",
    },
    {
      full_name: "Muhajir",
      username: "muhajir",
      role: "pewawancara_calsan",
      secondary_roles: [],
      phone: "081285300812",
      jenis_kelamin: "L",
    },
    {
      full_name: "Muhammad Syauqi Al Faruq",
      username: "syauqi.alfaruq",
      role: "pewawancara_calsan",
      secondary_roles: [],
      phone: "081285300813",
      jenis_kelamin: "L",
    },
    {
      full_name: "Ilham Muharom, S.Pd.",
      username: "ilham.muharom",
      role: "pewawancara_calsan",
      secondary_roles: [],
      phone: "081285300814",
      jenis_kelamin: "L",
    },
    {
      full_name: "Imron Abdillah, S.Pd.",
      username: "imron.abdillah",
      role: "pewawancara_calsan",
      secondary_roles: ["penguji_bahasa_arab"],
      phone: "081285300804",
      jenis_kelamin: "L",
    },
    {
      full_name: "Muhammad Adib Achsan, S.Pd.",
      username: "adib.achsan",
      role: "pewawancara_cawalsan",
      secondary_roles: [],
      phone: "081285300815",
      jenis_kelamin: "L",
    },
    {
      full_name: "Ersana, S.Pd.",
      username: "ersana",
      role: "pewawancara_cawalsan",
      secondary_roles: [],
      phone: "081285300816",
      jenis_kelamin: "L",
    },
    {
      full_name: "Ahmad Farhan, Lc., M.A.",
      username: "ahmad.farhan",
      role: "pewawancara_cawalsan",
      secondary_roles: ["penguji_bahasa_arab"],
      phone: "081285300817",
      jenis_kelamin: "L",
    },
    {
      full_name: "Hardiansyah",
      username: "hardiansyah",
      role: "pewawancara_cawalsan",
      secondary_roles: [],
      phone: "081285300818",
      jenis_kelamin: "L",
    },
  ];

  const profileMap = new Map();

  for (const item of profilesData) {
    // Match STRICTLY by username first, or exact full_name
    let existing = await prisma.profile.findFirst({
      where: {
        OR: [
          { username: item.username },
          { full_name: item.full_name },
          // Specific ID matches for known pre-existing accounts
          ...(item.username === "azzam.aghnia" ? [{ id: "279a39f6-e26b-4c20-87d1-e0b7d12c90f5" }] : []),
          ...(item.username === "agus.cahyono" ? [{ id: "3e70be24-7840-4a09-aa35-49bbc1f21014" }] : []),
          ...(item.username === "zeidhan.ahmad" ? [{ id: "8b58479e-b3e6-427a-92d5-3f27d0f0ca78" }] : []),
          ...(item.username === "imron.abdillah" ? [{ id: "a9b7b336-13f8-4b97-8b75-a8559c9957e6" }] : []),
        ]
      }
    });

    if (existing) {
      existing = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          full_name: item.full_name,
          username: item.username,
          role: item.role,
          secondary_roles: item.secondary_roles,
          jenis_kelamin: item.jenis_kelamin,
          phone: existing.phone && existing.phone !== '-' ? existing.phone : item.phone,
          password_hash: existing.password_hash || passwordHash,
          plain_password: existing.plain_password || DEFAULT_PASSWORD_ULUL,
        }
      });
      console.log(`Updated profile: ${item.full_name} (${existing.username}) -> ${existing.id}`);
    } else {
      existing = await prisma.profile.create({
        data: {
          full_name: item.full_name,
          username: item.username,
          role: item.role,
          secondary_roles: item.secondary_roles,
          phone: item.phone,
          jenis_kelamin: item.jenis_kelamin,
          password_hash: passwordHash,
          plain_password: DEFAULT_PASSWORD_ULUL,
        }
      });
      console.log(`Created profile: ${item.full_name} (${existing.username}) -> ${existing.id}`);
    }
    profileMap.set(item.full_name, existing.id);
  }

  console.log("\n=== STEP 2: VERIFY UNIQUE PROFILE IDS ===");
  for (const [name, id] of profileMap.entries()) {
    console.log(`  ${name} => ${id}`);
  }

  // Ensure all IDs are unique!
  const uniqueIds = new Set(profileMap.values());
  if (uniqueIds.size !== profileMap.size) {
    throw new Error(`Duplicate Profile ID detected! Unique IDs: ${uniqueIds.size}, Total profiles: ${profileMap.size}`);
  }
  console.log("All 13 profiles have distinct, unique IDs! 🎉");

  console.log("\n=== STEP 3: GENERATE SLOTS FOR ULUL ALBAAB (21 OKT - 31 DES 2026) ===");

  const examinerSchedules = [
    // 1. Ade Vio Sulaiman (Penguji Al-Qur'an)
    {
      name: "Ade Vio Sulaiman",
      title: "Seleksi Al Qur'an (Ade Vio Sulaiman)",
      rules: [
        { days: [1], slots: [["13:00", "13:30"], ["13:30", "14:00"], ["14:00", "14:30"], ["14:30", "15:00"]] },
        { days: [2], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"]] },
        { days: [3], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"]] },
        { days: [4], slots: [["20:00", "20:30"], ["20:30", "21:00"], ["21:00", "21:30"], ["21:30", "22:00"]] },
        { days: [6], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"]] },
      ]
    },
    // 2. Muhammad Irsyad Adhya Putra (Penguji Al-Qur'an)
    {
      name: "Muhammad Irsyad Adhya Putra",
      title: "Seleksi Al Qur'an (Muhammad Irsyad Adhya Putra)",
      rules: [
        { days: [1], slots: [["13:00", "13:30"], ["13:30", "14:00"], ["14:00", "14:30"], ["14:30", "15:00"]] },
        { days: [2], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"]] },
        { days: [4], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"]] },
        { days: [5], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"]] },
        { days: [6], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"]] },
      ]
    },
    // 3. Agus Cahyono (Penguji Al-Qur'an)
    {
      name: "Agus Cahyono",
      title: "Seleksi Al Qur'an (Agus Cahyono)",
      rules: [
        { days: [1], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["16:00", "16:30"], ["16:30", "17:00"], ["20:00", "20:30"], ["20:30", "21:00"]] },
        { days: [2], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:20"], ["16:00", "16:30"], ["16:30", "17:00"], ["20:00", "20:30"], ["20:30", "21:00"]] },
        { days: [3], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["16:00", "16:30"], ["16:30", "17:00"], ["20:00", "20:30"], ["20:30", "21:00"]] },
        { days: [4], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["18:20", "18:50"], ["18:50", "19:20"], ["19:20", "19:50"], ["19:50", "20:30"]] },
        { days: [6], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:30"], ["09:30", "10:00"], ["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"], ["19:30", "20:00"], ["20:00", "20:30"]] },
        { days: [0], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:30"], ["09:30", "10:00"], ["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"], ["19:30", "20:00"], ["20:00", "20:30"]] },
      ]
    },
    // 4. Azzam Aghnia Ilman Azzauhari (Penguji Al-Qur'an)
    {
      name: "Azzam Aghnia Ilman Azzauhari",
      title: "Seleksi Al Qur'an (Azzam Aghnia Ilman Azzauhari)",
      rules: [
        { days: [1], slots: [["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"]] },
        { days: [2], slots: [["13:00", "13:30"], ["13:30", "14:00"], ["14:00", "14:30"]] },
        { days: [3], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"]] },
        { days: [4], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"]] },
        { days: [5], slots: [["13:00", "13:30"], ["13:30", "14:00"], ["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"]] },
        { days: [6], slots: [["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"]] },
        { days: [0], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["09:00", "09:30"], ["09:30", "10:00"]] },
      ]
    },
    // 5. Zeidhan Ahmad Maulana (Penguji Al-Qur'an)
    {
      name: "Zeidhan Ahmad Maulana",
      title: "Seleksi Al Qur'an (Zeidhan Ahmad Maulana)",
      rules: [
        { days: [1], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["11:00", "11:30"]] },
        { days: [2], slots: [["08:00", "08:30"], ["08:30", "09:00"], ["16:00", "16:30"], ["16:30", "17:00"]] },
        { days: [3], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["16:00", "16:30"], ["16:30", "17:00"]] },
        { days: [4], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"], ["16:00", "16:30"], ["16:30", "17:00"]] },
        { days: [5], slots: [["10:00", "10:40"], ["16:00", "16:30"], ["16:30", "17:00"]] },
        { days: [6], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"], ["16:00", "16:30"], ["16:30", "17:00"]] },
        { days: [0], slots: [["09:00", "09:30"], ["09:30", "10:00"], ["16:00", "16:30"], ["16:30", "17:00"]] },
      ]
    },
    // 6. Muhajir (Pewawancara Calon Santri)
    {
      name: "Muhajir",
      title: "Seleksi Wawancara Calon Santri (Muhajir)",
      rules: [
        { days: [3], slots: [["13:00", "13:30"], ["13:30", "14:00"]] },
        { days: [4], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"], ["13:00", "13:30"], ["13:30", "14:00"]] },
        { days: [5], slots: [["14:00", "14:30"], ["14:30", "15:00"]] },
        { days: [6], slots: [["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"], ["13:00", "13:30"], ["13:30", "14:00"]] },
      ]
    },
    // 7. Muhammad Syauqi Al Faruq (Pewawancara Calon Santri)
    {
      name: "Muhammad Syauqi Al Faruq",
      title: "Seleksi Wawancara Calon Santri (Muhammad Syauqi Al Faruq)",
      rules: [
        { days: [2], slots: [["20:00", "20:30"]] },
        { days: [3], slots: [["20:00", "20:30"]] },
        { days: [4], slots: [["20:15", "20:30"]] },
        { days: [6], slots: [["13:00", "13:30"], ["13:30", "14:00"], ["18:00", "18:30"]] },
        { days: [0], slots: [["10:00", "10:30"]] },
      ]
    },
    // 8. Ilham Muharom, S.Pd. (Pewawancara Calon Santri)
    {
      name: "Ilham Muharom, S.Pd.",
      title: "Seleksi Wawancara Calon Santri (Ilham Muharom, S.Pd.)",
      rules: [
        { days: [1], slots: [["13:00", "13:30"]] },
        { days: [5], slots: [["16:00", "16:30"]] },
      ]
    },
    // 9. Imron Abdillah, S.Pd. - Peran 1: Pewawancara Calon Santri
    {
      name: "Imron Abdillah, S.Pd.",
      title: "Seleksi Wawancara Calon Santri (Imron Abdillah, S.Pd.)",
      rules: [
        { days: [6], slots: [["13:30", "14:00"], ["14:00", "14:30"]] },
        { days: [0], slots: [["13:30", "14:00"], ["14:00", "14:30"]] },
      ]
    },
    // Imron Abdillah, S.Pd. - Peran 2: Penguji Tes Lisan Bahasa Arab (Khusus SMA)
    {
      name: "Imron Abdillah, S.Pd.",
      title: "Tes Lisan Bahasa Arab (Imron Abdillah, S.Pd.)",
      rules: [
        { days: [6], slots: [["13:30", "14:00"], ["14:00", "14:30"]] },
        { days: [0], slots: [["13:30", "14:00"], ["14:00", "14:30"]] },
      ]
    },
    // 10. Muhammad Adib Achsan, S.Pd. (Pewawancara Calon Wali)
    {
      name: "Muhammad Adib Achsan, S.Pd.",
      title: "Seleksi Wawancara Calon Orangtua/Wali Santri (Muhammad Adib Achsan, S.Pd.)",
      rules: [
        { days: [1, 2, 4, 6], slots: [["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"], ["15:30", "16:00"]] },
      ]
    },
    // 11. Ersana, S.Pd. (Pewawancara Calon Wali)
    {
      name: "Ersana, S.Pd.",
      title: "Seleksi Wawancara Calon Orangtua/Wali Santri (Ersana, S.Pd.)",
      rules: [
        { days: [1, 2, 3, 4, 6], slots: [["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"], ["15:30", "16:00"]] },
      ]
    },
    // 12. Ahmad Farhan, Lc., M.A. - Peran 1: Pewawancara Calon Wali
    {
      name: "Ahmad Farhan, Lc., M.A.",
      title: "Seleksi Wawancara Calon Orangtua/Wali Santri (Ahmad Farhan, Lc., M.A.)",
      rules: [
        { days: [3, 6], slots: [["13:30", "14:00"], ["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"], ["15:30", "16:00"]] },
      ]
    },
    // Ahmad Farhan, Lc., M.A. - Peran 2: Penguji Tes Lisan Bahasa Arab (Khusus SMA)
    {
      name: "Ahmad Farhan, Lc., M.A.",
      title: "Tes Lisan Bahasa Arab (Ahmad Farhan, Lc., M.A.)",
      rules: [
        { days: [3, 6], slots: [["13:30", "14:00"], ["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"], ["15:30", "16:00"]] },
      ]
    },
    // 13. Hardiansyah (Pewawancara Calon Wali)
    {
      name: "Hardiansyah",
      title: "Seleksi Wawancara Calon Orangtua/Wali Santri (Hardiansyah)",
      rules: [
        { days: [1, 3, 4, 6], slots: [["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"], ["15:30", "16:00"]] },
      ]
    },
  ];

  const startDate = new Date("2026-10-21T00:00:00+07:00");
  const endDate = new Date("2026-12-31T23:59:59+07:00");

  let totalCreated = 0;
  const sessionsToCreate = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0-6
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    for (const examiner of examinerSchedules) {
      const creatorId = profileMap.get(examiner.name);
      if (!creatorId) {
        console.warn(`Profile ID not found for ${examiner.name}`);
        continue;
      }

      for (const rule of examiner.rules) {
        if (rule.days.includes(dayOfWeek)) {
          for (const [startT, endT] of rule.slots) {
            const startWIB = new Date(`${dateStr}T${startT}:00+07:00`);
            const endWIB = new Date(`${dateStr}T${endT}:00+07:00`);

            sessionsToCreate.push({
              title: examiner.title,
              start_time: startWIB,
              end_time: endWIB,
              quota: 1,
              booked_count: 0,
              location: "Online / Google Meet",
              notes: `Jadwal Penguji: ${examiner.name}`,
              is_active: true,
              created_by: creatorId,
            });
          }
        }
      }
    }
  }

  console.log(`Total exam sessions prepared to insert: ${sessionsToCreate.length}`);

  const CHUNK_SIZE = 500;
  for (let i = 0; i < sessionsToCreate.length; i += CHUNK_SIZE) {
    const chunk = sessionsToCreate.slice(i, i + CHUNK_SIZE);
    await prisma.examSession.createMany({
      data: chunk,
    });
    totalCreated += chunk.length;
    console.log(`Inserted ${totalCreated} / ${sessionsToCreate.length} sessions...`);
  }

  console.log(`✅ ULUL ALBAAB: Successfully generated ${totalCreated} exam sessions with distinct creator IDs!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
