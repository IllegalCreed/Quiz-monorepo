import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync(new URL('./data/seed.json', import.meta.url), 'utf-8'));

  for (const q of data) {
    const created = await prisma.question.create({
      data: {
        stem: q.stem,
        explanation: q.explanation,
        tags: q.tags,
        options: {
          create: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect }))
        }
      }
    });
    console.log('Inserted question', created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
