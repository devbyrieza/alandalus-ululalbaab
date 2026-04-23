import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2600001' },
    include: { pembayaran: true }
  });

  if (!pendaftar) {
    console.log('Pendaftar MTA2600001 not found');
    return;
  }

  console.log('Current Status:', pendaftar.status_pendaftaran);
  
  const verifiedPayment = pendaftar.pembayaran.find(p => p.status_pembayaran === 'verified');
  
  if (verifiedPayment) {
    console.log('Found verified payment!');
    if (pendaftar.status_pendaftaran !== 'verified' && pendaftar.status_pendaftaran !== 'data_completed' && !pendaftar.status_pendaftaran.startsWith('docs_')) {
       console.log('Updating status to verified...');
       await prisma.pendaftar.update({
         where: { id: pendaftar.id },
         data: { status_pendaftaran: 'verified' }
       });
       console.log('Done!');
    } else {
       console.log('Status is already high enough:', pendaftar.status_pendaftaran);
    }
  } else {
    console.log('No verified payment found for this user.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
