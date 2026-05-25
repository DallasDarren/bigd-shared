// BigD Apps entitlement catalog — the in-code encoding of BigDApps/FREEMIUM.md.
// SOURCE OF TRUTH for what is Free vs BigD Pass. When FREEMIUM.md changes, change here.
//
// Model: ONE BigD Pass unlocks Pro across all apps. FREE vs PASS is a runtime
// entitlement, never separate codebases. Gating is by GAME and by FEATURE.
//
// Free = "the scoreboard for this one game on this one device" (no account, last
// result only). Pass = everything that persists / scales / adds boards.

export const TIERS = Object.freeze({
  FREE: 'free',
  PASS: 'pass',
})

// Game ids below MUST match each app's own game registry:
//   Darts: src/games + routes ('301','cricket','bigd-cricket','around-the-clock','shanghai')
//   Dice:  src/games/catalog.js ('big5','scc')
//   Cards: src/games/index.js  ('rum1000','sevencardgin')
//
// Per-app feature keys (the Pro capabilities that gate behind the Pass). These are
// referenced as '<app>.<feature>' by canUse(), e.g. 'darts.set-match-tracking'.
export const CATALOG = Object.freeze({
  darts: {
    label: 'BigD Darts',
    freeGames: ['301', 'cricket'],
    proGames: ['bigd-cricket', 'around-the-clock', 'shanghai'],
    freeMaxPlayers: 2, // chalkboard: 2-up, challengers waiting
    features: ['x01-high-start', 'more-players', 'set-match-tracking', 'history', 'stats', 'rosters', 'sync'],
  },
  dice: {
    label: 'BigD Dice',
    freeGames: ['big5'],
    proGames: ['scc'],
    freeMaxPlayers: 1, // your own scorecard (solo); the full table is Pro
    features: ['more-players', 'history', 'stats', 'rosters', 'sync'],
  },
  cards: {
    label: 'BigD Cards',
    freeGames: ['rum1000', 'sevencardgin'],
    proGames: [],
    freeMaxPlayers: 2,
    freeSingleMatchOnly: true, // free: play one match, nothing saved
    features: ['more-players', 'match-history', 'series-tracking', 'history', 'stats', 'rosters', 'sync'],
  },
})

export const APPS = Object.freeze(Object.keys(CATALOG))

// The default entitlement everyone gets pre-account / pre-launch. This is also the
// PRODUCTION default for the free-only soft launch: no Pass = free tier.
export const DEFAULT_ENTITLEMENT = Object.freeze({ tier: TIERS.FREE })
