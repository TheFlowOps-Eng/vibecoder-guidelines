import {attrValue, isChromeFile} from '../lib/scan.mjs'

export const rule = 7
export const title = 'Every nav item carries its own data-ohw-href-key'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    if (!isChromeFile(ctx.rel(file))) continue
    for (const tag of ctx.tagsFor(file)) {
      // Without an href key the AI cannot see or rewire that link, and it cannot be reordered.
      if (tag.name !== 'Link' && tag.name !== 'a') continue
      const role = attrValue(tag.attrs, 'data-ohw-role')
      const hasHref = attrValue(tag.attrs, 'data-ohw-href-key') !== null
      const isLogo = role === 'logo' || /aria-label/.test(tag.attrs) === false && /logo/i.test(tag.attrs)
      const isAnchorOnly = /href="#/.test(tag.attrs)
      if (!hasHref && !isLogo && !isAnchorOnly && !/social/i.test(tag.attrs)) {
        report('warn', 'nav link without `data-ohw-href-key` — invisible to the AI, not reorderable', file, tag.line)
      }
    }
  }
}
