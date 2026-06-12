import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  isGameUnlocked,
  maxPlayers,
  canUse,
  isSingleMatchOnly,
  isPass,
  tierOf,
  listGames,
} from '../src/entitlements/index.js'

const FREE = { tier: 'free' }
const PASS = { tier: 'pass' }

test('entitlement input is forgiving', () => {
  assert.equal(tierOf(undefined), 'free')
  assert.equal(tierOf(null), 'free')
  assert.equal(tierOf('pass'), 'pass')
  assert.equal(tierOf('garbage'), 'free')
  assert.equal(isPass({ tier: 'pass' }), true)
})

test('darts: free games open, pro games gated', () => {
  assert.equal(isGameUnlocked('darts', '301', FREE), true)
  assert.equal(isGameUnlocked('darts', 'cricket', FREE), true)
  assert.equal(isGameUnlocked('darts', 'bigd-cricket', FREE), false)
  assert.equal(isGameUnlocked('darts', 'shanghai', FREE), false)
  assert.equal(isGameUnlocked('darts', 'bigd-cricket', PASS), true)
})

test('dice: only big5 free, scc gated', () => {
  assert.equal(isGameUnlocked('dice', 'big5', FREE), true)
  assert.equal(isGameUnlocked('dice', 'scc', FREE), false)
  assert.equal(isGameUnlocked('dice', 'scc', PASS), true)
})

test('cards: rum200 + gin free, single-match cap on free only', () => {
  assert.equal(isGameUnlocked('cards', 'rum200', FREE), true)
  assert.equal(isGameUnlocked('cards', 'sevencardgin', FREE), true)
  assert.equal(isSingleMatchOnly('cards', FREE), true)
  assert.equal(isSingleMatchOnly('cards', PASS), false)
  assert.equal(isSingleMatchOnly('darts', FREE), false) // not a cards-style cap
})

test('cards: cribbage, canasta, golf are Pass-gated', () => {
  for (const g of ['cribbage', 'canasta', 'golf']) {
    assert.equal(isGameUnlocked('cards', g, FREE), false)
    assert.equal(isGameUnlocked('cards', g, PASS), true)
  }
})

test('player caps per app', () => {
  assert.equal(maxPlayers('darts', 8, FREE), 2)
  assert.equal(maxPlayers('dice', 6, FREE), 1)
  assert.equal(maxPlayers('cards', 6, FREE), 2)
  assert.equal(maxPlayers('dice', 6, PASS), 6)
  assert.equal(maxPlayers('dice', null, PASS), Infinity)
})

test('canUse: pro features gated, scoped and bare keys', () => {
  assert.equal(canUse('darts.set-match-tracking', FREE), false)
  assert.equal(canUse('darts.set-match-tracking', PASS), true)
  assert.equal(canUse('history', FREE), false) // bare key, known to multiple apps
  assert.equal(canUse('history', PASS), true)
  assert.equal(canUse('darts.nonexistent', PASS), false) // unknown -> locked
  assert.equal(canUse('', PASS), false)
})

test('unknown game fails closed', () => {
  assert.equal(isGameUnlocked('darts', 'made-up', PASS), false)
})

test('listGames splits by tier', () => {
  const d = listGames('darts')
  assert.deepEqual(d.free, ['301', 'cricket'])
  assert.equal(d.all.length, 5)
})

test('unknown app throws', () => {
  assert.throws(() => isGameUnlocked('chess', 'x', FREE))
})
