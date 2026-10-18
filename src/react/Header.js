// BigD Apps suite header — the persistent navigation shared across the hub and every
// app. Sticky to the top so it never leaves the viewport. The bigd. lockup is the
// anchor (links to the hub); the app pills sit alongside, each with its own mark, the
// active one inverted.
//
// Styled with the brand kit: ink/bone via the theme-aware ui-* colours (so it follows
// data-theme / prefers-color-scheme), Sora, the kit's lockup and tile-D marks.
//
// JSX-free (createElement) on purpose: this ships as raw ESM so a consuming app's
// Vite imports it from node_modules without a build step.
//
// Props:
//   activeId   - id of the current site ('hub' | 'darts' | 'dice' | 'cards'); lights its pill
//   sites      - override the directory (defaults to the shared SITES)
//   feedbackUrl- optional; when set, shows a "Feedback" button (mailto: or a form URL)
//   feedbackLabel - button text (default "Feedback")
//
// Requires in the consuming app: Tailwind with bigdPreset (bigd-shared/tailwind), content
// scanning node_modules/bigd-shared/src, and bigd-shared/brand.css imported (fonts + tokens).

import { createElement as h } from 'react'
import { SITES, HUB_ID } from '../sites.js'
import { LOCKUP_SVG } from '../../brand/lockup.js'
import { Mark } from './Mark.js'

function Brand({ hubUrl, isHome }) {
  const logo = h('span', {
    key: 'l',
    className: 'block h-[22px] w-[78px] text-ui-tile [&>svg]:h-full [&>svg]:w-full',
    dangerouslySetInnerHTML: { __html: LOCKUP_SVG },
  })
  // On the hub itself the brand isn't a link (you're already home).
  if (isHome) {
    return h('span', { className: 'flex items-center shrink-0', 'aria-current': 'page' }, logo)
  }
  return h(
    'a',
    {
      href: hubUrl,
      className: 'flex items-center shrink-0 rounded-sm transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ui-accent',
      'aria-label': 'BigD Apps home',
    },
    logo,
  )
}

function Pill({ site, active }) {
  const base =
    'shrink-0 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-small font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent'
  const on = 'bg-ui-text text-ui-bg'
  const off = 'bg-ui-chip text-ui-text hover:bg-ui-line'
  return h(
    'a',
    {
      href: site.url,
      className: `${base} ${active ? on : off}`,
      'aria-current': active ? 'page' : undefined,
      'aria-label': active ? undefined : site.name,
    },
    [
      h(Mark, { key: 'm', app: site.app, size: 20 }),
      // Narrow screens: only the active pill keeps its name; the others show their mark.
      h('span', { key: 't', className: active ? 'pr-1' : 'hidden pr-1 sm:inline' }, site.short),
    ],
  )
}

export function Header({ activeId = null, sites = SITES, feedbackUrl, feedbackLabel = 'Feedback' }) {
  const hub = sites.find((s) => s.id === HUB_ID)
  const apps = sites.filter((s) => s.id !== HUB_ID)
  const active = sites.find((s) => s.id === activeId)

  const pills = apps.map((s) =>
    h(Pill, { key: s.id, site: s, active: s.id === activeId }),
  )

  const feedback = feedbackUrl
    ? h(
        'a',
        {
          key: 'fb',
          href: feedbackUrl,
          className:
            'shrink-0 ml-1 rounded-pill px-3 py-1.5 text-small font-semibold text-ui-text ring-1 ring-ui-line hover:bg-ui-chip transition',
        },
        feedbackLabel,
      )
    : null

  return h(
    'header',
    {
      'data-app': active ? active.app : 'bigd',
      className:
        'sticky top-0 z-50 font-sans border-b border-ui-line bg-ui-bg supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bigd-bg)_88%,transparent)] supports-[backdrop-filter]:backdrop-blur-md',
    },
    h(
      'div',
      { className: 'mx-auto w-full max-w-3xl px-4 h-14 flex items-center gap-3' },
      [
        h(Brand, { key: 'brand', hubUrl: hub ? hub.url : '/', isHome: activeId === HUB_ID }),
        h(
          'nav',
          {
            key: 'nav',
            'aria-label': 'BigD Apps',
            className:
              'flex items-center gap-1.5 overflow-x-auto whitespace-nowrap ml-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          },
          feedback ? [...pills, feedback] : pills,
        ),
      ],
    ),
  )
}
