# BigD Apps — bigd-shared

Shared code for the BigD Apps suite. **v0.1 = the entitlement model only.** Shared UI
(scoreboard, rules-page renderer) will be added here later per the taxonomy in
`BigDApps/CLAUDE.md`.

## What's in it
- `bigd-shared` / `bigd-shared/entitlements` — framework-free entitlement API.
- `bigd-shared/react` — `EntitlementProvider` + `useEntitlement()` (JSX-free, buildless).

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
3. **Render the header** (set activeId to this app's id):
   ```jsx
   import { Header } from 'bigd-shared/react'
   <Header activeId="darts" />   // 'darts' | 'dice' | 'cards' | 'hub'
   ```
Bump the tag here when shared code changes, then update each app's pin.

## Own repo
`DallasDarren/bigd-shared`. Gitignored by the parent peanuts-lab repo via `BigDApps/*/`.
