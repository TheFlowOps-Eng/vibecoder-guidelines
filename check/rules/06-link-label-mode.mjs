import {attrValue, elementInner} from '../lib/scan.mjs'

export const rule = 6
export const title = "A link's label must be `text` — `plain` hides it from nav-item detection"

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    for (const tag of ctx.tagsFor(file)) {
      // Scoped to the anchor's own markup, and only for links that are actually nav items: a logo
      // root and a social link are recognised by other means (roles, icon content) and legitimately
      // carry no text label.
      // The href-key is often a template literal, so test the raw attribute text too — a resolved
      // value of `{expr}` says nothing about whether this is a social link.
      const hrefKey = attrValue(tag.attrs, 'data-ohw-href-key')
      const role = attrValue(tag.attrs, 'data-ohw-role')
      const looksSocial = /social/i.test(tag.attrs) || /aria-label=\{?\s*social/i.test(tag.attrs)
      if (hrefKey !== null && role !== 'logo' && !looksSocial) {
        const inner = elementInner(src, tag)
        const firstMode = /data-ohw-editable="([^"]+)"/.exec(inner)
        if (firstMode && firstMode[1] === 'plain') {
          report('error', 'link label uses `plain` — the bridge only treats `text` labels as nav items', file, tag.line)
        }
      }
    }
  }
}
