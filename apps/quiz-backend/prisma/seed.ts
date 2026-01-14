import path from "path";
import dotenv from "dotenv";
// Load env files if present
dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(
      process.cwd(),
      "apps/quiz-backend/.env.development.local",
    ),
  });
  dotenv.config({
    path: path.resolve(process.cwd(), "apps/quiz-backend/.env.local"),
  });
}

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import fs from "fs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const data = JSON.parse(
    fs.readFileSync(new URL("./data/seed.json", import.meta.url), "utf-8"),
  );

  for (const q of data) {
    const created = await prisma.question.create({
      data: {
        stem: q.stem,
        explanation: q.explanation,
        tags: q.tags,
        options: {
          create: q.options.map((o: any) => ({
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
