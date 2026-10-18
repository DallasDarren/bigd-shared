#!/usr/bin/env node
// Copy one app's icon set from bigd-shared/brand/icons into that app's public/ folder.
//
//   node node_modules/bigd-shared/scripts/install-icons.mjs <app> [publicDir=public]
//   app: bigd (the hub) | darts | dice | cards | shoebox
//
// Writes (overwrites) these files, which the app commits:
//   favicon.svg               small-size favicon master, top-right tile in the app's light
//   favicon.ico               hub only (the kit ships the .ico for bigd. only)
//   icons/app.svg             full app icon (bone tiles on ink)
//   icons/app-192.png, icons/app-512.png
//   icons/maskable-512.png    Android maskable (smaller mark, safe zone)
//   icons/apple-touch-180.png
//
// The icons are committed in each app rather than copied at build time, so a deploy never
// depends on this script running. Re-run it after bumping bigd-shared when the kit changes.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const icons = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'brand', 'icons')
const tokens = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'brand', 'tokens.json'), 'utf8'),
)
const [app, publicDir = 'public'] = process.argv.slice(2)
const lights = Object.fromEntries(Object.entries(tokens.lights).map(([k, v]) => [k, v.hex.toLowerCase()]))
const appLight = Object.fromEntries(Object.entries(tokens.apps).map(([k, v]) => [k, v.light]))

if (!appLight[app]) {
  console.error(`Usage: install-icons.mjs <${Object.keys(appLight).join('|')}> [publicDir]`)
  process.exit(1)
}
const pub = resolve(publicDir)
mkdirSync(join(pub, 'icons'), { recursive: true })
const cp = (from, to) => copyFileSync(join(icons, from), join(pub, to))

cp(`app-${app}.svg`, 'icons/app.svg')
cp(`app-${app}-192.png`, 'icons/app-192.png')
cp(`app-${app}-512.png`, 'icons/app-512.png')
cp(`maskable-${app}-512.png`, 'icons/maskable-512.png')
cp(`apple-touch-${app}.png`, 'icons/apple-touch-180.png')

// The kit's favicon master (wider gaps for 16-32 px) is lit green for bigd. For an app,
// relight the same geometry in the app's colour; rule 1 is unchanged (top-right tile only).
const master = readFileSync(join(icons, 'favicon.svg'), 'utf8')
const green = lights.green
if (!master.includes(`fill="${green}"`)) throw new Error('favicon.svg: lit tile colour not found')
// Names per the voice rules: Shoebox keeps its own name, the scorekeepers are "BigD <App>".
const name = app === 'bigd' ? 'bigd.' : app === 'shoebox' ? 'Shoebox' : `BigD ${tokens.apps[app].name}`
const fav = master
  .replace(`fill="${green}"`, `fill="${lights[appLight[app]]}"`)
  .replace(/aria-label="[^"]*"/, `aria-label="${name}"`)
  .replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`)
writeFileSync(join(pub, 'favicon.svg'), fav)
if (app === 'bigd') cp('favicon.ico', 'favicon.ico')

console.log(`Installed ${app} icons -> ${pub}`)
