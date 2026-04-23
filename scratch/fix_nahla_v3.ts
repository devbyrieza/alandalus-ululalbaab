import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://admin_ulul:password123@72.61.141.50:5436/db_ululalbaab_prod"
    }
  }
});

async function main() {
  const pendaftar = await prisma.pendaftar.findFirst({
    where: { 
      OR: [
        { nik: '3175044805141002' },
        { nama_lengkap: { contains: 'Nahla', mode: 'insensitive' } }
      ]
    },
    include: { pembayaran: true }
  });

  if (pendaftar) {
     console.log('Found Nahla:', JSON.stringify({
       id: pendaftar.id,
       nomor_pendaftaran: pendaftar.nomor_pendaftaran,
       status_pendaftaran: pendaftar.status_pendaftaran,
       pembayaran: pendaftar.pembayaran.map(p => ({ id: p.id, status: p.status_pembayaran }))
     }, null, 2));
     
     if (pendaftar.status_pendaftaran !== 'verified') {
        console.log('Updating status to verified...');
        await prisma.pendaftar.update({
          where: { id: pendaftar.id },
          data: { status_pendaftaran: 'verified' }
        });
        console.log('Success!');
     }
  } else {
    console.log('Nahla not found in prod DB.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
