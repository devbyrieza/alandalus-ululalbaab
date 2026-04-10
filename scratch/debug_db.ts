
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.pembayaran.findMany({
    take: 5,
    include: { pendaftar: true }
  })
  console.log(JSON.stringify(p, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
