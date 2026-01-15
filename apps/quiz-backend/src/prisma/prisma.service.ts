import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Add runtime logging to help debug PrismaClient initialization issues
    // (this will be compiled into dist for easier reproduction).
    console.log("[PrismaService] DATABASE_URL:", !!process.env.DATABASE_URL);
    try {
      if (process.env.DATABASE_URL) {
        const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
        console.log(
          "[PrismaService] adapter created:",
          typeof adapter,
          adapter ? Object.keys(adapter) : adapter,
        );
        super({ adapter });
      } else {
        // Prisma v7 requires a valid PrismaClientOptions at construction time.
        // Fail fast with a helpful message instead of letting Prisma throw a cryptic error.
        const msg =
          "DATABASE_URL is not set — PrismaClient requires an adapter at runtime.\n" +
          "Set DATABASE_URL (e.g., via .env.test.local or env var) or run the app in a mode that does not initialize DB (tests that mock Prisma).";
        console.error("[PrismaService] " + msg);
        throw new Error(msg);
      }
    } catch (err) {
      console.error("[PrismaService] error constructing PrismaClient:", err);
      throw err;
    }
  }

  async onModuleInit() {
    if (process.env.DATABASE_URL) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
