import {attrValue, elementInner} from '../lib/scan.mjs'

export const rule = 4
export const title = 'Never nest an editable inside a text/plain editable'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    for (const tag of ctx.tagsFor(file)) {
      const editable = attrValue(tag.attrs, 'data-ohw-editable')
      // An editable inside another is only destructive when the outer mode rewrites the
      // element's contents. `text` and `plain` write innerHTML, so anything nested inside is gone
      // on the next save. `image`, `bg-image` and `video` set a src or a background instead and
      // are perfectly good containers — a full-bleed section that is itself the bg-image and holds
      // an editable headline is the common case, not a mistake.
      if ((editable === 'text' || editable === 'plain') && src[tag.end - 1] !== '/') {
        const inner = elementInner(src, tag, {exact: true})
        if (inner !== null && /data-ohw-editable=/.test(inner)) {
          report('error', `\`data-ohw-editable="${editable}"\` wraps another editable — the outer one's innerHTML overwrites it`, file, tag.line)
        }
      }
    }
  }
}
