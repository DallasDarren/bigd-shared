// bigd. tile-D mark — GENERATED from tokens.json by tools/build_kit.py. Do not edit.
// Rule 1: only the top-right tile is lit, in the app's light. Full house = BigD Pass only.
export const LIGHTS = {"green": "#00b371", "coral": "#ff5a4e", "blue": "#3b6cff", "amber": "#ffb020", "violet": "#8b5cf6"};
export const APP_LIGHTS = {"bigd": "green", "darts": "coral", "dice": "blue", "cards": "amber", "shoebox": "violet"};
export const FULL_HOUSE = {"tl": "#3b6cff", "tr": "#00b371", "bl": "#ffb020", "br": "#ff5a4e"};
const G = {"inset": 16, "tile": 31, "gap": 6, "radius": 6};

/**
 * markSVG({ app, light, pass, tiles, bg, size, title }) -> SVG string
 *  app:   'bigd' | 'darts' | 'dice' | 'cards' | 'shoebox'  (picks the light)
 *  light: a LIGHTS key or a hex, overrides app
 *  pass:  true = Full house (BigD Pass only)
 *  tiles: tile colour, default 'currentColor' (so CSS color drives it)
 *  bg:    optional rounded-square background (app-icon look)
 */
export function markSVG({ app = 'bigd', light, pass = false, tiles = 'currentColor', bg, size, title = 'bigd.' } = {}) {
  const lit = pass ? FULL_HOUSE : { tr: LIGHTS[light] || light || LIGHTS[APP_LIGHTS[app]] };
  const t = G.tile, g = G.gap, r = G.radius, a = G.inset, b = a + t + g;
  const f = (c) => lit[c] || tiles;
  const wh = size ? ` width="${size}" height="${size}"` : '';
  const box = bg ? `<rect width="100" height="100" rx="22" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bg ? '0 0 100 100' : `${a} ${a} ${2 * t + g} ${2 * t + g}`}"${wh} role="img" aria-label="${title}">` +
    box +
    `<rect x="${a}" y="${a}" width="${t}" height="${t}" rx="${r}" fill="${f('tl')}"/>` +
    `<rect x="${a}" y="${b}" width="${t}" height="${t}" rx="${r}" fill="${f('bl')}"/>` +
    `<path d="M${b} ${a}A${t} ${t} 0 0 1 ${b + t} ${a + t}H${b}Z" fill="${f('tr')}"/>` +
    `<path d="M${b} ${b}H${b + t}A${t} ${t} 0 0 1 ${b} ${b + t}Z" fill="${f('br')}"/>` +
    `</svg>`;
}
