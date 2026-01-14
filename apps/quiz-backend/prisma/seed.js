const path = require("path");
const dotenv = require("dotenv");
// Try multiple env files if DATABASE_URL isn't set already
dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../.env.development.local") });
  dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
}

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const fs = require("fs");

console.log("DATABASE_URL used for seeding:", process.env.DATABASE_URL);
const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const data = JSON.parse(
    fs.readFileSync(__dirname + "/data/seed.json", "utf-8"),
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
