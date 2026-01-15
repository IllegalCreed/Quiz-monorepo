import {
  Controller,
  Post,
  ForbiddenException,
  InternalServerErrorException,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

function _getDatabaseNameFromEnv(): string {
  if (process.env.DATABASE_NAME) return process.env.DATABASE_NAME;
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    return u.pathname.replace("/", "");
  } catch {
    return "";
  }
}

/**
 * Validate the incoming reset request. Throws an exception on failure.
 * Exported for unit testing.
 */
export function validateResetRequest(req: Request): void {
  if (process.env.ENABLE_TEST_ENDPOINT !== "true") {
    throw new ForbiddenException(
      "Test endpoint disabled (ENABLE_TEST_ENDPOINT not set)",
    );
  }

  const secret = process.env.TEST_RESET_SECRET;
  if (!secret) {
    throw new InternalServerErrorException(
      "Test reset secret not configured on server",
    );
  }

  const header = req.headers["x-reset-secret"];
  let provided: string | undefined;
  if (Array.isArray(header)) {
    provided = String(header[0]);
  } else if (typeof header === "string") {
    provided = header;
  } else {
    provided = undefined;
  }

  if (!provided || provided !== secret) {
    throw new ForbiddenException("Invalid or missing reset secret");
  }

  const dbName = _getDatabaseNameFromEnv();
  if (!dbName.toLowerCase().includes("test")) {
    throw new ForbiddenException(
      "Refuse to reset non-test database (database name must include 'test')",
    );
  }
}

@Controller("test")
export class TestController {
  @Post("reset")
  async reset(@Req() req: Request) {
    // Validate request (auth + db name checks)
    validateResetRequest(req);

    // Lazy import to avoid loading db-utils at module init (it expects caller to set env)
    let resetTest: (() => Promise<void>) | undefined;
    try {
      // import dynamically so missing DATABASE_URL doesn't break app boot
      const mod = await import("../../prisma/db-utils.js");
      resetTest = mod.resetTest;
    } catch {
      throw new InternalServerErrorException("Unable to load resetTest helper");
    }

    if (!resetTest) {
      throw new InternalServerErrorException("resetTest is not available");
    }

    await resetTest();

    return { ok: true };
  }
}
