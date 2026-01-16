import {
  Controller,
  Post,
  Get,
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
      // Try compiled JS first (when running from dist), then TS (when running via ts-node)
      let mod: unknown;
      try {
        mod = await import("../../prisma/db-utils.js");
      } catch (e1) {
        try {
          // Try import without extension (works for ts-node and when package exports .ts)
          // @ts-expect-error: dynamic resolution at runtime (may resolve to .ts or .js)
          mod = await import("../../prisma/db-utils");
        } catch (e2) {
          // Log both errors for debugging
          console.error("Failed to import db-utils (js):", e1);
          console.error("Failed to import db-utils (no ext):", e2);
          throw new InternalServerErrorException(
            "Unable to load resetTest helper",
          );
        }
      }
      resetTest = (mod as { resetTest?: () => Promise<void> })?.resetTest;
    } catch (e) {
      // Surface the error for easier diagnosis
      console.error("Error loading resetTest helper:", e);
      throw new InternalServerErrorException("Unable to load resetTest helper");
    }

    if (!resetTest) {
      throw new InternalServerErrorException("resetTest is not available");
    }

    await resetTest();

    return { ok: true };
  }

  // Lightweight readiness endpoint that does NOT touch the database.
  // Used by preview/test orchestration to ensure the backend process is running and
  // the test endpoints are enabled without triggering DB queries that might fail
  // during transient DB connectivity issues.
  @Get("ready")
  ready() {
    if (process.env.ENABLE_TEST_ENDPOINT !== "true") {
      throw new ForbiddenException(
        "Test endpoint disabled (ENABLE_TEST_ENDPOINT not set)",
      );
    }
    if (!process.env.TEST_RESET_SECRET) {
      throw new InternalServerErrorException(
        "Test reset secret not configured on server",
      );
    }
    return { ok: true };
  }

  // Lightweight unconditional health check used by orchestration scripts to
  // verify the HTTP server is running. Intentionally does NOT access the DB
  // or require any environment variables.
  @Get("hello")
  hello() {
    return { ok: true };
  }
}
