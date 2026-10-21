const { PrismaClient } = require('@prisma/client');

async function testSupabase() {
  const url = "postgresql://postgres:SKBalimam26%21@db.hcknodoayqarjbrzcgrp.supabase.co:5432/postgres";
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const p = await prisma.pendaftar.count();
    console.log("Supabase pendaftar count:", p);
    const sma = await prisma.pendaftar.findFirst({
      where: { nomor_pendaftaran: 'SMA2700004' }
    });
    console.log("Found in Supabase SMA2700004:", sma);
  } catch (e) {
    console.error("Supabase error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSupabase();
