import path from "path";
import dotenv from "dotenv";

async function main() {
  const mode = process.argv[2] || "dev";
  if (!["dev", "test", "prod"].includes(mode)) {
    console.error("Usage: ts-node scripts/seed.ts <dev|test|prod>");
    process.exit(1);
  }

  // Optionally load production env only when explicitly allowed to read it
  if (mode === "prod" && process.env.QUIZ_ALLOW_READ_PROD_ENV === "true") {
    const p = path.resolve(__dirname, "../.env.production.local");
    dotenv.config({ path: p, override: true });
    console.log(`Loaded production env from ${p}`);
  }

  // For test mode ensure NODE_ENV=test so db-utils will pick up test env files
  if (mode === "test") {
    process.env.NODE_ENV = "test";
  }

  // Safety guard for prod: require explicit confirmation var
  if (mode === "prod" && process.env.QUIZ_ALLOW_PROD_SEED !== "true") {
    console.error(
      "Refusing to seed production: set QUIZ_ALLOW_PROD_SEED=true to confirm and optionally QUIZ_ALLOW_READ_PROD_ENV=true to load .env.production.local",
    );
    process.exit(1);
  }

  // Import seeds (they will resolve DATABASE_URL using existing logic)
  let db: any;
  try {
    // Try commonjs require first (works with ts-node/register in CJS mode)
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    db = require("../prisma/db-utils");
  } catch (err) {
    // Fallback to dynamic import (supports ESM runtime)
    db = await import(path.join(__dirname, "../prisma/db-utils.ts"));
  }

  try {
    if (mode === "dev") {
      console.log("Seeding system data (dev)...");
      await db.seedSystem();
      console.log("Done.");
    } else if (mode === "test") {
      console.log("Resetting and seeding test database (test)...");
      // Use resetTest to ensure deterministic test DB (clears then seeds)
      await db.resetTest();
      console.log("Done.");
    } else {
      console.log("Seeding system data (prod)...");
      await db.seedSystem();
      console.log("Done.");
    }
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  } finally {
    // exit explicitly to avoid hanging prisma client
    process.exit(0);
  }
}

main();
