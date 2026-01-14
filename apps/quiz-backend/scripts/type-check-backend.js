#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

// Run tsc from project-local binaries and ignore any extra CLI args passed by pnpm
const tscBin = path.resolve(__dirname, "../node_modules/.bin/tsc");
const args = ["-p", path.resolve(__dirname, "../tsconfig.json"), "--noEmit"];

const res = spawnSync(tscBin, args, { stdio: "inherit" });
process.exit(res.status || 0);
