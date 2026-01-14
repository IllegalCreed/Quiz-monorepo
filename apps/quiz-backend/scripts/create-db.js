#!/usr/bin/env node
// Simple script to create database if it doesn't exist using environment variables
// Usage: node scripts/create-db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const host = process.env.DATABASE_HOST || "127.0.0.1";
const port = process.env.DATABASE_PORT
  ? Number(process.env.DATABASE_PORT)
  : 3306;
const user = process.env.DATABASE_USERNAME || "root";
const password = process.env.DATABASE_PASSWORD || "";
const db = process.env.DATABASE_NAME || "quiz_dev";

(async () => {
  try {
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\`;`);
    console.log(`Database ${db} ensured`);
    await conn.end();
  } catch (err) {
    console.error("Failed to create database:", err);
    process.exit(1);
  }
})();
