import path from "path";
import fs from "fs";
import dotenv from "dotenv";

async function main() {
  const mode = process.argv[2] || "dev";
  if (!["dev", "test", "prod"].includes(mode)) {
    console.error("Usage: ts-node scripts/seed.ts <dev|test|prod>");
    process.exit(1);
  }

  // For test mode: explicitly load test env file
  if (mode === "test") {
    const p = path.resolve(__dirname, "../.env.test.local");
    if (!fs.existsSync(p)) {
      throw new Error(`Test env file not found at ${p}`);
    }
    dotenv.config({ path: p, override: true });
    console.log(`Loaded env from ${p}`);
  }

  // For dev mode: explicitly load dev env
  if (mode === "dev") {
    const p = path.resolve(__dirname, "../.env.development.local");
    if (!fs.existsSync(p)) {
      throw new Error(`Development env file not found at ${p}`);
    }
    dotenv.config({ path: p, override: true });
    console.log(`Loaded dev env from ${p}`);
  }

  // For prod: require explicit confirmation and then load prod env (single guard)
  if (mode === "prod") {
    if (process.env.QUIZ_ALLOW_PROD_SEED !== "true") {
      console.error(
        "Refusing to seed production: set QUIZ_ALLOW_PROD_SEED=true to confirm. This will load .env.production.local.",
      );
      process.exit(1);
    }
    const p = path.resolve(__dirname, "../.env.production.local");
    if (!fs.existsSync(p)) {
      throw new Error(`Production env file not found at ${p}`);
    }
    dotenv.config({ path: p, override: true });
    console.log(`Loaded production env from ${p}`);
  }

  // Import seeds (they will resolve DATABASE_URL using existing logic)
  type SeedModule = {
    seedSystem?: () => Promise<void>;
    resetTest?: () => Promise<void>;
  };

  const dbModule = (await import(
    path.join(__dirname, "../prisma/db-utils")
  )) as unknown;
  const db = dbModule as SeedModule;

  try {
    if (mode === "dev") {
      console.log("Seeding system data (dev)...");
      if (!db.seedSystem) throw new Error("seedSystem not available");
      await db.seedSystem();
      console.log("Done.");
    } else if (mode === "test") {
      console.log("Resetting and seeding test database (test)...");
      // Use resetTest to ensure deterministic test DB (clears then seeds)
      if (!db.resetTest) throw new Error("resetTest not available");
      await db.resetTest();
      console.log("Done.");
    } else {
      console.log("Seeding system data (prod)...");
      if (!db.seedSystem) throw new Error("seedSystem not available");
      await db.seedSystem();
      console.log("Done.");
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Seed failed:", msg);
    process.exit(1);
  } finally {
    // exit explicitly to avoid hanging prisma client
    process.exit(0);
  }
}

void main();
