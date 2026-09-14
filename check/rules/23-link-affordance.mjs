import {attrValue, isChromeFile} from '../lib/scan.mjs'

export const rule = 23
export const title = 'Fixed links carry role="button" + drag-disabled, not the generic item machinery'

/**
 * An anchor with `data-ohw-href-key` and no `data-ohw-role` is a navigation item to the bridge —
 * it gets the reorderable-item treatment. That is right for nav menus, footer columns and socials
 * (which must stay role-less so reorder works) and wrong for fixed links: section CTAs, pricing
 * buttons, inline links. Those want the two-phase select + link-toolbar treatment:
 * `data-ohw-role="button"` + `data-ohw-drag-disabled="true"` alongside the href key.
 *
 * Only the clear case is flagged deterministically: an href-keyed anchor in a NON-chrome file
 * with no role and no social markers. Inside chrome files role-less links are usually the point
 * (menus, footer columns), and telling a footer legal link from a footer column link is intent —
 * the AI review's job, not this rule's.
 */
export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    if (isChromeFile(ctx.rel(file))) continue
    for (const tag of ctx.tagsFor(file)) {
      if (tag.name !== 'a' && tag.name !== 'Link') continue
      if (!/data-ohw-href-key/.test(tag.attrs)) continue
      if (attrValue(tag.attrs, 'data-ohw-role') !== null) continue
      if (/social/i.test(tag.attrs)) continue
      report('error', 'href-keyed link without `data-ohw-role` — gets drag/duplicate/delete item machinery; fixed links take `data-ohw-role="button"` + `data-ohw-drag-disabled="true"`', file, tag.line)
    }
  }
}
