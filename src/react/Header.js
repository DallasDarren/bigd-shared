// BigD Apps suite header — the persistent navigation shared across the hub and every
// app. Sticky to the top so it never leaves the viewport. BigD Apps brand is the
// anchor (links to the hub); the app pills sit alongside with the active one lit.
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
// Requires Tailwind in the consuming app (all four apps + hub already use it).

import { createElement as h } from 'react'
import { SITES, HUB_ID } from '../sites.js'

function Brand({ hubUrl, isHome }) {
  const inner = [
    h('span', { key: 't', className: 'font-extrabold tracking-tight text-lg' }, [
      'BigD ',
      h('span', { key: 'a', className: 'text-emerald-400' }, 'Apps'),
    ]),
  ]
  // On the hub itself the brand isn't a link (you're already home).
  if (isHome) {
    return h('span', { className: 'flex items-center gap-2 shrink-0', 'aria-current': 'page' }, inner)
  }
  return h(
    'a',
    {
      href: hubUrl,
      className: 'flex items-center gap-2 shrink-0 hover:opacity-90 transition',
      'aria-label': 'BigD Apps home',
    },
    inner,
  )
}

function Pill({ site, active }) {
  const base =
    'shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition border'
  const on = 'bg-emerald-500 text-gray-900 border-emerald-400'
  const off = 'bg-gray-800 text-gray-200 border-gray-700 hover:border-emerald-500'
  return h(
    'a',
    {
      href: site.url,
      className: `${base} ${active ? on : off}`,
      'aria-current': active ? 'page' : undefined,
    },
    [
      h('span', { key: 'e', 'aria-hidden': 'true', className: 'mr-1' }, site.emoji),
      site.short,
    ],
  )
}

export function Header({ activeId = null, sites = SITES, feedbackUrl, feedbackLabel = 'Feedback' }) {
  const hub = sites.find((s) => s.id === HUB_ID)
  const apps = sites.filter((s) => s.id !== HUB_ID)

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
            'shrink-0 ml-1 rounded-full px-3 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-700 hover:bg-emerald-500/10 transition',
        },
        [h('span', { key: 'i', 'aria-hidden': 'true', className: 'mr-1' }, '💬'), feedbackLabel],
      )
    : null

  return h(
    'header',
    {
      className:
        'sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 supports-[backdrop-filter]:bg-gray-900/80',
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
              'flex items-center gap-2 overflow-x-auto whitespace-nowrap ml-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          },
          feedback ? [...pills, feedback] : pills,
        ),
      ],
    ),
  )
}
