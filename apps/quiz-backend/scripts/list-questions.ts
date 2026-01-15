import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

void (async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node list-questions.js <DATABASE_URL>");
    process.exit(1);
  }
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  try {
    const qs = await prisma.question.findMany({
      select: { id: true, stem: true },
    });
    console.log(qs);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(msg);
  } finally {
    await prisma.$disconnect();
  }
})();
