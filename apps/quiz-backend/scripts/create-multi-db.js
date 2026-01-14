#!/usr/bin/env node
// Simple script: create dev/test/prod databases and users on a MySQL-compatible server (e.g., RDS)
// Usage:
//  - copy .env.create-db.example -> .env.create-db.local and set root credentials
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

const devDb = process.env.DEV_DATABASE_NAME || "quiz_dev";
const devUser = process.env.DEV_DATABASE_USER || "quiz_dev_user";
const devPwd =
  process.env.DEV_DATABASE_PASSWORD ||
  crypto.randomBytes(12).toString("base64");

const testDb = process.env.TEST_DATABASE_NAME || "quiz_test";
const testUser = process.env.TEST_DATABASE_USER || "quiz_test_user";
const testPwd =
  process.env.TEST_DATABASE_PASSWORD ||
  crypto.randomBytes(12).toString("base64");

const prodDb = process.env.PROD_DATABASE_NAME || "quiz_prod";
const prodUser = process.env.PROD_DATABASE_USER || "quiz_prod_user";
const prodPwd =
  process.env.PROD_DATABASE_PASSWORD ||
  crypto.randomBytes(12).toString("base64");

async function ensure(conn, db, user, pwd) {
  console.log(`Ensuring database ${db}...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\`;`);
  console.log(`Ensuring user ${user}...`);
  await conn.query(
    `CREATE USER IF NOT EXISTS \`${user}\`@'%' IDENTIFIED BY ?;`,
    [pwd],
  );
  await conn.query(`GRANT ALL PRIVILEGES ON \`${db}\`.* TO \`${user}\`@'%';`);
  console.log(`Ensured ${db} / ${user}`);
}

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
    await ensure(conn, devDb, devUser, devPwd);
    await ensure(conn, testDb, testUser, testPwd);
    await ensure(conn, prodDb, prodUser, prodPwd);

    await conn.query("FLUSH PRIVILEGES;");

    console.log("\nSummary (store these secrets safely):");
    console.log(`DEV DB: ${devDb}`);
    console.log(`DEV USER: ${devUser}`);
    console.log(`DEV PASSWORD: ${devPwd}`);
    console.log(`TEST DB: ${testDb}`);
    console.log(`TEST USER: ${testUser}`);
    console.log(`TEST PASSWORD: ${testPwd}`);
    console.log(`PROD DB: ${prodDb}`);
    console.log(`PROD USER: ${prodUser}`);
    console.log(`PROD PASSWORD: ${prodPwd}`);

    console.log(
      "\nCopy these to apps/quiz-backend/.env.*.local as appropriate and keep them secure.",
    );
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Failed to create DB/users:", err);
  process.exit(1);
});
