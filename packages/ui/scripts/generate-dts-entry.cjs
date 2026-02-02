#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '../dist/types/src');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, 'index.d.ts');
const content = `// Auto-generated types-only entry for rollup
export { default as CheckRadio } from '../../../src/components/CheckRadio.vue.d.ts';
export { default as CheckRadioGroup } from '../../../src/components/CheckRadioGroup.vue.d.ts';
`;
fs.writeFileSync(file, content, 'utf8');
console.log('Wrote', file);
