import { Controller, Post, ForbiddenException } from "@nestjs/common";
import { resetTest } from "../../prisma/db-utils";

@Controller("test")
export class TestController {
  @Post("reset")
  async reset() {
    if (process.env.ENABLE_TEST_ENDPOINT !== "true") {
      throw new ForbiddenException(
        "Test endpoint disabled (ENABLE_TEST_ENDPOINT not set)",
      );
    }

    const dbName = process.env.DATABASE_NAME || "";
    if (process.env.NODE_ENV === "production" || dbName.includes("prod")) {
      throw new ForbiddenException("Refuse to reset production database");
    }

    await resetTest();

    return { ok: true };
  }
}
