#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const dist = path.resolve(__dirname, "../dist/index.d.ts");
// Normalize and rewrite dist/index.d.ts to a canonical, minimal declaration
// Run tsc to validate generated declaration files; don't overwrite them.
try {
  // Run tsc directly (script runs in package cwd so no -C needed)
  execSync("tsc -p tsconfig.dtscheck.json", {
    stdio: "inherit",
  });
  console.log("d.ts check: OK");
  process.exit(0);
} catch (e) {
  console.error("d.ts check failed");
  process.exit(1);
}
