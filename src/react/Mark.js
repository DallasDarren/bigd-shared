// The tile-D mark as a React element, drawn by the kit's own markSVG (brand/bigd-mark.js),
// so geometry and lighting rule 1 come straight from the kit. Unlit tiles are currentColor:
// give the wrapper an ink (light ground) or bone (dark ground) text colour.
//
//   <Mark app="darts" size={20} />    top-right tile lit coral
//   <Mark pass />                      Full house, BigD Pass only
//   <Mark app="dice" bg="#0b0b0c" tiles="#f4f3ef" />   app-icon look (bone tiles on ink)
//
// Standard mark minimum is 20 px (kit rule); below that use the favicon master instead.

import { createElement as h } from 'react'
import { markSVG } from '../../brand/bigd-mark.js'

export function Mark({ app = 'bigd', pass = false, size = 24, bg, tiles, title, className = '' }) {
  return h('span', {
    className: `inline-flex shrink-0 ${className}`.trim(),
    role: title ? undefined : 'presentation',
    'aria-hidden': title ? undefined : 'true',
    dangerouslySetInnerHTML: { __html: markSVG({ app, pass, size, bg, tiles, title: title || '' }) },
  })
}
