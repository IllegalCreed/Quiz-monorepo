const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(
    fs.readFileSync(__dirname + "/data/seed.json", "utf-8")
  );

  for (const q of data) {
    const created = await prisma.question.create({
      data: {
        stem: q.stem,
        explanation: q.explanation,
        tags: q.tags,
        options: {
          create: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
    });
    console.log("Inserted question", created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
