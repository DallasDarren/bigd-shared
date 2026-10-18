#!/usr/bin/env node
// Vendor bigd-shared's brand layer into an app that doesn't depend on bigd-shared
// (e.g. Dice Live, whose Docker build has no git to fetch the github: dependency).
//
//   node <path-to>/bigd-shared/scripts/vendor-brand.mjs <destDir>
//
// Writes <destDir>/brand/ (kit copy) and <destDir>/src/{tailwind.js,brand.css}, the same
// layout as bigd-shared, so the app imports them exactly like the package:
//   tailwind.config.js:  import { bigdPreset } from './vendor/bigd-shared/src/tailwind.js'
//   index.css:           @import '../vendor/bigd-shared/src/brand.css';
// Re-run after bigd-shared's brand changes; commit the result. Never edit the copy.

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = process.argv[2] && resolve(process.argv[2])
if (!dest) {
  console.error('Usage: vendor-brand.mjs <destDir>')
  process.exit(1)
}
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version

rmSync(dest, { recursive: true, force: true })
mkdirSync(join(dest, 'src'), { recursive: true })
cpSync(join(root, 'brand'), join(dest, 'brand'), { recursive: true })
for (const f of ['tailwind.js', 'brand.css']) cpSync(join(root, 'src', f), join(dest, 'src', f))
writeFileSync(
  join(dest, 'README.md'),
  `# Vendored from bigd-shared v${version}\n\n` +
    `The bigd. brand layer (kit copy in \`brand/\`, Tailwind preset and base CSS in \`src/\`), copied by\n` +
    `\`bigd-shared/scripts/vendor-brand.mjs\`. Do not edit; re-run that script to update.\n` +
    `Source of truth: the brand kit in BigDApps/brand (see bigd-shared/CLAUDE.md, "Brand").\n`,
)
console.log(`Vendored bigd-shared v${version} brand -> ${dest}`)
