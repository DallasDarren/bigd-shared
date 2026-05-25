// Entitlement resolver for BigD Apps. Pure JS, no framework. The React binding
// lives in `bigd-shared/react`. See plans.js for the catalog (the encoded FREEMIUM.md).
//
// All functions accept an `entitlement` that may be:
//   - undefined / null            -> treated as free
//   - 'free' | 'pass' (string)    -> that tier
//   - { tier: 'free' | 'pass' }   -> that tier
// so callers can pass whatever they have without ceremony.

import { TIERS, CATALOG, APPS, DEFAULT_ENTITLEMENT } from './plans.js'

export { TIERS, CATALOG, APPS, DEFAULT_ENTITLEMENT }

/** Normalize any accepted entitlement input to { tier }. Unknown -> free. */
export function resolve(entitlement) {
  if (!entitlement) return { tier: TIERS.FREE }
  const tier = typeof entitlement === 'string' ? entitlement : entitlement.tier
  return { tier: tier === TIERS.PASS ? TIERS.PASS : TIERS.FREE }
}

export function tierOf(entitlement) {
  return resolve(entitlement).tier
}

export function isPass(entitlement) {
  return resolve(entitlement).tier === TIERS.PASS
}

function appConfig(app) {
  const cfg = CATALOG[app]
  if (!cfg) throw new Error(`bigd-shared: unknown app "${app}". Known: ${APPS.join(', ')}`)
  return cfg
}

/** All game ids for an app, split by tier. */
export function listGames(app) {
  const cfg = appConfig(app)
  return {
    free: [...cfg.freeGames],
    pro: [...cfg.proGames],
    all: [...cfg.freeGames, ...cfg.proGames],
  }
}

/**
 * Is a specific game playable under this entitlement?
 * Free games are always unlocked; Pro games require the Pass.
 * Unknown game ids return false (fail closed) and warn.
 */
export function isGameUnlocked(app, gameId, entitlement) {
  const cfg = appConfig(app)
  if (cfg.freeGames.includes(gameId)) return true
  if (cfg.proGames.includes(gameId)) return isPass(entitlement)
  if (typeof console !== 'undefined') {
    console.warn(`bigd-shared: unknown game "${gameId}" for app "${app}" — treating as locked`)
  }
  return false
}

/**
 * Max players allowed under this entitlement.
 * Pass -> the engine's own max (engineMax, or Infinity if not provided).
 * Free -> the app's free cap (darts 2, dice 1, cards 2).
 */
export function maxPlayers(app, engineMax, entitlement) {
  const cfg = appConfig(app)
  if (isPass(entitlement)) return engineMax == null ? Infinity : engineMax
  return cfg.freeMaxPlayers
}

/**
 * Can this entitlement use a Pro feature?
 * featureKey is "<app>.<feature>" (e.g. "darts.set-match-tracking") or a bare
 * "<feature>" checked against every app's feature set (e.g. "history").
 * Every registered feature is a Pro capability, so this is effectively
 * "is this a real feature AND does the user hold the Pass". Unknown keys warn + fail closed.
 */
export function canUse(featureKey, entitlement) {
  if (!featureKey || typeof featureKey !== 'string') return false
  const dot = featureKey.indexOf('.')
  let known
  if (dot === -1) {
    known = APPS.some((a) => CATALOG[a].features.includes(featureKey))
  } else {
    const app = featureKey.slice(0, dot)
    const feature = featureKey.slice(dot + 1)
    known = !!CATALOG[app] && CATALOG[app].features.includes(feature)
  }
  if (!known) {
    if (typeof console !== 'undefined') {
      console.warn(`bigd-shared: unknown feature "${featureKey}" — treating as locked`)
    }
    return false
  }
  return isPass(entitlement)
}

/** Cards-specific: free is capped to a single, non-persisted match. */
export function isSingleMatchOnly(app, entitlement) {
  const cfg = appConfig(app)
  return !!cfg.freeSingleMatchOnly && !isPass(entitlement)
}
