
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 REORDERING NOMOR PENDAFTARAN (SAFE MODE)');
  console.log('='.repeat(50));

  // 1. Fetch ALL pendaftars (including soft-deleted) to avoid unique constraint issues
  const allPendaftars = await prisma.pendaftar.findMany({
    orderBy: { nama_lengkap: 'asc' }
  });

  console.log(`📊 Total non-deleted pendaftars: ${allPendaftars.length}`);

  // 2. Identify targets (non-draft, non-tester)
  const targets = allPendaftars.filter(p => {
    const isDraft = p.status_pendaftaran === 'draft';
    const isTester = p.nama_lengkap.toLowerCase().includes(' tes') || 
                     p.nama_lengkap.toLowerCase().startsWith('test ') || 
                     p.nama_lengkap.toLowerCase().includes('bypass');
    return p.deleted_at === null && !isDraft && !isTester;
  });

  console.log(`📊 Target pendaftars (non-draft, non-tester): ${targets.length}`);

  // 3. Step 2a: Set ALL to temporary numbers to clear unique constraints
  console.log('\n🔄 Step 2a: Setting temporary numbers for ALL active records...');
  for (const p of allPendaftars) {
    await prisma.pendaftar.update({
      where: { id: p.id },
      data: { nomor_pendaftaran: `TEMP_${p.id.slice(0, 8)}_${Date.now()}` }
    });
  }

  // 4. Step 2b: Assign final numbers to targets
  console.log('🔄 Step 2b: Assigning final numbers to targets...');
  const year = '26';
  const groups: Record<string, any[]> = {
    MTA: [], MTI: [], ILA: [], ILI: [], SMA: [], SMI: []
  };

  for (const p of targets) {
    let jenjang = (p.jenjang || 'MTS').toUpperCase();
    if (jenjang.includes('MTS')) jenjang = 'MTS';
    else if (jenjang.includes('IL')) jenjang = 'IL';
    else if (jenjang.includes('SMA')) jenjang = 'SMA';

    const isL = p.jenis_kelamin === 'L' || p.jenis_kelamin === 'Laki-laki';
    const isP = p.jenis_kelamin === 'P' || p.jenis_kelamin === 'Perempuan';

    let prefix = '';
    if (jenjang === 'MTS') prefix = isL ? 'MTA' : 'MTI';
    else if (jenjang === 'IL') prefix = isL ? 'ILA' : 'ILI';
    else if (jenjang === 'SMA') prefix = isL ? 'SMA' : 'SMI';

    if (prefix && groups[prefix]) {
      groups[prefix].push(p);
    }
  }

  const counters: Record<string, number> = {
    MTA: 0, MTI: 0, ILA: 0, ILI: 0, SMA: 0, SMI: 0
  };

  for (const prefix in groups) {
    const list = groups[prefix];
    list.sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));
    console.log(`   📦 Category ${prefix}: ${list.length} students`);

    for (const p of list) {
      counters[prefix]++;
      const newNum = `${prefix}${year}${String(counters[prefix]).padStart(5, '0')}`;
      await prisma.pendaftar.update({
        where: { id: p.id },
        data: { nomor_pendaftaran: newNum }
      });
    }
  }

  // 5. Step 2c: Assign secondary numbers to non-targets (Draft, etc.)
  console.log('🔄 Step 2c: Assigning offset numbers to non-targets...');
  const nonTargets = allPendaftars.filter(p => !targets.find(t => t.id === p.id));
  
  for (const p of nonTargets) {
    let jenjang = (p.jenjang || 'MTS').toUpperCase();
    if (jenjang.includes('MTS')) jenjang = 'MTS';
    else if (jenjang.includes('IL')) jenjang = 'IL';
    else if (jenjang.includes('SMA')) jenjang = 'SMA';

    const isL = p.jenis_kelamin === 'L' || p.jenis_kelamin === 'Laki-laki';
    const isP = p.jenis_kelamin === 'P' || p.jenis_kelamin === 'Perempuan';

    let prefix = '';
    if (jenjang === 'MTS') prefix = isL ? 'MTA' : 'MTI';
    else if (jenjang === 'IL') prefix = isL ? 'ILA' : 'ILI';
    else if (jenjang === 'SMA') prefix = isL ? 'SMA' : 'SMI';

    if (prefix) {
      counters[prefix]++;
      const newNum = `${prefix}${year}${String(counters[prefix] + 5000).padStart(5, '0')}`; // Use high offset
      await prisma.pendaftar.update({
        where: { id: p.id },
        data: { nomor_pendaftaran: newNum }
      });
    }
  }

  console.log('\n✨ Selesai!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
