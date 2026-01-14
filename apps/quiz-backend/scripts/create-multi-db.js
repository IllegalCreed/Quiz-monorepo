#!/usr/bin/env node
// Create multiple databases and users on a MySQL-compatible server (e.g., RDS)
// Usage:
//  - copy .env.create-db.example -> .env.create-db.local and set root credentials
//  - set CONFIRM_CREATE_PROD=true to allow creating a production DB
//  - run: node scripts/create-multi-db.js

const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const host = process.env.DATABASE_HOST || "127.0.0.1";
const port = process.env.DATABASE_PORT
  ? Number(process.env.DATABASE_PORT)
  : 3306;
const rootUser =
  process.env.DB_ROOT_USERNAME || process.env.DATABASE_USERNAME || "root";
const rootPassword =
  process.env.DB_ROOT_PASSWORD || process.env.DATABASE_PASSWORD || "";

const createProd =
  process.env.CREATE_PROD === "true" ||
  process.env.CONFIRM_CREATE_PROD === "true";

const prodDb = process.env.PROD_DATABASE_NAME || "quiz_prod";
const prodUser = process.env.PROD_DATABASE_USER || "quiz_prod_user";
const prodPwd =
  process.env.PROD_DATABASE_PASSWORD ||
  crypto.randomBytes(12).toString("base64");

const testDb = process.env.TEST_DATABASE_NAME || "quiz_test";
const testUser = process.env.TEST_DATABASE_USER || "quiz_test_user";
const testPwd =
  process.env.TEST_DATABASE_PASSWORD ||
  crypto.randomBytes(12).toString("base64");

async function main() {
  if (!rootPassword) {
    console.error(
      "DB root password is required. Set DB_ROOT_PASSWORD or DATABASE_PASSWORD in your .env.create-db.local.",
    );
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host,
    port,
    user: rootUser,
    password: rootPassword,
  });
  console.log(`Connected to ${host}:${port} as ${rootUser}`);

  try {
    // Ensure test DB
    console.log(`Ensuring test database ${testDb}...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${testDb}\`;`);
    console.log(`Ensuring test user ${testUser}...`);
    await conn.query(
      `CREATE USER IF NOT EXISTS \`${testUser}\`@'%' IDENTIFIED BY ?;`,
      [testPwd],
    );
    await conn.query(
      `GRANT ALL PRIVILEGES ON \`${testDb}\`.* TO \`${testUser}\`@'%';`,
    );
    console.log(`Test DB ${testDb} and user ${testUser} ensured.`);

    if (createProd) {
      console.log(`Ensuring prod database ${prodDb}...`);
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${prodDb}\`;`);
      console.log(`Ensuring prod user ${prodUser}...`);
      await conn.query(
        `CREATE USER IF NOT EXISTS \`${prodUser}\`@'%' IDENTIFIED BY ?;`,
        [prodPwd],
      );
      await conn.query(
        `GRANT ALL PRIVILEGES ON \`${prodDb}\`.* TO \`${prodUser}\`@'%';`,
      );
      console.log(`Prod DB ${prodDb} and user ${prodUser} ensured.`);
    } else {
      console.log(
        "Prod creation skipped. To create prod DB set CONFIRM_CREATE_PROD=true and re-run.",
      );
    }

    await conn.query("FLUSH PRIVILEGES;");

    console.log("\nSummary (store these secrets safely):");
    console.log(`TEST DB: ${testDb}`);
    console.log(`TEST USER: ${testUser}`);
    console.log(`TEST PASSWORD: ${testPwd}`);
    if (createProd) {
      console.log(`PROD DB: ${prodDb}`);
      console.log(`PROD USER: ${prodUser}`);
      console.log(`PROD PASSWORD: ${prodPwd}`);
    } else {
      console.log("PROD DB not created in this run");
    }

    console.log(
      "\nNow copy these values into your .env.test.local / .env.production.local as appropriate.",
    );
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Failed to create DB/users:", err);
  process.exit(1);
});
