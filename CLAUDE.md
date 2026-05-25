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

## Distribution (DECIDE at step 2 — wiring apps)
Each BigD app is its own repo with a Git-connected Cloudflare build that runs `npm install`.
To consume this package across repos, options: (a) public git dependency
(`"bigd-shared": "github:DallasDarren/bigd-shared#<tag>"`) — trivial in CI, but the repo must
be public; (b) private + a CI token / .npmrc; (c) publish to a registry. Not wired yet.

## Own repo
`DallasDarren/bigd-shared`. Gitignored by the parent peanuts-lab repo via `BigDApps/*/`.
