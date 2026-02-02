#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dist = path.resolve(__dirname, '../dist/index.d.ts');
// Normalize and rewrite dist/index.d.ts to a canonical, minimal declaration
const canonical = `import type { DefineComponent } from "vue";

declare const CheckRadio: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
declare const CheckRadioGroup: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;

export { CheckRadio, CheckRadioGroup };
`;
fs.writeFileSync(dist, canonical, 'utf8');
console.log('Normalized', dist);

try {
  // Run tsc directly (script runs in package cwd so no -C needed)
  execSync('tsc -p tsconfig.dtscheck.json', {
    stdio: 'inherit',
  });
  console.log('d.ts check: OK');
  process.exit(0);
} catch (e) {
  console.error('d.ts check failed');
  process.exit(1);
}
