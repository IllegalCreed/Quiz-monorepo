import fs from "fs";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../.env.create-db.local");

function ensureEnvFile() {
  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Missing ${envPath}. Create it from .env.create-db.example and fill DB_ROOT_* and DATABASE_HOST`,
    );
  }
}

function loadEnv() {
  const res = dotenv.config({ path: envPath });
  if (res.error) throw res.error;
  return process.env;
}

function genPassword() {
  return crypto.randomBytes(24).toString("base64url");
}

function mask(s?: string) {
  if (!s) return "(not set)";
  if (s.length <= 6) return "***";
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}

function writeEnv(updates: Record<string, string>) {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split(/\r?\n/);
  const out = lines.map((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (!m) return line;
    const key = m[1];
    if (updates[key] !== undefined) {
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  // add any missing keys at the end
  for (const [k, v] of Object.entries(updates)) {
    if (!lines.some((l) => l.startsWith(`${k}=`))) {
      out.push(`${k}=${v}`);
    }
  }

  fs.writeFileSync(envPath, out.join("\n"), { mode: 0o600 });
}

async function rotate(shouldApply: boolean) {
  ensureEnvFile();
  const env = loadEnv();

  const rootUser = env.DB_ROOT_USERNAME;
  const rootPass = env.DB_ROOT_PASSWORD;
  const host = env.DATABASE_HOST;
  const port = Number(env.DATABASE_PORT ?? 3306);

  if (!rootUser || !rootPass || !host) {
    throw new Error(
      "DB_ROOT_USERNAME, DB_ROOT_PASSWORD and DATABASE_HOST must be set in .env.create-db.local",
    );
  }

  const users = [
    { nameKey: "DEV_DATABASE_USER", passKey: "DEV_DATABASE_PASSWORD" },
    { nameKey: "TEST_DATABASE_USER", passKey: "TEST_DATABASE_PASSWORD" },
    { nameKey: "PROD_DATABASE_USER", passKey: "PROD_DATABASE_PASSWORD" },
  ];

  const plan: Array<{ user: string; newPass: string }> = [];
  for (const u of users) {
    const user = env[u.nameKey];
    if (!user) continue;
    const newPass = genPassword();
    plan.push({ user, newPass });
  }

  console.log("Password rotation plan (masked):");
  for (const p of plan) {
    console.log(` - ${p.user}: ${mask(p.newPass)}`);
  }

  if (!shouldApply) {
    console.log(
      "Dry-run mode. Rerun with `--yes` to apply changes and write new passwords to `.env.create-db.local`.",
    );
    return;
  }

  // Apply changes
  const conn = await mysql.createConnection({
    host,
    port,
    user: rootUser,
    password: rootPass,
    multipleStatements: true,
  });

  try {
    for (const p of plan) {
      console.log(`Altering password for ${p.user}`);
      // Try different ALTER syntaxes to support various MySQL/MariaDB versions
      const statements = [
        `ALTER USER '${p.user}'@'%' IDENTIFIED BY '${p.newPass}';`,
        `SET PASSWORD FOR '${p.user}'@'%' = '${p.newPass}';`,
      ];
      let success = false;
      for (const s of statements) {
        try {
          await conn.query(s);
          success = true;
          break;
        } catch (err) {
          // try next
          console.debug(
            "alter user attempt failed:",
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      if (!success) {
        console.warn(
          `Failed to alter password for ${p.user}. The user may not exist or SQL is unsupported.`,
        );
      }
    }
  } finally {
    await conn.end();
  }

  // write to .env.create-db.local
  const updates: Record<string, string> = {};
  for (let i = 0; i < users.length; i++) {
    const key = users[i].passKey;
    if (plan[i]) updates[key] = plan[i].newPass;
  }

  writeEnv(updates);
  console.log(`Wrote new passwords to ${envPath} (file mode 0600).`);
  console.log("Done.");
}

// CLI
const args = process.argv.slice(2);
const yes = args.includes("--yes") || process.env.ROTATE_DB_YES === "true";

void rotate(yes).catch((err) => {
  console.error(
    "Failed to rotate passwords:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
