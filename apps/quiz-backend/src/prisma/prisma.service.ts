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

    if (process.env.DATABASE_URL) {
      try {
        const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
        console.log(
          "[PrismaService] adapter created:",
          typeof adapter,
          adapter ? Object.keys(adapter) : adapter,
        );
        super({ adapter });
      } catch (err) {
        console.error("[PrismaService] error constructing PrismaClient:", err);
        throw err;
      }
    } else {
      // Prisma v7 requires a valid PrismaClientOptions at construction time.
      // Fail fast with a helpful message instead of letting Prisma throw a cryptic error.
      const msg =
        "DATABASE_URL is not set — PrismaClient requires an adapter at runtime.\n" +
        "Set DATABASE_URL (e.g., via .env.test.local or env var) or run the app in a mode that does not initialize DB (tests that mock Prisma).";
      console.error("[PrismaService] " + msg);
      // Call super with empty options so that all constructor code paths invoke super()
      // (avoids `constructor-super` ESLint warning). We still throw afterwards to fail fast.
      super({});
      throw new Error(msg);
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
