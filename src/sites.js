// The BigD Apps directory — the single source of truth for every app in the suite:
// its id, names, and where it lives. The hub, the shared Header, and (later) the
// marketing site all read from here so links never drift.
//
// URLs are the public BETA custom domains (beta.bigd.app). At full launch, swap each
// `url` to its production bigd.app subdomain — this is the ONE place to do it:
//   hub -> https://bigd.app   darts -> https://darts.bigd.app   etc.

export const HUB_ID = 'hub'

export const SITES = Object.freeze([
  {
    id: 'hub',
    name: 'BigD Apps',
    short: 'Home',
    emoji: '🏠',
    tagline: 'Mobile scorekeepers for game night.',
    url: 'https://beta.bigd.app/',
  },
  {
    id: 'darts',
    name: 'BigD Darts',
    short: 'Darts',
    emoji: '🎯',
    tagline: '301, Cricket, BigD Cricket, Around the Clock, Shanghai.',
    url: 'https://darts.beta.bigd.app/',
  },
  {
    id: 'dice',
    name: 'BigD Dice',
    short: 'Dice',
    emoji: '🎲',
    tagline: 'Big 5 and Ship Captain Crew.',
    url: 'https://dice.beta.bigd.app/',
  },
  {
    id: 'cards',
    name: 'BigD Cards',
    short: 'Cards',
    emoji: '🃏',
    tagline: 'Rum 1000 and 7 Card Gin.',
    url: 'https://cards.beta.bigd.app/',
  },
])

/** The app entries only (everything except the hub). */
export const APP_SITES = Object.freeze(SITES.filter((s) => s.id !== HUB_ID))

export function siteById(id) {
  return SITES.find((s) => s.id === id) || null
}
