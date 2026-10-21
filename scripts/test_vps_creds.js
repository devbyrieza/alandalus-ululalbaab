const { PrismaClient } = require('@prisma/client');

const passwords = [
  'password123',
  'nhzYTBmfqk8RUhOoYHmvkbzoN2OhN',
  'SKBalimam26!',
  'PUAS2026!',
  'Puas2026!',
  'Andalus2026!',
  'admin',
  'postgres'
];

const users = ['admin_ulul', 'postgres'];

async function testCreds() {
  for (const user of users) {
    for (const pass of passwords) {
      const url = `postgresql://${user}:${encodeURIComponent(pass)}@72.61.141.50:5436/db_ululalbaab_prod`;
      const p = new PrismaClient({ datasources: { db: { url } } });
      try {
        const count = await p.profile.count();
        console.log(`🎉 SUCCESS! user: ${user}, pass: ${pass}, profiles: ${count}`);
        await p.$disconnect();
        return { user, pass, url };
      } catch (err) {
        // failed
      } finally {
        await p.$disconnect();
      }
    }
  }
  console.log("None of the standard passwords matched db_ululalbaab_prod on 5436.");
}

testCreds();
