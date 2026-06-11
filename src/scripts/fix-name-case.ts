import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toTitleCase(str: string) {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

async function main() {
  const pendaftarList = await prisma.pendaftar.findMany({
    select: { id: true, nama_lengkap: true }
  });
  
  let updatedCount = 0;
  for (const p of pendaftarList) {
    if (!p.nama_lengkap) continue;
    const titleCased = toTitleCase(p.nama_lengkap);
    if (titleCased !== p.nama_lengkap) {
      await prisma.pendaftar.update({
        where: { id: p.id },
        data: { nama_lengkap: titleCased }
      });
      console.log(`Updated: "${p.nama_lengkap}" -> "${titleCased}"`);
      updatedCount++;
    }
  }
  console.log(`\nDone! Updated ${updatedCount} records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
