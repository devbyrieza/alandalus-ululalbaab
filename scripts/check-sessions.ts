import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.examSession.findMany({
    orderBy: { start_time: 'desc' },
    take: 10
  });
  console.log("Sessions:", sessions);
  
  const distinctTitles = await prisma.examSession.findMany({
    select: { title: true },
    distinct: ['title']
  });
  console.log("Distinct titles:", distinctTitles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
