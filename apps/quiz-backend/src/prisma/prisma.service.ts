import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    if (process.env.DATABASE_URL) {
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
      super({ adapter });
    } else {
      // No DB configured (e.g., in some test environments) — construct a client without adapter.
      super();
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
