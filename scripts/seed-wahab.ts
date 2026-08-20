import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('2026#@', 10);
  
  const existing = await prisma.profile.findFirst({
    where: { username: 'wahabrajasam' }
  });

  if (existing) {
    console.log('Account already exists for wahabrajasam');
    return;
  }

  await prisma.profile.create({
    data: {
      username: 'wahabrajasam',
      email: 'mudir@pesantren-alandalus.com',
      full_name: 'Wahab Rajasam, M.Pd.',
      role: 'admin_super',
      phone: '-',
      password_hash,
      must_change_password: false,
      plain_password: '2026#@'
    }
  });

  console.log('Successfully seeded admin_super wahabrajasam');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
