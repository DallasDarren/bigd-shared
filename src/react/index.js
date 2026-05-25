// React binding for the entitlement model. Written with React.createElement (no JSX)
// so the package ships as raw ESM and needs no build step — a consuming app's Vite
// can import it from node_modules without transforming files here.
//
// Usage:
//   import { EntitlementProvider, useEntitlement } from 'bigd-shared/react'
//   <EntitlementProvider app="darts" entitlement={ent}> ... </EntitlementProvider>
//   const { canUse, isGameUnlocked, maxPlayers, isPass } = useEntitlement()
//
// `entitlement` defaults to free, which is the production default for the
// free-only soft launch. Wire a real value here once auth + Pass exist.

import { createContext, createElement, useContext, useMemo } from 'react'
import {
  resolve,
  isPass as _isPass,
  isGameUnlocked as _isGameUnlocked,
  maxPlayers as _maxPlayers,
  canUse as _canUse,
  isSingleMatchOnly as _isSingleMatchOnly,
  DEFAULT_ENTITLEMENT,
} from '../entitlements/index.js'

const EntitlementContext = createContext({ entitlement: DEFAULT_ENTITLEMENT, app: null })

export function EntitlementProvider({ app = null, entitlement, children }) {
  const value = useMemo(
    () => ({ app, entitlement: resolve(entitlement) }),
    [app, entitlement && entitlement.tier ? entitlement.tier : entitlement],
  )
  return createElement(EntitlementContext.Provider, { value }, children)
}

/**
 * Hook bound to the current entitlement (and optional default app from the provider).
 * App-scoped helpers accept an explicit `app` arg, or fall back to the provider's app.
 */
export function useEntitlement() {
  const { entitlement, app: defaultApp } = useContext(EntitlementContext)
  return useMemo(() => {
    const withApp = (app) => app || defaultApp
    return {
      tier: entitlement.tier,
      isPass: _isPass(entitlement),
      canUse: (featureKey) => _canUse(featureKey, entitlement),
      isGameUnlocked: (gameId, app) => _isGameUnlocked(withApp(app), gameId, entitlement),
      maxPlayers: (engineMax, app) => _maxPlayers(withApp(app), engineMax, entitlement),
      isSingleMatchOnly: (app) => _isSingleMatchOnly(withApp(app), entitlement),
    }
  }, [entitlement, defaultApp])
}
