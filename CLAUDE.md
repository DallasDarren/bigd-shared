# BigD Apps — bigd-shared

Shared code for the BigD Apps suite: the entitlement model, the suite Header, and (since
v0.3.0) the **bigd. brand kit** for the apps. More shared UI (scoreboard, rules-page renderer)
will be added here later per the taxonomy in `BigDApps/CLAUDE.md`.

## What's in it
- `bigd-shared` / `bigd-shared/entitlements` — framework-free entitlement API.
- `bigd-shared/react` — `EntitlementProvider` + `useEntitlement()`, `Header`, `Mark` (JSX-free, buildless).
- `bigd-shared/tailwind` — `bigdPreset(app)`: the kit's Tailwind preset + the app's light as `accent`.
- `bigd-shared/brand.css` — self-hosted Sora + JetBrains Mono and the kit's `--bigd-*` CSS tokens.
- `bigd-shared/brand/*` — a copy of the kit's built outputs (tokens, fonts, icons, logo SVGs).

Source of truth for the Free vs Pass matrix is **`BigDApps/FREEMIUM.md`**; it is encoded
in `src/entitlements/plans.js`. Change FREEMIUM.md first, then plans.js.

## Model (recap)
ONE BigD Pass unlocks Pro across all apps. FREE vs PASS is a **runtime entitlement, never
separate codebases**. Free = single-game scoreboard on one device; Pass = more games, more
players, history/stats, cloud sync. Default entitlement = free (also the soft-launch default).

## API
```js
import { isGameUnlocked, maxPlayers, canUse, isSingleMatchOnly } from 'bigd-shared'
isGameUnlocked('darts', 'bigd-cricket', ent) // false for free, true for pass
maxPlayers('dice', 6, ent)                    // free -> 1, pass -> 6
canUse('darts.set-match-tracking', ent)       // false for free
isSingleMatchOnly('cards', ent)               // true for free (cards)
```
```jsx
import { EntitlementProvider, useEntitlement } from 'bigd-shared/react'
// <EntitlementProvider app="darts" entitlement={ent}>...
const { canUse, isGameUnlocked, maxPlayers, isPass } = useEntitlement()
```
Entitlement input is forgiving: `undefined`/`null`/`'free'`/`'pass'`/`{ tier }` all work;
unknown -> free. Unknown game/feature ids **fail closed** (locked) and warn.

## Buildless
Ships raw ESM (no compile). The React entry uses `createElement`, not JSX, so a consumer's
Vite imports it from node_modules untransformed. `react` is an optional peer dep.

## Tests
`npm test` (node --test, no deps) — covers the resolver in `test/`.

## Distribution (DECIDED — public git dependency)
This repo is **public** and consumed as a pinned git dependency. Proven on the hub (bigd-app).
Cloudflare's Git-connected build runs `npm install`, which fetches it with no auth config.

### Consume in an app (3 steps)
1. **Add the dep** (pin a tag for reproducibility):
   ```jsonc
   // package.json
   "dependencies": { "bigd-shared": "github:DallasDarren/bigd-shared#v0.1.1" }
   ```
2. **Extend Tailwind content** so the shared classes are generated (REQUIRED — Tailwind
   doesn't scan node_modules by default; skip this and the Header renders unstyled):
   ```js
   // tailwind.config.js
   content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/bigd-shared/src/**/*.{js,jsx}']
   ```
3. **Brand it** (v0.3.0+): Tailwind preset, base CSS, dark ground, icons — see **Brand** below.
4. **Render the header** (set activeId to this app's id):
   ```jsx
   import { Header } from 'bigd-shared/react'
   <Header activeId="darts" />   // 'darts' | 'dice' | 'cards' | 'hub'
   ```
Bump the tag here when shared code changes, then update each app's pin.

## Brand (bigd. kit v1.0, locked 2026-10-18)
The brand kit lives in `BigDApps/brand` — its own **local-only** repo, gitignored by peanuts-lab,
so Cloudflare builds can't reach it. Rules: `BigDApps/brand/CLAUDE.md`; guide: `brand/index.html`.

**Copy mechanism.** bigd-shared (public, already a dependency of every app) carries the kit:
1. **Kit → bigd-shared:** `npm run sync-brand` (`scripts/sync-brand.mjs`) copies the kit's built
   outputs into `brand/` (tokens.css/json, tailwind.preset.js, bigd-mark.js, fonts/, icons/,
   logo/*.svg), generates `brand/lockup.js` (inline lockup, ink → currentColor) and records the
   kit commit in `brand/KIT_VERSION`. Never edit `brand/` by hand. Then bump the version + tag.
2. **bigd-shared → app (code):** imported from `node_modules` at build time, nothing to copy:
   ```js
   // tailwind.config.js
   import { bigdPreset } from 'bigd-shared/tailwind'
   export default { presets: [bigdPreset('darts')], content: [...] }
   ```
   ```css
   /* src/index.css, before @tailwind */
   @import 'bigd-shared/brand.css';
   body { background-color: var(--bigd-bg); color: var(--bigd-text); font-family: var(--bigd-font-sans); }
   ```
   Dark-ground apps (all scorekeepers) put `data-theme="dark"` on `<html>`; the hub follows the
   system theme.
3. **bigd-shared → app (icons):** static files the HTML/manifest point at, so they're copied and
   **committed** in each app (a deploy never depends on the script running):
   `node node_modules/bigd-shared/scripts/install-icons.mjs <bigd|darts|dice|cards|shoebox> public`
   → `public/favicon.svg` (favicon master relit in the app's colour), `public/icons/app.svg`,
   `app-192.png`, `app-512.png`, `maskable-512.png`, `apple-touch-180.png` (+ `favicon.ico` for the hub).
4. **Apps without the dependency** (Dice Live: its Docker build has no git) vendor a copy:
   `node ../../bigd-shared/scripts/vendor-brand.mjs client/vendor/bigd-shared` (same layout).

**`bigdPreset(app, { remap })`** adds `accent` = the app's light (`text-accent` uses the light's
on-dark shade), theme-aware `ui-*` colours (ui-bg, ui-surface, ui-text, ui-muted, ui-line,
ui-chip, ui-tile, ui-accent, ui-accent-text), and with `remap` (default on) maps `gray-*` onto
the brand's warm neutrals and restores Tailwind's `rounded-sm/md/lg/xl` (the kit's radius names
collide with the built-ins). The hub, written for the kit, uses `{ remap: false }`.

**Header** = the kit lockup (links to the hub) + one pill per app with its mark; the active pill
is inverted, inactive pills show only their mark below `sm`. `Mark` renders the kit's `markSVG`.
App ids: the sites directory uses `hub` for the hub; its `app` field is the kit id (`bigd`).

**When the kit changes:** rebuild the kit → `npm run sync-brand` here → `npm test` → bump version,
commit, tag, push → in each app bump the pin, re-run `install-icons.mjs` (and `vendor-brand.mjs`
for Dice Live), build, commit, push.

## Own repo
`DallasDarren/bigd-shared`. Gitignored by the parent peanuts-lab repo via `BigDApps/*/`.
