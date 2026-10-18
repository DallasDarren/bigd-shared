// Tailwind v3 preset for a BigD app: the brand kit's preset plus this app's light.
//
//   // tailwind.config.js
//   import { bigdPreset } from 'bigd-shared/tailwind'
//   export default { presets: [bigdPreset('darts')], content: [...] }
//
// What it adds on top of the kit preset (brand/tailwind.preset.js: ink, bone, lights, Sora):
//   accent     - the app's light (bg-accent, ring-accent, bg-accent/15 ...). text-accent uses the
//                light's text-safe on-dark shade, because the scorekeepers are dark-ground apps.
//   remap      - (default on) lands an existing app's Tailwind-default classes on the brand
//                without touching its components:
//                  gray-* -> the brand's warm neutrals (900 = night bg, 800 = night panel,
//                            700 = night line, 400 = night muted, 50 = bone, 950 = ink)
//                  rounded-sm/md/lg/xl -> back to Tailwind's defaults. The kit's radius names
//                            collide with Tailwind's built-ins (its xl = 20px > Tailwind 2xl),
//                            which would re-round every existing button. Use rounded-pill and
//                            rounded-2xl (16px = the kit's card radius) for brand shapes.
//                Pass { remap: false } in code written for the kit (the hub): the kit's own
//                radius scale applies and gray stays Tailwind's.
//   ui-*       - theme-aware colours from tokens.css (ui-bg, ui-surface, ui-text, ui-muted,
//                ui-line, ui-chip, ui-tile, ui-accent, ui-accent-text). These follow
//                data-theme / prefers-color-scheme; the shared Header uses them.

import kit from '../brand/tailwind.preset.js'
import { APP_LIGHTS } from '../brand/bigd-mark.js'

export const BRAND_GRAYS = Object.freeze({
  50: '#f4f3ef', // bone
  100: '#eceae4', // chip
  200: '#e2e0da', // line
  300: '#c9c8c4',
  400: '#9c9ca3', // night muted
  500: '#6b6b70', // graphite
  600: '#45454a',
  700: '#2a2a2e', // night line
  800: '#18181a', // night panel
  900: '#0f0f10', // night bg
  950: '#0b0b0c', // ink
})

export const UI_COLORS = Object.freeze({
  bg: 'var(--bigd-bg)',
  surface: 'var(--bigd-surface)',
  text: 'var(--bigd-text)',
  muted: 'var(--bigd-muted)',
  line: 'var(--bigd-line)',
  chip: 'var(--bigd-chip)',
  tile: 'var(--bigd-tile)',
  accent: 'var(--bigd-accent)',
  'accent-text': 'var(--bigd-accent-text)',
})

/** The light (hex + text-safe shades) for a brand app id: bigd | darts | dice | cards | shoebox. */
export function appLight(app = 'bigd') {
  const name = APP_LIGHTS[app]
  if (!name) throw new Error(`bigdPreset: unknown app "${app}" (use ${Object.keys(APP_LIGHTS).join(', ')})`)
  const c = kit.theme.extend.colors[name]
  return { name, hex: c.DEFAULT, onLight: c['on-light'], onDark: c['on-dark'] }
}

const TAILWIND_RADII = { sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem' }

export function bigdPreset(app = 'bigd', { remap = true } = {}) {
  const light = appLight(app)
  return {
    presets: [kit],
    theme: {
      extend: {
        colors: {
          accent: light.hex,
          ui: UI_COLORS,
          ...(remap ? { gray: BRAND_GRAYS } : {}),
        },
        textColor: { accent: light.onDark },
        ...(remap ? { borderRadius: TAILWIND_RADII } : {}),
      },
    },
  }
}

export default bigdPreset
