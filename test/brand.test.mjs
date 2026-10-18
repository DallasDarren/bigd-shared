import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { bigdPreset, appLight, BRAND_GRAYS } from '../src/tailwind.js'
import { markSVG } from '../brand/bigd-mark.js'
import { LOCKUP_SVG } from '../brand/lockup.js'

test('each app gets its own light; text uses the on-dark shade', () => {
  assert.deepEqual(appLight('darts'), { name: 'coral', hex: '#ff5a4e', onLight: '#c2362b', onDark: '#ff6b60' })
  const p = bigdPreset('dice')
  assert.equal(p.theme.extend.colors.accent, '#3b6cff')
  assert.equal(p.theme.extend.textColor.accent, '#7b9bff')
  assert.equal(bigdPreset('bigd').theme.extend.colors.accent, '#00b371')
  assert.throws(() => bigdPreset('nope'))
})

test('remap is on by default and off for kit-native code', () => {
  assert.equal(bigdPreset('cards').theme.extend.colors.gray, BRAND_GRAYS)
  assert.equal(bigdPreset('cards').theme.extend.borderRadius.xl, '0.75rem')
  const native = bigdPreset('bigd', { remap: false }).theme.extend
  assert.equal(native.colors.gray, undefined)
  assert.equal(native.borderRadius, undefined)
})

test('mark lights only the top-right tile in the app colour', () => {
  const svg = markSVG({ app: 'darts' })
  assert.equal((svg.match(/#ff5a4e/g) || []).length, 1)
  assert.equal((svg.match(/currentColor/g) || []).length, 3)
})

test('inline lockup keeps green, swaps ink for currentColor', () => {
  assert.ok(!LOCKUP_SVG.includes('#0b0b0c'))
  assert.equal((LOCKUP_SVG.match(/#00b371/g) || []).length, 2)
})

test('brand copy matches the kit version file', () => {
  assert.match(readFileSync(new URL('../brand/KIT_VERSION', import.meta.url), 'utf8'), /kit commit: \w+/)
})
